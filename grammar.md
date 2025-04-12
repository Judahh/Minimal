# Notes on Syntax:
- `<...>` denotes placeholders for actual elements in the code.
- `[...]` denotes optional elements.
- `|` represents an alternative option.
- `=`, `=|` denote different function declaration syntaxes.
- `{...}` denotes block structures.

# Grammar Rules (Simplified):

Using a BNF-like representation (simplified for illustration):

```bnf
param = <identifier> | <literal> ;

functionName = <identifier> ;

params = param [ , param ]* ;

typeParam = <type> ;

typeParams = typeParam [ , typeParam ]* ;

functionCall ::= [(<typeParams>)]<functionName>(<params>) ;

statement ::= <functionCall | systemFunctionCall> ;

statements ::= statement [ ; statements ]* ;

scope ::= { <statements> } | <statement> ;

paramDefinition ::= <value> : <type> ;

paramsDefinition ::= paramDefinition [ , paramDefinition ]* ;

fuctionParams ::= paramDefinition | (paramsDefinition) ;

functionDefinition ::=  fuctionParams -> <scope> ;

newFunction = [(typeParam)]new(<name>[, <value>]) ;

setFunction = set(<name>, <value>);

pointsFunction = points(<name>, <value>);

setFunctions = <newFunction> | <setFunction> | <pointsFunction> ;

sumFunction = sum(<value1>, <value2>[, <value3>]*);

subtractFunction = subtract(<value1>, <value2>[, <value3>]*);

multiplyFunction = multiply(<value1>, <value2>[, <value3>]*);

divideFunction = divide(<value1>, <value2>[, <value3>]*);

moduloFunction = modulo(<value1>, <value2>);

powerFunction = power(<value1>, <value2>);

rootFunction = root(<value>, <root>);

absoluteFunction = absolute(<value>);

negativeFunction = negative(<value>);

inverseFunction = inverse(<value>);

logarithmFunction = logarithm(<value>, <base>);

mathFunction = sumFunction | subtractFunction | multiplyFunction
                | divideFunction | moduloFunction | powerFunction
                | rootFunction | absoluteFunction | negativeFunction
                | inverseFunction | logarithmFunction ;

equalType = "same" | "strict" | "loose" | "truthy"; # same: same address in memory, strict: checks type and value, loose: checks value, truthy: checks if both are truthy

equalsFunction = equals(<value1>, <value2>[, <equalType>]);
notEqualsFunction = notEquals(<value1>, <value2>[, <equalType>]);
greaterThanFunction = greaterThan(<value1>, <value2>[, <equalType>]);
greaterThanOrEqualsFunction = greaterThanOrEquals(<value1>, <value2>[, <equalType>]);
lessThanFunction = lessThan(<value1>, <value2>[, <equalType>]);
lessThanOrEqualsFunction = lessThanOrEquals(<value1>, <value2>[, <equalType>]);

comparisonFunction = equalsFunction | notEqualsFunction | greaterThanFunction
                        | greaterThanOrEqualsFunction | lessThanFunction
                        | lessThanOrEqualsFunction ;

andFunction = and(<value1>, <value2>[, <value3>]*);

orFunction = or(<value1>, <value2>[, <value3>]*);

notFunction = not(<value>);

logicalFunction = andFunction | orFunction | notFunction ;

trueBlock = <scope>;

falseBlock =  <condition>, <trueBlock>[, <falseBlock>] | <scope>;

conditionalFunction = if(<condition>, <trueBlock>[, <falseBlock>]);

caseStatement = <value> , <scope>;

defaultBlock = <scope>;

caseFunction = if(<identifier>, <caseStatement> [, <caseStatement>]*, <defaultBlock>) ; 

propertiesArray = properties(<object>);

iterationFunction = loop(<array>, <functionDefinition>);

whileFunction = loop(<condition>, <scope>);

doWhileFunction = loop(<scope>, <condition>);

loopFunction = <iterationFunction> | <whileFunction> | <doWhileFunction> ;

controlFunction = <conditionalFunction> | <caseFunction> | <loopFunction> ;

errorFunction = Error(<value>, <code>);

exceptionFunction = Exception(<value>, <code>);

throwFunction = throw(<errorFunction> | <exceptionFunction>);

tryFunction = try(<scope>[, <catchScope>]*)[.catch(<functionDefinition>)];

exceptionsFunctions = <throwFunction> | <tryFunction> | exceptionFunction | errorFunction ;

systemFunctionCall = <setFunctions> | <mathFunction> | <comparisonFunction>
                | <logicalFunction> | <propertiesArray> | <controlFunction>
                | <exceptionsFunctions> ;

booleanType = Boolean ;

naturalType = Natural([size:default(Natural, 32)[, growable: default(Boolean, 1)]]) ;

wholeType = Whole([size:default(Whole, 32)[, growable: default(Boolean, 1)]]) ;

integerType = Integer([size:default(Integer, 32)[, growable: default(Boolean, 1)]]) ;

rationalType = Rational([pSize:default(Natural, 32)[,qSize:default(Natural, 32)[, growable: default(Boolean, 1)]]]) ;

realType = Real([iSize:default(Whole, 32)[, dSize:default(Whole, 32)[, growable: default(Boolean, 1)]]]) ;

floatType = Float([sizeMultiplier:default(Integer, 1)[, growable: default(Boolean, 1)]) | Float([size:default(Natural, 32)[, mantissaSize:default(Natural, 23)[, growable: default(Boolean, 1)]]]) ;

numericTypes = booleanType | naturalType | wholeType | integerType
                | rationalType | realType | floatType ;

type = <numericTypes> | <arrayType> | <textTypes> | <specialTypes> | <userTypes>;
```

This is a simplified representation of the syntax rules using a BNF-like notation for some constructs in the 'Minimal' language. For a complete and accurate grammar, additional rules for various constructs, including expressions, operators, scoping, and more, would need to be defined.

Developing a complete and precise formal grammar for a programming language involves specifying rules for all language constructs in detail, handling precedence, associativity, and other intricacies. It typically requires a dedicated language specification document with extensive details and examples.
