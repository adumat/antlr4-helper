import {AntlrFactory} from '../factory/antlr-factory';
import {ParserRuleContext, CommonTokenStream, InputStream, Token, Lexer} from 'antlr4';
import {ErrorNode, ErrorNodeImpl, ParseTreeListener, TerminalNode} from 'antlr4/tree/Tree';
import {Subject} from 'rxjs/index';
import {filter} from 'rxjs/operators';
import {AntlrRuleClass} from '../types/types';
import * as _ from 'lodash';
import {AntlrParserWrapper} from './antlr-parser-wrapper';
import {RuleTable} from './rule-table';
import {createBuffer, createTextRange, ImmutableTextRange, TextBuffer} from 'text-manipulation';
import {ErrorRuleHandler} from './error-rule-handler';
import {AntlrRuleError} from './antlr-rule-error';
import {LexErrorHandler} from './lex-error-handler';
import {AntlrRange} from '../';
import {TokenTable} from './token-table';
import {AntlrRuleWrapper} from './antlr-rule-wrapper';
import {AntlrTokenWrapper} from './antlr-token-wrapper';
import {AntlrParser} from './antlr-parser';
import {ImmutableAntlrTokenWrapper} from './immutable-antlr-token-wrapper';
import {ImmutableAntlrRuleWrapper} from './immutable-antlr-rule-wrapper';
import {FunctionalRuleParser} from './functional-rule-parser';
import {XPath} from '../xpath/xpath';

export class ImmutableAntlrParser implements ParseTreeListener, AntlrParser {

    private inputStream: InputStream;
    private tokenSubject: Subject<Token>;
    private enterRuleSubject: Subject<ParserRuleContext>;
    private exitRuleSubject: Subject<ParserRuleContext>;
    private parseCompleteSubject: Subject<void>;
    private parseStartedSubject: Subject<void>;
    private customValidatorSubject: Subject<ParserRuleContext>;
    private parserWrapper: AntlrParserWrapper;
    private ruleTable: RuleTable;
    private tokenTable: TokenTable;
    private errorHandler: ErrorRuleHandler;
    private textBuffer: TextBuffer;
    private additionalStream: Array<CommonTokenStream>;
    private stack: ParserRuleContext[];
    private ruleWrapperStack: AntlrRuleWrapper[];
    private functionalRuleParser: FunctionalRuleParser;
    private rootRule: ParserRuleContext;
    private lexer: Lexer;
    private ruleIndexToNameMap: ReadonlyMap<number, string>;
    private tokenTypeToSymoblMap: ReadonlyMap<number, string>;

    /**
     * Provide an AntlrFactory to construct
     * @param {AntlrFactory} factory
     */
    constructor(private factory: AntlrFactory) {
        this.parseStartedSubject = new Subject<void>();
        this.tokenSubject = new Subject<Token>();
        this.enterRuleSubject = new Subject<ParserRuleContext>();
        this.exitRuleSubject = new Subject<ParserRuleContext>();
        this.customValidatorSubject = new Subject<ParserRuleContext>();
        this.parseCompleteSubject = new Subject<void>();
    }

    getInputStream(): InputStream {
        return this.inputStream;
    }

    setLexer(lexer: Lexer): void {
        this.lexer = lexer;
    }

    getFactory(): AntlrFactory {
        return this.factory;
    }

    getRoot(): AntlrRuleWrapper {
        return new ImmutableAntlrRuleWrapper(this.rootRule, this);
    }

    getAllRules(): AntlrRuleWrapper[] {
        return this.ruleWrapperStack;
    }

    getTokensOfAdditionalStreams(): AntlrTokenWrapper[] {
        const toRet: AntlrTokenWrapper[] = [];
        this.additionalStream.forEach((stream: CommonTokenStream) => {
            stream.tokens.map((token) => {
                if (token.channel === stream.channel) {
                    toRet.push(new ImmutableAntlrTokenWrapper(token, this));
                }
            });
        });
        return toRet;
    }

    getAllTokens(withAdditionalStream = false): AntlrTokenWrapper[] {
        const toRet = Array.from(this.tokenTable.tokenMap.keys()).map((token) => new ImmutableAntlrTokenWrapper(token, this));
        if (withAdditionalStream) {
            return this.getTokensOfAdditionalStreams().concat(toRet);
        }
        return toRet;
    }

    hasTextChanged(): boolean {
        return false;
    }

    reparse(): ParserRuleContext {
        return this.parse(this.getText());
    }

    doesRuleExist(rule: ParserRuleContext): boolean {
        return this.ruleTable.ruleMap.has(rule);
    }

    doesTokenExist(token: Token): boolean {
        return this.tokenTable.tokenMap.has(token);
    }

    /**
     * Parse the input string
     *
     * @param {string} input
     * @returns {ParserRuleContext} - the invoked root rule
     */
    parse(input: string): ParserRuleContext {
        this.stack = [];
        this.ruleWrapperStack = [];
        this.functionalRuleParser = new FunctionalRuleParser(this);
        this.inputStream = new InputStream(input);
        this.textBuffer = createBuffer(input);
        this.errorHandler = new ErrorRuleHandler(this, this.textBuffer);
        this.ruleTable = new RuleTable(this.textBuffer, this);
        this.tokenTable = new TokenTable(this.textBuffer, this);

        if (this.lexer === undefined) {
            this.lexer = this.factory.createLexer(this.inputStream);
        } else {
            this.lexer.inputStream = this.inputStream;
            this.lexer.reset();
        }

        const lexer = this.lexer;
        lexer.removeErrorListeners();
        lexer.addErrorListener(new LexErrorHandler(this.errorHandler));

        const tokenStream = new CommonTokenStream(lexer);
        this.additionalStream = this.factory.getAdditionalChannels(lexer);
        this.additionalStream.forEach(stream => {
            stream.fill();
            this.lexer.reset();
        });

        const parser = this.factory.createParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(this.errorHandler);

        this.parserWrapper = new AntlrParserWrapper(parser);
        this.ruleIndexToNameMap = this.parserWrapper.getRuleIndexToNameMap();
        this.tokenTypeToSymoblMap = this.parserWrapper.getTokenTypeToSymoblMap();

        parser.addParseListener(this);

        this.parseStartedSubject.next(null);
        const rootRule = this.factory.createAndInvokeRootRule(parser);
        this.parseCompleteSubject.next(null);

        this.getErrors().forEach((err) => {
            this.ruleTable.addToRuleMap(err.rule, [err.start, err.end]);
            if (err.rule) {
                this.errorHandler.processRuleWithError(err.rule);
            }
        });

        this.rootRule = rootRule;

        return rootRule;
    }

    getLineCount(): number {
        return this.textBuffer.getLineCount();
    }

    getColumnCount(line: number): number {
        return this.textBuffer.getColumnCount(line);
    }

    checkForErrors() {
        if (this.hasErrors()) {
            throw new SyntaxError(this.getRelevantError().message);
        }
    }

    /**
     * Get the range of a given token, where the first object
     * is the start position and the last is the end position
     *
     * @param {Token } token
     * @returns {AntlrRange}
     */
    getTokenRange(token: (Token)): AntlrRange {
        const text = this.tokenIntervalText(token);
        const table = text.split('\n');
        const lineCount = table.length;

        const start = {column: token.column, line: token.line - 1};
        const stop = {
            column: token.column + table[table.length - 1].length,
            line: (token.line - 1) + (lineCount - 1)
        };

        return [start, stop];

    }

    getTextRange(range: AntlrRange): string {
        return this.textBuffer.getRangeText(createTextRange(range[0], range[1]));
    }

    /**
     * Retrieve a token a the specified position
     *
     * @param {number} column
     * @param {number} line
     * @returns {Token}
     */
    getTokenAt(column: number, line: number): AntlrTokenWrapper | undefined {
        const token = this.tokenTable.getTokenAt(column, line);

        if (token) {
            return new ImmutableAntlrTokenWrapper(token, this);
        }

        return undefined;
    }

    /**
     * Get the text of a given token
     *
     * @param {Token} token
     * @returns {string}
     */
    getTokenText(token: (Token)): string {
        const range = this.getTokenRange(token);
        const textRange = new ImmutableTextRange(range);

        return this.textBuffer.getRangeText(textRange);
    }

    /**
     * Get the complete text of a completely parsed rule
     *
     * @param {ParserRuleContext} rule
     * @returns {string}
     */
    getRuleText(rule: ParserRuleContext): string {
        const start = rule.start.start;
        const stop = rule.stop.stop;

        return this.inputStream.getText(start, stop);
    }

    private tokenIntervalText(token: Token): string {
        return this.inputStream.getText(token.start, token.stop);
    }

    /**
     * Get the range of a given rule, where the first object
     * is the start position and the last is the end position
     *
     * @param {ParserRuleContext} rule
     * @returns {AntlrRange}
     */
    getRuleRange(rule: ParserRuleContext): AntlrRange {
        if (rule.start && rule.stop) {
            const start = {column: rule.start.column, line: rule.start.line - 1};
            const stopText = this.tokenIntervalText(rule.stop);
            const end = {column: rule.stop.column + stopText.length, line: rule.stop.line - 1};
            return [start, end];
        } else if (rule.start) {
            const start = {column: 0, line: rule.start.line - 1};
            const end = {column: rule.start.column, line: rule.start.line - 1};
            return [start, end];
        } else if (rule.stop) {
            const start = {column: 0, line: rule.stop.line - 1};
            const stopText = this.tokenIntervalText(rule.stop);
            const end = {column: rule.stop.column + stopText.length, line: rule.stop.line - 1};
            return [start, end];
        } else {
            const start = {column: 0, line: 0};
            return [start, start];
        }
    }

    /**
     * Checks if a rule matches the ruleClass given
     *
     * @param {ParserRuleContext} rule
     * @param {AntlrRuleClass<any>} ruleClass
     * @returns {boolean}
     */
    doesRuleMatchClass(rule: ParserRuleContext, ruleClass: AntlrRuleClass<any>): boolean {
        return ruleClass && rule && rule instanceof ParserRuleContext &&
            rule.constructor.name === ruleClass.name;
    }

    addParserStartListener(listener: () => void): void {
        this.parseStartedSubject.asObservable().subscribe(listener);
    }

    addParserCompleteListener(listener: () => void): void {
        this.parseCompleteSubject.asObservable().subscribe(listener);
    }

    addEnterRuleListener<T extends ParserRuleContext>(ruleClass: AntlrRuleClass<ParserRuleContext>, listener: (rule: T) => void) {
        if (ruleClass) {
            this.enterRuleSubject.asObservable()
                .pipe(filter(rule => this.doesRuleMatchClass(rule, ruleClass)))
                .subscribe(listener);
        } else {
            this.enterRuleSubject.asObservable().subscribe(listener);
        }
    }

    addExitRuleListener<T extends ParserRuleContext>(ruleClass: AntlrRuleClass<ParserRuleContext>, listener: (rule: T) => void) {
        if (ruleClass) {
            this.exitRuleSubject.asObservable()
                .pipe(filter(rule => this.doesRuleMatchClass(rule, ruleClass)))
                .subscribe(listener);
        } else {
            this.exitRuleSubject.asObservable().subscribe(listener);
        }
    }

    onParseStart(callback: () => void): void {
        this.parseStartedSubject.asObservable().subscribe(callback);
    }

    addTokenListener(listener: (token: Token) => void) {
        this.tokenSubject.asObservable().subscribe(listener);
    }

    addValidator(ruleName: string, validator: (rule: AntlrRuleWrapper) => AntlrRuleError | Array<AntlrRuleError> | undefined): void {
        this.customValidatorSubject.asObservable()
            .pipe(filter(rule => this.getRuleName(rule) === ruleName))
            .subscribe((rule) => {
                const wrapper = new ImmutableAntlrRuleWrapper(rule, this);
                const error = validator(wrapper);

                if (!_.isNil(error)) {
                    if (error instanceof Array) {
                        error.forEach((err: AntlrRuleError) => this.errorHandler.addError(err));
                    } else {
                        this.errorHandler.addError(error);
                    }
                }
            });
    }

    addCustomRuleValidator<T extends ParserRuleContext>(ruleClass: AntlrRuleClass<ParserRuleContext>, validator: (rule: T) => AntlrRuleError | Array<AntlrRuleError> | undefined) {
        this.customValidatorSubject.asObservable()
            .pipe(filter(rule => this.doesRuleMatchClass(rule, ruleClass)))
            .subscribe((rule) => {
                const error = validator(rule as any);

                if (!_.isNil(error)) {
                    if (error instanceof Array) {
                        error.forEach((err: AntlrRuleError) => this.errorHandler.addError(err));
                    } else {
                        this.errorHandler.addError(error);
                    }
                }
            });
    }

    getRulesInLine(line: number): Set<AntlrRuleWrapper> {
        const table = this.getRulePositionTable();

        if (table[line]) {
            const map = new Map<ParserRuleContext, AntlrRuleWrapper>();
            const set = table[line]
                .map((rule) => rule)
                .filter((rule) => rule !== undefined);
            const ruleSet = new Set(set);
            const wrapperSet = Array.from(ruleSet).map((rule) => new ImmutableAntlrRuleWrapper(rule, this));

            return new Set<AntlrRuleWrapper>(wrapperSet);
        }

        return new Set<AntlrRuleWrapper>([]);
    }

    getTokensInLine(line: number): Set<Token> {
        const table = this.getTokenPositionTable();

        if (table[line]) {
            const set = table[line].map((token) => token).filter((token) => token !== undefined);
            return new Set<Token>(set);
        }

        return new Set<Token>([]);
    }

    getLine(line: number): string {
        return this.textBuffer.getLine(line);
    }

    getSiblings(rule: ParserRuleContext): ParserRuleContext[] {
        const parent = rule.parentCtx;
        const children: ParserRuleContext[] = [];

        if (parent && parent.getChildCount() > 0) {
            for (let i = 0; i < parent.getChildCount(); i++) {
                const child = parent.getChild(i);
                if (rule !== child && child instanceof ParserRuleContext) {
                    children.push(child);
                }
            }
        }

        return children;
    }

    getRuleBefore(rule: ParserRuleContext): ParserRuleContext {
        const parent = rule.parentCtx;
        let choice: ParserRuleContext;

        if (parent && parent.getChildCount() > 0) {
            for (let i = 0; i < parent.getChildCount(); i++) {
                const child = parent.getChild(i);

                if (child && child === rule) {
                    return choice;
                }

                if (rule !== child && child instanceof ParserRuleContext) {
                    choice = rule;
                }
            }
        }

        return undefined;
    }

    siblingsHaveNoErrors(rule: ParserRuleContext): boolean {
        const siblings = this.getSiblings(rule);

        for (const sibling of siblings) {
            if (sibling.exception || this.hasErrorNode(sibling)) {
                return false;
            }

        }

        return true;
    }

    hasErrorNode(ctx: ParserRuleContext): boolean {
        const n = ctx.getChildCount();
        for (let i = 0; i < n; i++) {
            const child = ctx.getChild(i);

            if (child instanceof ErrorNodeImpl) {
                return true;
            }
        }

        return false;
    }

    getRuleStack(): ReadonlyArray<ParserRuleContext> {
        return this.stack;
    }

    getText(): string {
        if (this.textBuffer) {
            return this.textBuffer.getText();
        } else {
            return '';
        }
    }

    getErrors(): AntlrRuleError[] {
        if (this.errorHandler) {
            return this.errorHandler.getErrors().filter((err) => err.severity === 'error');
        }

        return [];
    }

    getWarnings(): AntlrRuleError[] {
        if (this.errorHandler) {
            return this.errorHandler.getErrors().filter((err) => err.severity === 'warning');
        }

        return [];
    }

    comparePositions(a: { column: number, line: number }, b: { column: number, line: number }): number {
        return (a.line - b.line) || (a.column - b.column);
    }

    getTokenPositionTable(): Token[][] {
        return this.tokenTable.tokenTable;
    }

    getRulePositionTable(): ParserRuleContext[][] {
        return this.ruleTable.ruleTable;
    }

    getErrorRuleAt(column: number, line: number): AntlrRuleWrapper {
        const rule = this.errorHandler.getErrorRuleAt(column, line);

        if (rule) {
            return new ImmutableAntlrRuleWrapper(this.errorHandler.getErrorRuleAt(column, line), this);
        }

        return undefined;
    }

    getErrorRuleTable(): ParserRuleContext[][] {
        return this.errorHandler.getErrorRuleTable();
    }

    hasErrors(): boolean {
        return this.getErrors().length > 0;
    }

    hasWarnings(): boolean {
        return this.getWarnings().length > 0;
    }

    getRelevantError(): AntlrRuleError {
        if (this.hasErrors()) {
            return _.last(this.getErrors());
        }
    }

    createRuleError(rule: ParserRuleContext): AntlrRuleError {
        const range = this.getRuleRange(rule);
        const error = new AntlrRuleError();

        error.rule = rule;
        error.ruleWrapper = new ImmutableAntlrRuleWrapper(rule, this);
        error.start = range[0];
        error.end = range[1];
        error.message = `Error matching the ${this.getRuleName(rule)} rule`;

        return error;
    }

    getRuleAt(column: number, line: number): AntlrRuleWrapper | undefined {
        const rule = this.ruleTable.getRuleAt(column, line);

        if (rule) {
            return new ImmutableAntlrRuleWrapper(rule, this);
        }

        return undefined;
    }

    getCharacterAt(column: number, line: number): string {
        return this.textBuffer.charAt(column, line);
    }

    getRuleName(rule: ParserRuleContext): string {
        return this.ruleIndexToNameMap.get(rule.ruleIndex);
    }

    getTokenName(token: Token): string {
        return this.tokenTypeToSymoblMap.get(token.type);
    }

    getRuleParent(rule: ParserRuleContext): ParserRuleContext {
        if (rule) {
            return rule.parentCtx;
        }

        return undefined;
    }

    /**
     * (For internal use only)
     *
     * @param {TerminalNode} node
     */
    visitTerminal(node: TerminalNode): void {
        const token = node.symbol;

        if (token.start !== -1 && token.stop !== -1) {
            this.tokenTable.addToken(token);
            this.tokenSubject.next(token);
        }
    }

    /**
     * (For internal use only)
     * @param {ErrorNode} node
     */
    visitErrorNode(node: ErrorNode): void {

    }

    /**
     * (For internal use only)
     *
     * @param {ParserRuleContext} ctx
     */
    enterEveryRule(ctx: ParserRuleContext): void {
        this.stack.push(ctx);
        this.ruleWrapperStack.push(new ImmutableAntlrRuleWrapper(ctx, this));
        this.enterRuleSubject.next(ctx);
    }

    onRuleEnter(ruleName: string, callback: (ruleWrapper: AntlrRuleWrapper) => void): void {
        this.enterRuleSubject.asObservable()
            .pipe(filter((rule) => this.getRuleName(rule) === ruleName))
            .subscribe((rule) => {
                const wrapper = new ImmutableAntlrRuleWrapper(rule, this);
                callback(wrapper);
            });
    }

    onRuleExit(ruleName: string, callback: (ruleWrapper: AntlrRuleWrapper) => void): void {
        this.exitRuleSubject.asObservable()
            .pipe(filter((rule) => this.getRuleName(rule) === ruleName))
            .subscribe((rule) => {
                const wrapper = new ImmutableAntlrRuleWrapper(rule, this);
                callback(wrapper);
            });
    }

    onParseComplete(callback: () => void): void {
        this.parseCompleteSubject.asObservable().subscribe(callback);
    }


    /**
     * (For internal use only)
     *
     * @param {ParserRuleContext} ctx
     */
    exitEveryRule(ctx: ParserRuleContext): void {
        if (this.hasErrorNode(ctx) && this.siblingsHaveNoErrors(ctx)) {
            this.errorHandler.processRuleWithError(ctx);
        } else if (this.getErrors().length === 0) {
            if (ctx.stop && ctx.start) {
                this.customValidatorSubject.next(ctx);

                if (this.getErrors().length === 0) {
                    this.ruleTable.addRule(ctx);
                    this.exitRuleSubject.next(ctx);
                }
            }
            // this.errorHandler.processRecognitionException(ctx.exception);
        }
    }

    setTokenText(token: Token, text: string) {
        throw new Error('Cannot set token text on ImmutableAntlrParser');
    }

    setRuleText(rule: ParserRuleContext, text: string) {
        throw new Error('Cannot set rule text on ImmutableAntlrParser');
    }

    replaceRange(range: AntlrRange, text: string): AntlrRange {
        throw new Error('Cannot replace range text on ImmutableAntlrParser');
    }

    filter(filterFunction: (rule: AntlrRuleWrapper, index: number) => boolean): AntlrParser {
        this.functionalRuleParser.filter(filterFunction);
        return this;
    }

    forEach<T>(eachFunction: (rule: AntlrRuleWrapper, index: number) => void): void {
        this.functionalRuleParser.forEach(eachFunction);
        this.functionalRuleParser = new FunctionalRuleParser(this);
    }

    map<T>(mapFunction: (rule: AntlrRuleWrapper, index: number) => T): T[] {
        const results = this.functionalRuleParser.map(mapFunction);
        this.functionalRuleParser = new FunctionalRuleParser(this);
        return results;
    }

    reduce<T>(reduceFunction: (acc: T, rule: AntlrRuleWrapper, index: number) => T, accumulator: T): T {
        const results = this.functionalRuleParser.reduce(reduceFunction, accumulator);
        this.functionalRuleParser = new FunctionalRuleParser(this);
        return results;
    }

    findLast(filterFunction: (rule: AntlrRuleWrapper, index: number) => boolean): AntlrRuleWrapper {
        const results = this.functionalRuleParser.findLast(filterFunction);
        this.functionalRuleParser = new FunctionalRuleParser(this);
        return results;
    }

    find(filterFunction: (rule: AntlrRuleWrapper, index: number) => boolean): AntlrRuleWrapper {
        const results = this.functionalRuleParser.find(filterFunction);
        this.functionalRuleParser = new FunctionalRuleParser(this);
        return results;
    }

    findAll(filterFunction: (rule: AntlrRuleWrapper, index: number) => boolean): AntlrRuleWrapper[] {
        const results = this.functionalRuleParser.findAll(filterFunction);
        this.functionalRuleParser = new FunctionalRuleParser(this);
        return results;
    }

    every(predicate: (rule: AntlrRuleWrapper, index: number) => boolean): boolean {
        const results = this.functionalRuleParser.every(predicate);
        this.functionalRuleParser = new FunctionalRuleParser(this);

        return results;
    }

    findRuleByName(ruleName: string): AntlrRuleWrapper {
        return this.find((rule) => rule.getName() === ruleName);
    }

    findRulesByName(ruleName: string): AntlrRuleWrapper[] {
        return this.findAll((rule) => rule.getName() === ruleName);
    }

    findRulesByPath(path: string): AntlrRuleWrapper[] {
        const xpath = new XPath(this.getRoot());
        return xpath.findRulesByPath(path);
    }

    findRuleByPath(path: string): AntlrRuleWrapper {
        const rules = this.findRulesByPath(path);

        if (rules.length > 0) {
            return rules[0];
        }

        return undefined;
    }

}
