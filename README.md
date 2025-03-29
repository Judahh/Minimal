# Minimal

Language name: Minimal

## Language Goals and Features:

- Minimal keywords
- Minimal symbols
- TypeScript-like syntax
- Custom types

## Compilation/Transpilation
- LLVM
- JS/TS

## Types

### Basic Types

#### Numeric Types

##### Boolean

##### Natural(size:Natural=32, growable: Boolean = true)

##### Whole(size:Natural=32, growable: Boolean = true)

```minimal
      Whole:Type = Unsigned(Integer);
      Whole:Type = Natural & 0; # another example to represent the same
```
##### Integer(size:Natural=32, growable: Boolean = true)

##### Rational(pSize:Natural=32,qSize:Natural=32, growable: Boolean = true)

##### Real

###### Float(sizeMultiplier:Integer=1, growable: Boolean = true) | Float(size:Natural=32, mantissaSize:Natural=23, growable: Boolean = true)

###### Number(integerSize:Natural=32, decimalSize:Natural=32, growable: Boolean = true) | Number(options: NumberOptions)

#### Text Types

##### Char(encoding:String='ascii')

literal: 'c'

##### String<Type=Array>(encoding:String='ascii')

literal: "string" or `string`

#### Array<T?>(size?:Natural) (if it does not have a size it's growable)

#### Umbrella Types

It's possible to define a type that can be any of a set of types, and it's possible to aggregate more types into an existing umbrella type.

```minimal
Real:Type = Float | Number;
Numeric:Type = Boolean | Natural | Whole | Integer | Rational | Real;
Text:Type = Char | String;

How to add more types to an existing umbrella type:
For the current file:
Numeric |= NewNumeric | OtherNewNumeric; # ':Type' is only needed on declaration of a type, not in an extension
For the everywhere it's imported:
global.Numeric:Type |= NewNumeric | OtherNewNumeric;
```

## Declaration

Syntax:

```
<identifier>[: <type>] [=|->[<operator>] <initializer>)] ;
```

### Variable/Constant:

Example:

```minimal
# Variable/Constant/Function declaration
x: Number = 5;
y: Const(Number) = 10;
z = 20;
```


#### Array:

Syntax:

```
<arrayName> = [ <elements> ];
```

#### String:

Syntax:

```
<stringName> = "<elements>";
```

### Function:

#### Control Function:

##### Comparison Function:

Syntax:
```
equalType: Type = 'same' |  | 'strict' | 'loose';
equals(<value1>, <value2>, <equalType>);
notEquals(<value1>, <value2>, <equalType>);
greaterThan(<value1>, <value2>, <equalType>);
greaterThanOrEquals(<value1>, <value2>, <equalType>);
lessThan(<value1>, <value2>, <equalType>);
lessThanOrEquals(<value1>, <value2>, <equalType>);
```

##### Conditional Function:

Syntax:

```
if(<condition>, <trueBlock> , [<elseBlock>]);
```

Example:

```minimal
if(x < y, {
    log('x is less than y');
}, log('x is greater than or equal to y'));
```

###### Ternary

```minimal
# Ternary (using if function)
result = if(x < y, { -> x }, y);
or
result = if(x < y, { -> x }, { -> y });
or
result = if(x < y, x, y);
or
result = if(x < y, x, { -> y });

the default true value is 1 or true and the default false value is 0 or false
example:
result = if(x < y, x); # if x < y return x else return 0
result = if(x < y, x, 0); # if x < y return x else return 0
result = if(x < y); # if x < y return 1 else return 0
result = if(x < y,, y); # if x < y return 1 else return y
```

##### Looping Function:

Syntax:

```
loop(<initialization>, <condition>, <increment>, { <loopBody> });
loop(iterates(<array>), { <loopBody> });
loop(properties(<object>), { <loopBody> });
loop({ <loopBody> }, <condition>);
loop(<condition>, { <loopBody> });
```

#### Function Declaration:

Syntax:

```
[(<parameters>)] [->] <functionBody> ;
functionBody: { <statementsWithReturn> } | <expression> ;
```

Example:

```minimal
sum: (a: Number, b: Number) -> Number = (a: Number, b: Number) -> {
      log('Sum a:', a, ' and b:', b);
      -> a + b; # return is ->
};
sub = (a: Number, b: Number) -> a-b;

multiply = (a: Number, b: Number)->a*b;
multiply |= (a: Number, b: Number, c: Number)->a*b*c; // multiple function signatures for the same naming using |=
```

## Try Catch statement

```minimal
# Try Catch statement  (is a function for statement)
try({
    log('try block');
}, {
    log('catch block');
});

or

try({
    log('try block');
}, (e: Error)->{
    log('catch block');
});

or

try({
    log('try block');
}).catch((e: Error)->{
    log('catch block');
});

or

try({
    log('try block');
}).catch((e: SomeError)->{
    log('catch block');
}).catch((e: AnotherError)->{
    log('another catch block');
});
```

## Looping statement

is a function for looping

```minimal
loop(i=0, i < 5, i++, {
    log('Iteration: ' + i);
}); # for like loop

a=[1,2,3,4,5];
loop(iterates(a), {
    log('Iteration: ' + a);
}); # for of like loop

b=SampleClass(6);
loop(properties(b), {
    log('Iteration: ' + i);
}); # for in like loop

j=0;
loop({
    log('Iteration: ' + j);
}, j<5); # do while like loop

k=0;
loop(k<5,{
    log('Iteration: ' + k);
}); # while like loop
```

## Error and Exception

Error is a type of exception
Error will crash the program if not handled
Exception will not crash the program if not handled, just reload the program if not handled

### Error

```minimal
someFunction = (x,y) -> {
    throw(Error('Some error'));
};
someOtherFunction = (z) -> {
    someFunction(1,z);
};
someOtherFunction(2); # will log the error message and the stack trace
Some error
Code: 500
Stack trace:
    at someFunction (file:line:column)
    where (x = 1, y = 2)
    at someOtherFunction (file:line:column)
    where (z = 2)
    at main (file:line:column)


someFunction = (x: Number,y) -> {
    throw(Exception('Some error', 404));
};

someFunction(1,2); # will log the error message and the stack trace
Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    where (x: Number = 1, y = 2)
    at main (file:line:column)


someFunction = (x,y) -> {
    throw(Exception('Some error'));
};
someFunction(1,2); # will log the error message and the stack trace
Some error
Code: 400
Stack trace:
    at someFunction (file:line:column)
    where (x = 1, y = 2)
    at main (file:line:column)

someFunction = (x,y) -> {
    throw(Exception('Some error', 404));
};

someFunction(1,2); # will log the error message and the stack trace

Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    where (x = 1, y = 2)
    at main (file:line:column)

Hide Secret Values

someFunction = (x: Secret, y: Secret(Number), z) -> {
    throw(Exception('Some error', 404));
};

someFunction(1,2,3); # will log the error message and the stack trace

Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    where (x: Secret, y: Secret(Number), z = 3)
    at main (file:line:column)

```

## Struct

```minimal
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
      (x: Number, y: Number) -> {
                this.x = x;
                this.y = y;
      };
      inc = (a: Number) -> {
                a++;
                -> a; # return is ->
      };
};
sampleStruct = SampleStruct(5, 10);

log(sampleStruct.x); # logs 5
log(sampleStruct.y); # logs 10
numberExample = Number(5);
numberExample2 = sampleStruct.inc(numberExample);
log(numberExample); # logs 5
log(numberExample2); # logs 6
numberExample = Number(5);
numberExample2 = sampleStruct.inc(numberExample*);
log(numberExample); # logs 6
log(numberExample2); # logs 6
```

## Engine

```minimal
Like a class but without variables (Does not have constructor, and cannot be instantiated, just used as an object)
sampleEngine = {
      protected init = () -> {
                log('Engine initialized');
      };
      start = () -> {
                this.init();
                log('Engine started');
      };
      sum = (a: Number, b: Number) -> {
                log('Sum a:', a, ' and  b:', b);
                -> a+b; # return is ->
      };
};

# its possible to merge a engine with a struct and it will become a class

SampleClass= someStruct & someClass;
```

## Return types

```minimal
For a '{}' block (scope) use:
  '->' or 'this.->' returns the value for the current scope
  'super.->' returns the value for the parent scope
  'final.->' returns the value for the final scope
  'global.->' returns the value for the global scope (program)
For a '[]' block (scope) use:
  '->' returns the value for the closest {} (scope)
  'super.->' returns the value for the parent of the closest {} (scope)
  'final.->' returns the value for the final scope
  'global.->' returns the value for the global scope (program)

example:
someFunction = () -> {
  if(1 > 0, {
      if(2 > 0, {
          -> 2;
      }, {
          -> -2;
      });
      -> 1;
  }, {
      -> -1;
  });
  -> 0;
}
# will return 0 because of the '->' of each if statement is returning the value for the current {} (scope)

someFunction = () -> {
  if(1 > 0, {
      if(2 > 0, {
          -> 2;
      }, {
          -> -2;
      });
      super.-> 1;
  }, {
      super.-> -1;
  });
  -> 0;
};
# will return 1 because of the 'super.->' of the second if statement is returning the value for the parent {} (scope)
someFunction = () -> {
  if(1 > 0, {
      if(2 > 0, {
          super.-> 2;
      }, {
          super.-> -2;
      });
      super.-> 1;
  }, {
      super.-> -1;
  });
  -> 0;
};
# will return 0 because of the 'super.->' of the second if statement is returning the value for the parent {} (scope) so the 'super.->' of the first if statement is not being executed

someFunction = () -> {
  if(1 > 0, {
      if(2 > 0, {
          super.super.-> 2;
      }, {
          super.super.-> -2;
      });
      super.-> 1;
  }, {
      super.-> -1;
  });
  -> 0;
};
# will return 2 because of the 'super.super.->' of the first if statement is returning the value for the final {} (scope)

someFunction = () -> {
  if(1 > 0, {
      if(2 > 0, {
          final.-> 2;
      }, {
          final.-> -2;
      });
      super.-> 1;
  }, {super.
      super.-> -1;
  });
  -> 0;
};
# will return 2 because of the 'final.->' of the first if statement is returning the value for the parent of the parent {} (scope)

someFunction = () -> {
  if(1 > 0, [
      if(2 > 0, {
          -> 2;
      }, {
          -> -2;
      });
      -> 1;
  ], [
      -> -1;
  ]);
  -> 0;
};
# will return 2 because the '->' is returning the value for the closest {} (scope)
```

## Enum

```minimal
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
```

## Classes

Syntax:

```
  <ClassName> = { <classBody> } ;
```

### Struct Oriented Class

```minimal
SampleClass = {
      private x: Number = 5;
      y: Const(Number) = 10;
      w: Number = 10;

      (x: Number) -> { this.x = x; }; # constructor

      sum = () -> {
               -> x+y+w;
      };

      value = () -> {
               -> x;
      };
};

SampleClassChild = extends(SampleClass, { 
      (x: Number, w: Number) -> { # new constructor signature option
                this.x = x;
                this.w = w;
      };
});
```

### Function Oriented Class

```minimal
SampleClass2 = (z?: Number) -> {
      sampleFunctionThatReturnsTen = () -> {
            -> 10;
      };
      private x: Number = z || 5;
      y: Const(Number) = 10;
      -> this;
};

sampleClassChild = SampleClassChild(13);
log(sampleClassChild.x);     # logs 13
log(sampleClassChild.w);     # logs 10
log(sampleClassChild.sum()); # logs 33
```

## Types/Interfaces

Syntax:

```
  <TypeName>:Type = { <typeBody> } ;
```

Example:

```minimal
Person = { # is a Type
     name: String;
     age: Number;
};

Robot = {
    id: Number;
}

Worker = and(Person,{ # extends Person
     job: String;
});

Thinker = or(Person,Robot); # Thinker can be a Person or a Robot

Human: Person = { # Class Human implements Person
      (name: String, age: Number) -> {
                this.name = name;
                this.age = age;
      }
      eat = () -> log('eat');
}
```

## Operand

### Operand Definition

```minimal
global.(a: SampleClass, '+', b: SampleClass) -> { # The literal string shows the symbol(s) used as operator
    -> SampleClass(a.value() + b.value());
};

global.(a: SampleClass, '+', b: Numeric) -> {
    -> SampleClass(a.value() + b);
};

global.(a: Numeric, '+', b: SampleClass) -> {
    -> SampleClass(a + b.value());
};

global.('|', a: SampleClass, '|') -> {
    -> if(a.value() > 0, a.value(), -a.value());
};

# TODO: Make a desing for creating a operand for condition (using ternary syntax)

result = x < y ? { -> x } : y;

x < y ? log('x is less than y') : {
    log('x is greater than or equal to y');
};
```

### Operand Usage

```minimal
sampleClass = SampleClass(6);
sampleClass2 = SampleClass(7);
log((sampleClass + sampleClass2).value); # logs 13 (usage of global.(a: SampleClass, '+', b: SampleClass))
log((sampleClass + 5).value); # logs 11 (usage of global.(a: SampleClass, '+', b: Numeric))
sampleClass3 = SampleClass(-5);
log(|sampleClass3|); # logs 5 (usage of global.('|', a: SampleClass, '|'))
```


### Operand Precedence

```minimal
numberPlusNumber = global.(a:Number,'+',b:Number) ->{
      ->Number.add(a,b);
};

numberTimesNumber = global.(a:Number,'*',b:Number) ->{
      ->Number.mul(a,b);
};

numberDivideNumber = global.(a:Number,'/',b:Number) ->{
      ->Number.div(a,b);
};

global.precedence+=[ # Order evaluated left to right for the same level
      [numberTimesNumber,numberDivideNumber], # higher level
      numberPlusNumber # lower level
];
```

## Reference Identifiers

### global 
is a global object that can be used to define global properties, functions, operators...

### self 
is a global for the current class, it can be used to define class properties, functions, operators...

### this 
is a reference to the current object, it can be used to access the current object properties, functions, operators...

### internal 
is a reference to the current function, it can be used to access the current function params, name, properties...


## Instantiation

```minimal
numberExample = Number(5);
numberExampleReferece -> numberExample;
numberExampleReferece2* = numberExample;
numberExampleClone = numberExample;
functionExample = ()->{};
classExample = {
  () -> {};
};

# it's possible to use typeName properties to get the type name and variableName properties to get the variable name

log(numberExample.typeName); # logs Number
log(numberExample.variableName); # logs numberExample
log(numberExampleReferece.typeName); # logs Number
log(numberExampleReferece.variableName); # logs numberExample
log(numberExampleReferece2.typeName); # logs Number
log(numberExampleReferece2.variableName); # logs numberExample
log(numberExampleClone.typeName); # logs Number
log(numberExampleClone.variableName); # logs numberExampleClone
log(functionExample.typeName); # logs Function
log(functionExample.variableName); # logs functionExample
log(classExample.typeName); # logs Object
log(classExample.variableName); # logs classExample
```
