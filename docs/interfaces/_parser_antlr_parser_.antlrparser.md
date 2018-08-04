[antlr4-helper](../README.md) > ["parser/antlr-parser"](../modules/_parser_antlr_parser_.md) > [AntlrParser](../interfaces/_parser_antlr_parser_.antlrparser.md)

# Interface: AntlrParser

## Hierarchy

**AntlrParser**

## Implemented by

* [ImmutableAntlrParser](../classes/_parser_immutable_antlr_parser_.immutableantlrparser.md)
* [MutableAntlrParser](../classes/_parser_mutable_antlr_parser_.mutableantlrparser.md)

## Index

### Methods

* [addCustomRuleValidator](_parser_antlr_parser_.antlrparser.md#addcustomrulevalidator)
* [addEnterRuleListener](_parser_antlr_parser_.antlrparser.md#addenterrulelistener)
* [addExitRuleListener](_parser_antlr_parser_.antlrparser.md#addexitrulelistener)
* [addParserCompleteListener](_parser_antlr_parser_.antlrparser.md#addparsercompletelistener)
* [addTokenListener](_parser_antlr_parser_.antlrparser.md#addtokenlistener)
* [checkForErrors](_parser_antlr_parser_.antlrparser.md#checkforerrors)
* [createRuleError](_parser_antlr_parser_.antlrparser.md#createruleerror)
* [filter](_parser_antlr_parser_.antlrparser.md#filter)
* [forEach](_parser_antlr_parser_.antlrparser.md#foreach)
* [getColumnCount](_parser_antlr_parser_.antlrparser.md#getcolumncount)
* [getErrorRuleAt](_parser_antlr_parser_.antlrparser.md#geterrorruleat)
* [getErrors](_parser_antlr_parser_.antlrparser.md#geterrors)
* [getLine](_parser_antlr_parser_.antlrparser.md#getline)
* [getLineCount](_parser_antlr_parser_.antlrparser.md#getlinecount)
* [getRelevantError](_parser_antlr_parser_.antlrparser.md#getrelevanterror)
* [getRuleAt](_parser_antlr_parser_.antlrparser.md#getruleat)
* [getRuleBefore](_parser_antlr_parser_.antlrparser.md#getrulebefore)
* [getRuleName](_parser_antlr_parser_.antlrparser.md#getrulename)
* [getRuleParent](_parser_antlr_parser_.antlrparser.md#getruleparent)
* [getRuleRange](_parser_antlr_parser_.antlrparser.md#getrulerange)
* [getRuleStack](_parser_antlr_parser_.antlrparser.md#getrulestack)
* [getRuleText](_parser_antlr_parser_.antlrparser.md#getruletext)
* [getRulesInLine](_parser_antlr_parser_.antlrparser.md#getrulesinline)
* [getSiblings](_parser_antlr_parser_.antlrparser.md#getsiblings)
* [getText](_parser_antlr_parser_.antlrparser.md#gettext)
* [getTokenAt](_parser_antlr_parser_.antlrparser.md#gettokenat)
* [getTokenName](_parser_antlr_parser_.antlrparser.md#gettokenname)
* [getTokenRange](_parser_antlr_parser_.antlrparser.md#gettokenrange)
* [getTokenText](_parser_antlr_parser_.antlrparser.md#gettokentext)
* [getTokensInLine](_parser_antlr_parser_.antlrparser.md#gettokensinline)
* [getWarnings](_parser_antlr_parser_.antlrparser.md#getwarnings)
* [hasErrorNode](_parser_antlr_parser_.antlrparser.md#haserrornode)
* [hasErrors](_parser_antlr_parser_.antlrparser.md#haserrors)
* [hasWarnings](_parser_antlr_parser_.antlrparser.md#haswarnings)
* [map](_parser_antlr_parser_.antlrparser.md#map)
* [parse](_parser_antlr_parser_.antlrparser.md#parse)
* [reduce](_parser_antlr_parser_.antlrparser.md#reduce)
* [setRuleText](_parser_antlr_parser_.antlrparser.md#setruletext)
* [setTokenText](_parser_antlr_parser_.antlrparser.md#settokentext)
* [siblingsHaveNoErrors](_parser_antlr_parser_.antlrparser.md#siblingshavenoerrors)

---

## Methods

<a id="addcustomrulevalidator"></a>

###  addCustomRuleValidator

▸ **addCustomRuleValidator**T(ruleClass: *[AntlrRuleClass](../modules/_types_types_.md#antlrruleclass)<`ParserRuleContext`>*, validator: *`function`*): `void`

Adds a custom rule validator. If the validator returns a [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md) then it's reported to the parser. If nothing is reported than the validation was a success.

**Type parameters:**

#### T :  `ParserRuleContext`
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ruleClass | [AntlrRuleClass](../modules/_types_types_.md#antlrruleclass)<`ParserRuleContext`> |  - |
| validator | `function` |   |

**Returns:** `void`

___
<a id="addenterrulelistener"></a>

###  addEnterRuleListener

▸ **addEnterRuleListener**T(ruleClass: * [AntlrRuleClass](../modules/_types_types_.md#antlrruleclass)<`ParserRuleContext`> &#124; `null` &#124; `undefined`*, listener: *`function`*): `void`

Add a listener for when the parser enters a given rule. See example below

*__example__*:   

```
parser.addEnterRuleListener(ExpressionContext, (rule)=>{
    console.log("entering an expression rule");
})
```

**Type parameters:**

#### T :  `ParserRuleContext`
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ruleClass |  [AntlrRuleClass](../modules/_types_types_.md#antlrruleclass)<`ParserRuleContext`> &#124; `null` &#124; `undefined`|  - |
| listener | `function` |   |

**Returns:** `void`

___
<a id="addexitrulelistener"></a>

###  addExitRuleListener

▸ **addExitRuleListener**T(ruleClass: * [AntlrRuleClass](../modules/_types_types_.md#antlrruleclass)<`ParserRuleContext`> &#124; `null` &#124; `undefined`*, listener: *`function`*): `void`

Add a listener for when the parser exits a given rule. See example below

*__example__*:   

```
parser.addExitRuleListener(ExpressionContext, (rule)=>{
    console.log(parser.getRuleText(rule));
})
```

**Type parameters:**

#### T :  `ParserRuleContext`
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ruleClass |  [AntlrRuleClass](../modules/_types_types_.md#antlrruleclass)<`ParserRuleContext`> &#124; `null` &#124; `undefined`|  - |
| listener | `function` |   |

**Returns:** `void`

___
<a id="addparsercompletelistener"></a>

###  addParserCompleteListener

▸ **addParserCompleteListener**T(listener: *`function`*): `void`

**Type parameters:**

#### T :  `ParserRuleContext`
**Parameters:**

| Param | Type |
| ------ | ------ |
| listener | `function` |

**Returns:** `void`

___
<a id="addtokenlistener"></a>

###  addTokenListener

▸ **addTokenListener**(listener: *`function`*): `void`

Listen and watch for all visited tokens

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| listener | `function` |   |

**Returns:** `void`

___
<a id="checkforerrors"></a>

###  checkForErrors

▸ **checkForErrors**(): `void`

throws Error if errors found

**Returns:** `void`

___
<a id="createruleerror"></a>

###  createRuleError

▸ **createRuleError**(rule: *`ParserRuleContext`*): [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)

Create a basic [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| rule | `ParserRuleContext` |  - |

**Returns:** [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)

___
<a id="filter"></a>

###  filter

▸ **filter**(filterFunction: *`function`*): [AntlrParser](_parser_antlr_parser_.antlrparser.md)

Filter out rules before calling forEach, map, reduce, or another filter.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| filterFunction | `function` |  - |

**Returns:** [AntlrParser](_parser_antlr_parser_.antlrparser.md)

___
<a id="foreach"></a>

###  forEach

▸ **forEach**T(eachFunction: *`function`*): `void`

Iterate over each rule parsed

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| eachFunction | `function` |   |

**Returns:** `void`

___
<a id="getcolumncount"></a>

###  getColumnCount

▸ **getColumnCount**(line: *`number`*): `number`

The number of columns of the parsed input's line

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| line | `number` |  - |

**Returns:** `number`

___
<a id="geterrorruleat"></a>

###  getErrorRuleAt

▸ **getErrorRuleAt**(column: *`number`*, line: *`number`*): `ParserRuleContext`

Get the erroneous rule at the column and line position

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| column | `number` |  - |
| line | `number` |  - |

**Returns:** `ParserRuleContext`

___
<a id="geterrors"></a>

###  getErrors

▸ **getErrors**(): [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)[]

All the reported errors found after the a parse occurred

**Returns:** [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)[]

___
<a id="getline"></a>

###  getLine

▸ **getLine**(line: *`number`*): `string`

Get a specific line of the parsed input

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| line | `number` |  - |

**Returns:** `string`

___
<a id="getlinecount"></a>

###  getLineCount

▸ **getLineCount**(): `number`

Get the number of lines of the parsed input

**Returns:** `number`

___
<a id="getrelevanterror"></a>

###  getRelevantError

▸ **getRelevantError**(): [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)

Retrieves the most relevant error found in parsing.

**Returns:** [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)

___
<a id="getruleat"></a>

###  getRuleAt

▸ **getRuleAt**(column: *`number`*, line: *`number`*):  [AntlrRuleWrapper](_parser_antlr_rule_wrapper_.antlrrulewrapper.md) &#124; `undefined`

Get a Rule at a specified position

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| column | `number` |  - |
| line | `number` |  - |

**Returns:**  [AntlrRuleWrapper](_parser_antlr_rule_wrapper_.antlrrulewrapper.md) &#124; `undefined`

___
<a id="getrulebefore"></a>

###  getRuleBefore

▸ **getRuleBefore**(rule: *`ParserRuleContext`*): `ParserRuleContext`

Get the sibling of the rule before the specified rule, if one exists

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| rule | `ParserRuleContext` |  - |

**Returns:** `ParserRuleContext`

___
<a id="getrulename"></a>

###  getRuleName

▸ **getRuleName**(rule: *`ParserRuleContext`*): `string`

The grammar's name of the rule

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| rule | `ParserRuleContext` |  - |

**Returns:** `string`

___
<a id="getruleparent"></a>

###  getRuleParent

▸ **getRuleParent**(rule: *`ParserRuleContext`*):  `ParserRuleContext` &#124; `undefined`

Gets the parent of a specified rule

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| rule | `ParserRuleContext` |  - |

**Returns:**  `ParserRuleContext` &#124; `undefined`

___
<a id="getrulerange"></a>

###  getRuleRange

▸ **getRuleRange**(rule: *`ParserRuleContext`*): [AntlrRange](../modules/_types_types_.md#antlrrange)

Get the range of a given rule, where the first object is the start position and the last is the end position

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| rule | `ParserRuleContext` |  - |

**Returns:** [AntlrRange](../modules/_types_types_.md#antlrrange)

___
<a id="getrulestack"></a>

###  getRuleStack

▸ **getRuleStack**(): `ReadonlyArray`<`ParserRuleContext`>

**Returns:** `ReadonlyArray`<`ParserRuleContext`>

___
<a id="getruletext"></a>

###  getRuleText

▸ **getRuleText**(rule: *`ParserRuleContext`*): `string`

Get the complete text of a completely parsed rule

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| rule | `ParserRuleContext` |  - |

**Returns:** `string`

___
<a id="getrulesinline"></a>

###  getRulesInLine

▸ **getRulesInLine**(line: *`number`*): `Set`<`ParserRuleContext`>

Get all the rules in a line

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| line | `number` |  - |

**Returns:** `Set`<`ParserRuleContext`>

___
<a id="getsiblings"></a>

###  getSiblings

▸ **getSiblings**(rule: *`ParserRuleContext`*): `ParserRuleContext`[]

Get the siblings for the rule

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| rule | `ParserRuleContext` |  - |

**Returns:** `ParserRuleContext`[]

___
<a id="gettext"></a>

###  getText

▸ **getText**(): `string`

The complete parsed text

**Returns:** `string`

___
<a id="gettokenat"></a>

###  getTokenAt

▸ **getTokenAt**(column: *`number`*, line: *`number`*):  [AntlrTokenWrapper](_parser_antlr_token_wrapper_.antlrtokenwrapper.md) &#124; `undefined`

Retrieve a token a the specified position

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| column | `number` |  - |
| line | `number` |  - |

**Returns:**  [AntlrTokenWrapper](_parser_antlr_token_wrapper_.antlrtokenwrapper.md) &#124; `undefined`

___
<a id="gettokenname"></a>

###  getTokenName

▸ **getTokenName**(token: *`Token`*): `string`

The grammar's name of the token

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| token | `Token` |  - |

**Returns:** `string`

___
<a id="gettokenrange"></a>

###  getTokenRange

▸ **getTokenRange**(token: * `Token` &#124; `TerminalNode`*): [AntlrRange](../modules/_types_types_.md#antlrrange)

Get the range of a given token, where the first object is the start position and the last is the end position

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| token |  `Token` &#124; `TerminalNode`|  - |

**Returns:** [AntlrRange](../modules/_types_types_.md#antlrrange)

___
<a id="gettokentext"></a>

###  getTokenText

▸ **getTokenText**(token: * `Token` &#124; `TerminalNode`*): `string`

Get the text of a given token

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| token |  `Token` &#124; `TerminalNode`|  - |

**Returns:** `string`

___
<a id="gettokensinline"></a>

###  getTokensInLine

▸ **getTokensInLine**(line: *`number`*): `Set`<`Token`>

Get all the tokens in the line.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| line | `number` |  - |

**Returns:** `Set`<`Token`>

___
<a id="getwarnings"></a>

###  getWarnings

▸ **getWarnings**(): [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)[]

All the reported warnings generated

**Returns:** [AntlrRuleError](../classes/_parser_antlr_rule_error_.antlrruleerror.md)[]

___
<a id="haserrornode"></a>

###  hasErrorNode

▸ **hasErrorNode**(ctx: *`ParserRuleContext`*): `boolean`

Check if the rule contains any error nodes

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ctx | `ParserRuleContext` |  - |

**Returns:** `boolean`

___
<a id="haserrors"></a>

###  hasErrors

▸ **hasErrors**(): `boolean`

Checks if any errors exist

**Returns:** `boolean`

___
<a id="haswarnings"></a>

###  hasWarnings

▸ **hasWarnings**(): `boolean`

Check if any warnings exist

**Returns:** `boolean`

___
<a id="map"></a>

###  map

▸ **map**T(mapFunction: *`function`*): `T`[]

Transform each rule to a value

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| mapFunction | `function` |  - |

**Returns:** `T`[]

___
<a id="parse"></a>

###  parse

▸ **parse**(input: *`string`*): `ParserRuleContext`

Parse the input string

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| input | `string` |  - |

**Returns:** `ParserRuleContext`
- the invoked root rule

___
<a id="reduce"></a>

###  reduce

▸ **reduce**T(reduceFunction: *`function`*, accumulator: *`T`*): `T`

Reduces rules to a value which is the accumulated result of running each element

**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reduceFunction | `function` |  - |
| accumulator | `T` |  - |

**Returns:** `T`

___
<a id="setruletext"></a>

###  setRuleText

▸ **setRuleText**(rule: *`ParserRuleContext`*, text: *`string`*): `void`

Set the text of rule

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| rule | `ParserRuleContext` |  - |
| text | `string` |   |

**Returns:** `void`

___
<a id="settokentext"></a>

###  setTokenText

▸ **setTokenText**(token: *`Token`*, text: *`string`*): `void`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| token | `Token` |  - |
| text | `string` |   |

**Returns:** `void`

___
<a id="siblingshavenoerrors"></a>

###  siblingsHaveNoErrors

▸ **siblingsHaveNoErrors**(rule: *`ParserRuleContext`*): `boolean`

**Parameters:**

| Param | Type |
| ------ | ------ |
| rule | `ParserRuleContext` |

**Returns:** `boolean`

___
