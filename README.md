# Minimal

Language name: Minimal

## Language Goals and Features:

- Minimal keywords
- Minimal symbols
- TypeScript-like syntax
- Custom types

## Types

### Basic Types

#### Numeric Types

##### Boolean
##### Natural(size:Natural=32)
##### Whole(size:Natural=32)
      Whole=Unsigned(Integer)
      Whole=Natural & 0
##### Integer(size:Natural=32)
##### Rational(pSize:Natural=32,qSize:Natural=32)
##### Real
###### Float(sizeMultiplier:Integer=1) | Float(size:Natural=32, mantissaSize:Natural=23)
###### Number(integerSize:Natural=32, decimalSize:Natural=32) | Number(options: NumberOptions)

#### Text Types

##### Char(encoding:String='utf-8')
literal: 'c'
##### String<Type=Array>(encoding:String='utf-8')
literal: "string" or `string`
#### Array<T?>(size?:Natural) (if it doesnot have a size it's growable)


#### Umbrella Types
It's possible to define a type that can be any of the a set of types and it's possible agregate more types to an existing umbrella type:

Real = Float | Number
Numeric = Boolean | Natural | Whole | Integer | Rational | Real
Text = Char | String

How to add more types to an existing umbrella type:
For the current file:
Numeric |= NewNumeric | OtherNewNumeric
For the everywhere it's imported:
Global.Numeric |= NewNumeric | OtherNewNumeric

## Example:
```minimal
# Variable/Constant/Function declaration
x: Number = 5;
y: Const(Number) = 10;
z = 20;
sum: (a: Number, b: Number) => Number = (a: Number, b: Number)=>{
      log('Sum a:', a, ' and  b:', b);
      => a+b; # return is =>
};
sub = (a: Number, b: Number)=>a-b;

multiply = (a: Number, b: Number)=>a*b;
multiply |= (a: Number, b: Number, c: Number)=>a*b*c; // multiple function signatures for the same naming using |=

print = log;
printFoo = {
    log('foo');
};

# Classes
SampleClass = {
      private x: Number = 5;
      y: Const(Number) = 10;
      w: Number = 10;

      constructor = (x: Number) => { this.x = x; }

      sum = () => {
               => x+y+w;
      }

      value = () => {
               => x;
      }
};

SampleClassChild: SampleClass = { # inheritance
      constructor =| (x: Number, w: Number) => { # new constructor signature option
                this.x = x;
                this.w = w;
      }
};

SampleClass2 = (z?: Number) => {
      private x: Number = z || 5;
      y: Const(Number) = 10;
};

sampleClassChild = SampleClassChild(13);
log(sampleClassChild.x);     # prints 13
log(sampleClassChild.w);     # prints 10
log(sampleClassChild.sum()); # prints 33

Global.(a: SampleClass, '+', b: SampleClass) => {
    => SampleClass(a.value() + b.value());
};

Global.(a: SampleClass, '+', b: Numeric) => {
    => SampleClass(a.value() + b);
};

Global.(a: Numeric, '+', b: SampleClass) => {
    => SampleClass(a + b.value());
};

Global.('|', a: SampleClass, '|') => {
    => if(a.value() > 0, a.value(), -a.value());
};

sampleClass = SampleClass(6);
sampleClass2 = SampleClass(7);
log((sampleClass + sampleClass2).value); # prints 13
log((sampleClass + 5).value); # prints 11
sampleClass3 = SampleClass(-5);
log(|sampleClass3|); # prints 5

# Global is a global object that can be used to define global properties, functions, operators...
# Project is a global object that can be used to define project properties, functions, operators...
# Namespace is a global object that can be used to define namespace properties, functions, operators...
# This is a global for the current class, it can be used to define class properties, functions, operators...
# this is a reference to the current object, it can be used to access the current object properties, functions, operators...

numberExample = Number(5);
functionExample = ()=>{};
classExample = {
  constructor = () => {};
};

# it's possible to use typeName properties to get the type name and variableName properties to get the variable name

log(numberExample.typeName); # prints Number
log(numberExample.variableName); # prints numberExample
log(functionExample.typeName); # prints Function
log(functionExample.variableName); # prints functionExample
log(classExample.typeName); # prints Object
log(classExample.variableName); # prints classExample

# Struct
Like a class but without functions (but can have constructor)
If it does not have a constructor must have all variables initialized and cannot be instantiated
sampleStruct = {
      x: Number = 5;
      y: Const(Number) = 10;
};
or
If it has a constructor it can have variables not initialized but must be instantiated
SampleStruct = {
      x: Number;
      y: Const(Number);
      constructor = (x: Number, y: Number) => {
                this.x = x;
                this.y = y;
      }
};
sampleStruct = SampleStruct(5, 10);

log(sampleStruct.x); # prints 5
log(sampleStruct.y); # prints 10

# Engine
Like a class but without variables (Does not have constructor, and cannot be instantiated, just used as an object)
sampleEngine = {
      protected init = () => {
                log('Engine initialized');
      }
      start = () => {
                this.init();
                log('Engine started');
      }
      sum = (a: Number, b: Number) => {
                log('Sum a:', a, ' and  b:', b);
                => a+b; # return is =>
      }
};

returns types:
For a "{}" (scope) use:
  "=>" or "this.=>" returns the value for the current scope
  "super.=>" returns the value for the parent scope
  "final.=>" returns the value for the final scope
  "global.=>" returns the value for the global scope (program)
For a "[]" (scope) use:
  "=>" returns the value for the closest {} (scope)
  "super.=>" returns the value for the parent of the closest {} (scope)
  "final.=>" returns the value for the final scope
  "global.=>" returns the value for the global scope (program)

example:
someFunction = () => {
  if(1 > 0, {
      if(2 > 0, {
          => 2;
      }, {
          => -2;
      });
      => 1;
  }, {
      => -1;
  });
  => 0;
}
# will return 0 because of the '=>' of each if statement is returning the value for the current {} (scope)

someFunction = () => {
  if(1 > 0, {
      if(2 > 0, {
          => 2;
      }, {
          => -2;
      });
      super.=> 1;
  }, {
      super.=> -1;
  });
  => 0;
}
# will return 1 because of the 'super.=>' of the second if statement is returning the value for the parent {} (scope)
someFunction = () => {
  if(1 > 0, {
      if(2 > 0, {
          super.=> 2;
      }, {
          super.=> -2;
      });
      super.=> 1;
  }, {
      super.=> -1;
  });
  => 0;
}
# will return 0 because of the 'super.=>' of the second if statement is returning the value for the parent {} (scope) so the 'super.=>' of the first if statement is not being executed

someFunction = () => {
  if(1 > 0, {
      if(2 > 0, {
          super.super.=> 2;
      }, {
          super.super.=> -2;
      });
      super.=> 1;
  }, {
      super.=> -1;
  });
  => 0;
}
# will return 2 because of the 'super.super.=>' of the first if statement is returning the value for the final {} (scope)

someFunction = () => {
  if(1 > 0, {
      if(2 > 0, {
          final.=> 2;
      }, {
          final.=> -2;
      });
      super.=> 1;
  }, {super.
      super.=> -1;
  });
  => 0;
}
# will return 2 because of the 'final.=>' of the first if statement is returning the value for the parent of the parent {} (scope)

someFunction = () => {
  if(1 > 0, [
      if(2 > 0, {
          => 2;
      }, {
          => -2;
      });
      => 1;
  ], [
      => -1;
  ]);
  => 0;
}
# will return 2 because the '=>' is returning the value for the closest {} (scope)

# Enum
Color:Enum = {
      RED,
      GREEN,
      BLUE
};
or
Color:Enum = {
      RED = 1,
      GREEN = 2,
      BLUE = 3
};
or
Color:Enum = {
      RED = 1,
      GREEN,
      BLUE
};
or
Color:Enum = {
      RED = 'r',
      GREEN = 'g',
      BLUE = 'b'
};

# Types/Interfaces

Person:Type = {
     name: String;
     age: Number;
};

Worker:Person = {
     job: String;
};

Human: Person = { # Class Human implements Person
      constructor = (name: String, age: Number) => {
                this.name = name;
                this.age = age;
      }
      eat = () => log('eat');
}

# Conditional statement  (is a function for statement)
if(x < y, {
    log("x is less than y");
}, log("x is greater than or equal to y"));
# Conditional statement  (using ternary syntax)
x < y ? log("x is less than y") : {
    log("x is greater than or equal to y"))
};

# Try Catch statement  (is a function for statement)
try({
    log("try block");
}, {
    log("catch block");
});

or

try({
    log("try block");
}, (e: Error)=>{
    log("catch block");
});

or

try({
    log("try block");
}).catch((e: Error)=>{
    log("catch block");
});

or

try({
    log("try block");
}).catch((e: SomeError)=>{
    log("catch block");
}).catch((e: AnotherError)=>{
    log("another catch block");
});

# Error vs Exception
Error is a type of exception

Error will crash the program if not handled
Exception will not crash the program if not handled, just reload the program if not handled

# Ternary (using if function)
result = if(x < y, { => x }, y);
or
result = if(x < y, { => x }, { => y });
or
result = if(x < y, x, y);
or
result = if(x < y, x, { => y });

the default true value is 1 or true and the default false value is 0 or false
example:
result = if(x < y, x); # if x < y return x else return 0
result = if(x < y, x, 0); # if x < y return x else return 0
result = if(x < y); # if x < y return 1 else return 0
result = if(x < y,, y); # if x < y return 1 else return y
# Ternary (using ternary syntax)
result = x < y ? { => x }: y;

# Looping statement (is a function for looping)
loop(i=0, i < 5, i++, {
    print("Iteration: " + i);
}); # for like loop

a=[1,2,3,4,5];
loop(iterates(a), {
    print("Iteration: " + a);
}); # for of like loop

b=SampleClass(6);
loop(properties(b), {
    print("Iteration: " + i);
}); # for in like loop

j=0;
loop({
    print("Iteration: " + j);
}, j<5); # do while like loop

k=0;
loop(k<5,{
    print("Iteration: " + k);
}); # while like loop

# Error debugging
someFunction = (x,y) => {
    throw new Error('Some error');
};
someOtherFunction = (z) => {
    someFunction(1,z);
};
someOtherFunction(2); # will print the error message and the stack trace
Some error
Code: 500
Stack trace:
    at someFunction (file:line:column)
    where (x = 1, y = 2)
    at someOtherFunction (file:line:column)
    where (z = 2)
    at main (file:line:column)


someFunction = (x: Number,y) => {
    throw new Exception('Some error', 404);
};

someFunction(1,2); # will print the error message and the stack trace
Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    where (x: Number = 1, y = 2)
    at main (file:line:column)


someFunction = (x,y) => {
    throw new Exception('Some error');
};
someFunction(1,2); # will print the error message and the stack trace
Some error
Code: 400
Stack trace:
    at someFunction (file:line:column)
    where (x = 1, y = 2)
    at main (file:line:column)

someFunction = (x,y) => {
    throw new Exception('Some error', 404);
};

someFunction(1,2); # will print the error message and the stack trace

Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    where (x = 1, y = 2)
    at main (file:line:column)

Hide Secret Values

someFunction = (x: Secret, y: Secret(Number), z) => {
    throw new Exception('Some error', 404);
};

someFunction(1,2,3); # will print the error message and the stack trace

Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    where (x: Secret, y: Secret(Number), z = 3)
    at main (file:line:column)

```
Overview of the syntax rules and grammar structure for some of the language constructs:

### Overview of Syntax Rules:

#### Variables, Constants, Functions:
- Declaration Syntax:
  ```
  <identifier>: <type> [= <initializer>] ;
  ```

#### Functions:
- Function Declaration Syntax:
  ```
  <functionName> [= | =|] (<parameters>) [=>] { <functionBody> } ;
  ```

#### Classes:
- Class Declaration Syntax:
  ```
  <ClassName> = { <classBody> } ;
  ```

#### Types/Interfaces:
- Type Declaration Syntax:
  ```
  <TypeName>:Type = { <typeBody> } ;
  ```

#### Conditional Function:
- Syntax:
  ```
  if(<condition>, <trueBlock> , [<elseBlock>]);
  ```

#### Looping Function:
- Syntax:
  ```
  loop(<initialization>, <condition>, <increment>, { <loopBody> });
  loop(iterates(<array>), { <loopBody> });
  loop(properties(<object>), { <loopBody> });
  loop({ <loopBody> }, <condition>);
  loop(<condition>, { <loopBody> });
  ```

#### Arrays:
- Array Declaration Syntax:
  ```
  <arrayName> = [ <elements> ];
  ```

### Notes on Syntax:
- `<...>` denotes placeholders for actual elements in the code.
- `[...]` denotes optional elements.
- `|` represents an alternative option.
- `=`, `=|` denote different function declaration syntaxes.
- `{...}` denotes block structures.

### Grammar Rules (Simplified):

Using a BNF-like representation (simplified for illustration):

```bnf
declaration ::= <identifier> : <type> [ = <initializer> ] ;

functionDeclaration ::= <functionName> [= | =|] [ ( <parameters> )  => ] <functionBody> ;

classDeclaration ::= <ClassName> = { <classBody> } ;

typeDeclaration ::= <TypeName> : Type = { <typeBody> } ;

conditionalFunction ::= if ( <conditionBlock> , <trueBlock> , [ <elseBlock> ] ) ;

ternaryOperator ::= <condition> ? { <trueBlock> } : { <elseBlock> } ;

loopingFunction ::= loop ( <initialization> , <condition> , <increment> , <loopBody> )
                    | loop ( iterates ( <array> ) , <loopBody> )
                    | loop ( properties ( <object> ) , <loopBody> )
                    | loop ( <loopBody> , <condition> )
                    | loop ( <condition> , <loopBody> )
                    ;

arrayDeclaration ::= <arrayName> = [ <elements> ] ;

<type> ::= <basicType> | <customType> ;

<basicType> ::= Boolean | Natural ( size: Natural = 32 )
                | Integer ( size: Natural = 32 )
                | Rational ( pSize: Natural = 32, qSize: Natural = 32 )
                | Real | Float ( sizeMultiplier: Integer = 1 )
                | Number ( integerSize: Natural = 32, decimalSize: Natural = 32 )
                | Char ( encoding: String = 'utf-8' )
                | String <Array> ( encoding: String = 'utf-8' ) ;

<customType> ::= <TypeIdentifier> ;

<functionBody> ::= <statements> ;

<elements> ::= <element> [ , <element> ]* ;

<element> ::= <value> ;

<value> ::= <literal> | <functionCall> | <variable> | <expression> ;

<expression> ::= <term> | <expression> <binaryOperator> <expression> ;

<term> ::= <factor> | <term> <binaryOperator> <term> ;

<factor> ::= <unaryOperator> <factor> | ( <expression> ) | <value> ;

<binaryOperator> ::= + | - | * | / | < | > | == | != | && | || ;

<unaryOperator> ::= - | ! ;

<literal> ::= 'c'1 | "string" | 1 | 3.14 | true | false ;

<functionCall> ::= <functionName> ( <arguments> ) ;

<arguments> ::= <expression> [ , <expression> ]* ;

<variable> ::= <identifier> ;

<identifier> ::= [ a-zA-Z_ ] [ a-zA-Z0-9_ ]* ;

<loopBody> ::= <statements> ;

<statements> ::= <statement> [ <statement> ]* ;

<statement> ::= <declaration> | <assignment> | <functionCall> | <conditionalFunction> | <loopingFunction> ;

<assignment> ::= <variable> = <expression> ;

```

This is a simplified representation of the syntax rules using a BNF-like notation for some constructs in the "Minimal" language. For a complete and accurate grammar, additional rules for various constructs, including expressions, operators, scoping, and more, would need to be defined.

Developing a complete and precise formal grammar for a programming language involves specifying rules for all language constructs in detail, handling precedence, associativity, and other intricacies. It typically requires a dedicated language specification document with extensive details and examples.
