import {
    AntlrFactory, AntlrFactoryBuilder, AntlrParser, ImmutableAntlrParser, ImmutableAntlrRuleWrapper, MutableAntlrParser,
    MutableAntlrRuleWrapper
} from '../';
import {FunctionalRuleParser} from '../parser/functional-rule-parser';

/**
 * Creates an {@link AntlrFactoryBuilder}
 *
 * @returns {AntlrFactoryBuilder}
 */
export function createFactoryBuilder(): AntlrFactoryBuilder {
    return new AntlrFactoryBuilder();
}

/**
 * Creates a default Parser
 *
 * @param {AntlrFactory} factory
 * @returns {MutableAntlrParser}
 */
export function createParser(factory: AntlrFactory): MutableAntlrParser {
    return new MutableAntlrParser(createImmutableParser(factory));
}

/**
 * Creates an Immutable Parser
 *
 * @param {AntlrFactory} factory
 * @returns {AntlrParser}
 */
export function createImmutableParser(factory: AntlrFactory): AntlrParser {
    return new ImmutableAntlrParser(factory);
}
