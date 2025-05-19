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

### Auto

Automatic type detection

### Default Values

```
default(Type, value)
```

Example:

```minimal
default(0)
(Natural)default(0.0)
```

### Basic Types

#### Numeric Types

##### Boolean
0 or 1

##### Natural(default(Natural, 32) size, (default(Boolean, 1)) growable)
1,2,...

##### Whole(default(Natural, 32) size, (default(Boolean, 1)) growable)
0,1,2,...

##### Integer(default(Natural, 32) size, (default(Boolean, 1)) growable)
...,-2,-1,0,1,2,...

##### Rational((default(Natural, 32)) pSize, (default(Natural, 32)) qSize, (default(Boolean, 1)) growable)
Integer/Whole

##### Real
Integer.Whole

###### Float((default(Integer, 1)) sizeMultiplier, (default(Boolean, 1)) growable) or Float((default(Natural, 32)) size, (default(Natural, 23)) mantissaSize, (default(Boolean, 1)) growable)

###### Number((default(Natural, 32)) integerSize, (default(Natural, 32)) decimalSize, (default(Boolean, 1)) growable) or Number((NumberOptions) options)

#### (default(Type,Auto))Array((optional(Natural)) growable) (if it does not have a size it's growable)

literal: [1, 3, 4, 5]

#### Text Types

##### Char((default(String, "ascii")) encoding)

literal: 'c'

##### String((default(String, "ascii")) encoding)

It's a special type of Array (Array(Char)) that represents a sequence of characters.
literal: "string" or `string`

#### (default(Type,Auto))Pointer

It's a type to indicates a pointer to another variable.

#### (default(Type,Auto))Constant

It's a type to indicates a constant variable.

#### Umbrella Types

It's possible to define a type that can be any of a set of types, and it's possible to aggregate more types into an existing umbrella type.

```
(Type) Real : or(Float, Number);
(Type) Numeric : or(Boolean , Natural , Whole , Integer , Rational , Real);
(Type) Text : or(Char , String);
```

### Variable instatiation:

```
[<Type>] <variableName> [: <value>];
```

Example:

```
(or(Integer, String)) a : 2;
(Integer) b : 3;
c : 4;
d;
```

### Function:

```
[(<TypeParams>)]<functionName>(<Params>);
```

Example:

```minimal
someFunction0(); # receives no params
someFunction1(x,y,z); # receives params in order
someFunction1(object); # receives params as an object that has properties with names just like the params of the someFunction1
(SomeType)someFunction2(); # receives SomeType as a Type param for generics
(SomeType, SomeOtherType)someFunction3(); # receives SomeType and SomeOtherType as Type params in order for generics
(GreaterType)someFunction3(); # receives Greater as Type that has properties with names names just like the Type params of the someFunction3
someFunction3.name; # returns the name of the function (if it's not a pointer, it's someFunction3, if it's a pointer it's the name of the function that the pointer points to)
```

#### Control Function:

##### Variable Instantiation Function:

Syntax:
```
[(Type)]new(<name>[, <value>]);
```

Example:

```minimal
new("y");
(Number)new("k");
(Number)new("x", 5);
new("p", x, Pointer);
((Number)Pointer)new("q");
((Number)Constant)new("c");
(Constant)new("c2", 6);
((Pointer)Constant)new("c3", x);
new("z", 10);
new("array", [1,2,3,4]);
(Array)new("array2", [1,2,3,4]);
new("s", "hello");
(String)new("s2", "hello");
```

##### Variable Setting Function:

Syntax:
```
set(<name>, <value>);
```

Example:

```minimal
set(y, 5);
set(k, 6);
set(x, k);
```

##### Pointer Setting Function:

Syntax:
```
points(<name>, <value>);
```

Example:

```minimal
points(y, 5);
points(k, 6);
points(x, k);
```

##### Mathematical Operations Functions:

Syntax:

```
sum(<value1>, <value2>);
subtract(<value1>, <value2>);
multiply(<value1>, <value2>);
divide(<value1>, <value2>);
modulo(<value1>, <value2>);
power(<value1>, <value2>);
squareRoot(<value>);
root(<value>, <root>);
absolute(<value>);
negative(<value>);
inverse(<value>);
logarithm(<value>, <base>);
```

##### Comparison Function:

Syntax:
```
(Type) equalType : or("same", "strict", "loose", "truthy"); # same: same address in memory, strict: checks type and value, loose: checks value, truthy: checks if both are truthy
equals(<value1>, <value2>[, <equalType>]);
notEquals(<value1>, <value2>[, <equalType>]);
greaterThan(<value1>, <value2>[, <equalType>]);
greaterThanOrEquals(<value1>, <value2>[, <equalType>]);
lessThan(<value1>, <value2>[, <equalType>]);
lessThanOrEquals(<value1>, <value2>[, <equalType>]);
```

##### Scope:
Syntax:
```
{ <statements> }
```
Example:

```minimal
{
    new("x", 5);
    new("y", 6);
    set(x, y);
    k : 7;
}
set(x, 7); # x is not defined

# function scope
someFunction({ # function receives a multiline scope
    new("x", 5);
    new("y", 6);
    set(x, y);
})
someFunction({ # function receives a multiline scope
    new("x", 5);
    new("y", 6);
    set(x, y);
    -> x; # return of the scope return is ->
})
someFunction(new("x", 5)) # function receives a single line scope and returns the value of the scope

someOtherFunction((x,y) -> { # function receives a multiline scope, sending the parameters
    set(x, y);
})

someOtherFunction((x,y) -> set(x, y) ) # function receives a silgle line scope, sending the parameters

someOtherFunction2(x -> set(x, y) ) # function receives a silgle line scope, sending a single parameter
```

##### Conditional Function:

Syntax:

```
if(<condition>, <trueBlock> , [<elseBlock>]...);
# add a contition instead of elseBlock for an else if
if(<condition>, <trueBlock> , <condition>, <trueBlock2> , [<elseBlock>]...);
# for cases:
if(<element>, <value1> , <value1Block>, 
   <value2> , <value2Block>, 
   <value3> , <value3Block>, 
   [<elseBlock>]...
);
```

Example:

```minimal
if(lessThan(x, y), {
    log('x is less than y');
}, log('x is greater than or equal to y'));

if(lessThan(x, y), {
    log('x is less than y');
}, equals(x, y), {
    log('x is equal to y');
}, {
    log('x is greater than y');
});

new("x", 5);
if(x, 
    1, next -> {
        log('x is 1');
    },
    2, next -> {
        log('x is 2');
    },
    3, next -> {
        log('x is 3');
    },
    4, next -> {
        log('x is 4');
        next();
    },
    {
        log('x is greater or equal than 4 or less than 1');
    },
);
```

###### Ternary

```minimal
# Ternary (using if function)
new("result", if(lessThan(x, y), { -> x }, y));
or
new("result", if(lessThan(x, y), { -> x }, { -> y }));
or
new("result", if(lessThan(x, y), x, y));
or
new("result", if(lessThan(x, y), x, { -> y }));

the default true value is 1 or true and the default false value is 0 or false
example:
new("result", if(lessThan(x, y), x)); # if x < y return x else return 0
new("result", if(lessThan(x, y), x, 0)); # if x < y return x else return 0
new("result", if(lessThan(x, y))); # if x < y return 1 else return 0
new("result", if(lessThan(x, y),, y)); # if x < y return 1 else return y
```

##### Looping Function:

is a function for looping

Syntax:

```
loop(<array>, element -> { <loopBody> });
loop(properties(<object>), element -> { <loopBody> });
loop({ <loopBody> }, <condition>);
loop(<condition>, { <loopBody> });
```

Example:

```minimal
new("a", [1,2,3,4,5]);
loop(iterates(a), e -> {
    log('Iteration: ', e);
}); # for of like loop

(Number)new("a", [1,2,3,4,5]);
loop(iterates(a), (Number) e -> {
    log('Iteration: ', e);
}); # for of like loop

new("b",SampleClass(6));
loop(properties(b), i -> {
    log('Iteration: ', i);
}); # for in like loop

new("j", 0);
loop({
    log('Iteration: ', j);
}, lessThan(j, 5)); # do while like loop

new("k", 0);
loop(lessThan(k, 5), {
    log('Iteration: ', k);
}); # while like loop

new("k", 0);
loop(lessThan(k, 5), {
    log('Iteration: ', k);
    set(k, sum(k, 1));
}); # for like loop
```

##### Try Catch Function:

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
}, ((Error) e)->{
    log('catch block');
});

or

try({
    log('try block');
}).catch(((Error) e)->{
    log('catch block');
});

or

try({
    log('try block');
}).catch(((SomeError) e)->{
    log('catch block');
}).catch(((AnotherError) e)->{
    log('another catch block');
});
```

##### Error and Exception Function:

Error is a type of exception
Error will crash the program if not handled
Exception will not crash the program if not handled, just reload the program if not handled

###### Error Function:

```minimal
new("someFunction", (x,y) -> {
    throw(Error('Some error'));
});
new("someOtherFunction", (z) -> {
    someFunction(1,z);
});
someOtherFunction(2); # will log the error message and the stack trace
Some error
Code: 500
Stack trace:
    at someFunction (file:line:column)
    using (x : 1, y : 2)
    at someOtherFunction (file:line:column)
    using (z : 2)
    at main (file:line:column)


new("someFunction", (x: Number,y) -> {
    throw(Exception('Some error', 404));
});

someFunction(1,2); # will log the error message and the stack trace
Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    using (x: Number : 1, y : 2)
    at main (file:line:column)


new("someFunction", (x,y) -> {
    throw(Exception('Some error'));
});
someFunction(1,2); # will log the error message and the stack trace
Some error
Code: 400
Stack trace:
    at someFunction (file:line:column)
    using (x : 1, y : 2)
    at main (file:line:column)

new("someFunction", (x,y) -> {
    throw(Exception('Some error', 404));
});

someFunction(1,2); # will log the error message and the stack trace

Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    using (x : 1, y : 2)
    at main (file:line:column)

Hide Secret Values

new("someFunction", ((Secret) x, (Secret(Number)) y, z) -> {
    throw(Exception('Some error', 404));
});

someFunction(1,2,3); # will log the error message and the stack trace

Some error
Code: 404
Stack trace:
    at someFunction (file:line:column)
    using (x: Secret, y: Secret(Number), z : 3)
    at main (file:line:column)

```

##### Array Functions:

#### Function Declaration:

Syntax:

```
[(<parameters>) -> ]<functionBody> ;
functionBody: { <statementsWithReturn> } | <expression> ;
```

Example:

```minimal
(((Number) a, (Number) b) -> Number)new("sum", ((Number) a, (Number) b) -> {
    log('Sum a:', a, ' and b:', b);
    -> sum(a, b); # return is ->
});
new("sub", ((Number) a, (Number) b) -> subtract(a,b));

new("mult", ((Number) a, (Number) b)->multiply(a,b));
```

## Struct

```minimal
Like a class but without functions (but can have constructor)
If it does not have a constructor must have all variables initialized and cannot be instantiated
new("sampleStruct", {
    (Number) x : 5;
    (Const(Number)) y : 10;
});
or
sampleStruct : {
    (Number) x : 5;
    (Const(Number)) y : 10;
};
or
If it has a constructor it can have variables not initialized but must be instantiated
new("SampleStruct", {
    (Number) x;
    (Const(Number)) y;
    ((Number) x, (Number) y) -> {
        set(this.x, x);
        set(this.y, y);
    };
    inc : ((Number) a) -> {
        set(a, sum(a, 1));
        -> a; # return is ->
    };
});
or
sampleStruct : {
    (Number) x;
    (Const(Number)) y;
    ((Number) x, (Number) y) -> {
        set(this.x, x);
        this.y: y;
    };
    inc : ((Number) a) -> {
        a: sum(a, 1);
        -> a; # return is ->
    };
};

new("sampleStruct", SampleStruct(5, 10));

log(sampleStruct.x); # logs 5
log(sampleStruct.y); # logs 10
(Number)new("numberExample", 5);
new("numberExample2", sampleStruct.inc(numberExample));
log(numberExample); # logs 5
log(numberExample2); # logs 6
new("numberExample", Number(5));
new("numberExample2", sampleStruct.inc(numberExample*));
log(numberExample); # logs 6
log(numberExample2); # logs 6
```

## Engine

```minimal
Like a class but without variables (Does not have constructor, and cannot be instantiated, just used as an object)
new("sampleEngine", {
    (protected()) init : () -> {
        log('Engine initialized');
    };
    start : () -> {
        this.init();
        log('Engine started');
    };
    sum : ((Number) a, (Number) b) -> {
        log('Sum a:', a, ' and  b:', b);
        -> sum(a, b); # return is ->
    };
});

# its possible to merge a engine with a struct and it will become a class

new("SampleClass", merge(someStruct, someClass));
```

## Return

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
new("someFunction", () -> {
  if(greaterThan(1, 0), {
    if(greaterThan(2, 0), {
        -> 2;
    }, {
        -> -2;
    });
    -> 1;
  }, {
    -> -1;
  });
  -> 0;
});
# will return 0 because of the '->' of each if statement is returning the value for the current {} (scope)

new("someFunction", () -> {
  if(greaterThan(1, 0), {
    if(greaterThan(2, 0), {
        -> 2;
    }, {
        -> -2;
    });
    super.-> 1;
  }, {
    super.-> -1;
  });
  -> 0;
});
# will return 1 because of the 'super.->' of the second if statement is returning the value for the parent {} (scope)
new("someFunction", () -> {
  if(greaterThan(1, 0), {
    if(greaterThan(2, 0), {
        super.-> 2;
    }, {
        super.-> -2;
    });
    super.-> 1;
  }, {
    super.-> -1;
  });
  -> 0;
});
# will return 0 because of the 'super.->' of the second if statement is returning the value for the parent {} (scope) so the 'super.->' of the first if statement is not being executed

new("someFunction", () -> {
  if(greaterThan(1, 0), {
    if(greaterThan(2, 0), {
        super.super.-> 2;
    }, {
        super.super.-> -2;
    });
    super.-> 1;
  }, {
    super.-> -1;
  });
  -> 0;
});
# will return 2 because of the 'super.super.->' of the first if statement is returning the value for the final {} (scope)

new("someFunction", () -> {
  if(greaterThan(1, 0), {
    if(greaterThan(2, 0), {
        final.-> 2;
    }, {
        final.-> -2;
    });
    super.-> 1;
  }, {super.
    super.-> -1;
  });
  -> 0;
});
# will return 2 because of the 'final.->' of the first if statement is returning the value for the parent of the parent {} (scope)

new("someFunction", () -> {
  if(greaterThan(1, 0), [
    if(greaterThan(2, 0), {
        -> 2;
    }, {
        -> -2;
    });
    -> 1;
  ], [
    -> -1;
  ]);
  -> 0;
});
# will return 2 because the '->' is returning the value for the closest {} (scope)
```

## Enum

```minimal
(Enum)new("Color", [
    RED,
    GREEN,
    BLUE
]);
or
(Enum)new("Color", [
    RED : 1,
    GREEN : 2,
    BLUE : 3,
]);
or
(Enum)new("Color", [
    RED : 1,
    GREEN,
    BLUE,
}];
or
(Enum)new("Color", [
    RED : 'r',
    GREEN : 'g',
    BLUE : 'b'
]);
```

## Classe

Syntax:

```
  { <classBody> } ;
```

### Struct Oriented Class

```minimal
new("SampleClass", {
    (private(Number)) x: 5;
    (Const(Number)) y : 10;
    (Number) w : 10;

    ((Number) x) -> { set(this.x, x); }; # constructor

    sum: () -> {
        -> sum(x,y,w);
    };

    value : () -> {
        -> x;
    };
});
or
SampleClass : {
    (private(Number)) x: 5;
    (Const(Number)) y : 10;
    (Number) w : 10;

    ((Number) x) -> { set(this.x, x); }; # constructor

    sum: () -> {
        -> sum(x,y,w);
    };

    value : () -> {
        -> x;
    };
};

new("SampleClassChild", extends(SampleClass, { 
    ((Number) x, (Number) w) -> { # new constructor signature option
        set(this.x, x);
        set(this.w, w);
    };
}));
or
SampleClassChild : extends(SampleClass, { 
    ((Number) x, (Number) w) -> { # new constructor signature option
        set(this.x, x);
        set(this.w, w);
    };
});
```

### Function Oriented Class

```minimal
new("SampleClass2", ((or(Number, undefined, null)) z) -> {
    sampleFunctionThatReturnsTen : () -> {
        -> 10;
    };
    (private(Number)) x : or(z, 5);
    (Const(Number)) y : 10;

    -> this;
};
or
SampleClass2 : ((or(Number, undefined, null)) z) -> {
    sampleFunctionThatReturnsTen : () -> {
        -> 10;
    };
    (private(Number)) x : or(z, 5);
    (Const(Number)) y : 10;

    -> this;
};

new("sampleClassChild", SampleClassChild(13));
log(sampleClassChild.x);     # logs 13
log(sampleClassChild.w);     # logs 10
log(sampleClassChild.sum()); # logs 33
```

## Type/Interface

Syntax:

```
{ <typeBody> } ;
```

Example:

```minimal
new("Person", { # is a Type
    (String) name;
    (Number) age;
});

new("Robot", {
    (Number) id;
});

new("Worker", and(Person,{ # extends Person
    (String) job;
}));

new("Thinker", or(Person,Robot)); # Thinker can be a Person or a Robot

(Human)new("Person", { # Class Human implements Person
      ((String) name, (Number) age) -> {
        this.name : name;
        this.age : age;
      }
      eat : () -> log('eat');
});
```

## Operand

### Operand Definition

```minimal
global.((Number) a, '<', (Number) b) -> {
    -> lessThan(a, b);
};

global.((Number) a, '>', (Number) b) -> {
    -> greaterThan(a, b);
};

global.((Number) a, '<=', (Number) b) -> {
    -> lessThanOrEquals(a, b);
};

global.((Number) a, '>=', (Number) b) -> {
    -> greaterThanOrEquals(a, b);
};

global.((Number) a, '=', (Number) b) -> {
    -> equals(a, b);
};

global.((Number) a, '->', (Number) b) -> {
    -> exists(a) ? points(a.name, b) : new(a.name, b, Pointer);
};

global.((Number) a, '+', (Number) b) -> { # The literal string shows the symbol(s) used as operator
    -> sum(a + b);
};

global.((SampleClass) a, '+', (SampleClass) b) -> { # The literal string shows the symbol(s) used as operator
    -> SampleClass(a.value() + b.value());
};

global.((SampleClass) a, '+', (Numeric) b) -> {
    -> SampleClass(a.value() + b);
};

global.((Numeric) a, '+', (SampleClass) b) -> {
    -> SampleClass(a + b.value());
};

global.('|', (SampleClass) a, '|') -> {
    -> if(a.value() > 0, a.value(), -a.value());
};

global.('!', (Numeric) a) -> {
    -> not(a);
};

global.((Number) a, '=', (Operand) o, (Number) b) -> {
    -> a = a o b;
};

global.((Any) c, '?', (Scope) t, '!', (Scope) f) -> {
    -> if(c, t, f);
};

new("result", x < y ? { -> x } ! y);

x < y ? log('x is less than y') : {
    log('x is greater than or equal to y');
};
```

### Operand Usage

```minimal
sampleClass : SampleClass(6);
sampleClass2 : SampleClass(7);
log((sampleClass + sampleClass2).value); # logs 13 (usage of global.((SampleClass) a, '+', (SampleClass) b))
log((sampleClass + 5).value); # logs 11 (usage of global.((SampleClass) a, '+', (Numeric) b))
sampleClass3 : SampleClass(-5);
log(|sampleClass3|); # logs 5 (usage of global.('|', (SampleClass) a, '|'))
```


### Operand Precedence

```minimal
numberPlusNumber : global.((Number) a,'+',(Number) b) ->{
      ->Number.sum(a,b);
};

numberTimesNumber : global.((Number) a,'*',(Number) b) ->{
      ->Number.mul(a,b);
};

numberDivideNumber : global.((Number) a,'/',(Number) b) ->{
      ->Number.div(a,b);
};

global.precedence+:[ # Order evaluated left to right for the same level
      [numberTimesNumber,numberDivideNumber], # higher level
      numberPlusNumber # lower level
];
```

## Reference Identifier

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
numberExample : Number(5);
numberExampleReferece -> numberExample;
numberExampleClone : numberExample;
functionExample : ()->{};
classExample : {
  () -> {};
};

# it's possible to use typeName properties to get the type name and variableName properties to get the variable name

log(numberExample.typeName); # logs Number
log(numberExample.variableName); # logs numberExample
log(numberExampleReferece.typeName); # logs Number
log(numberExampleReferece.variableName); # logs numberExample
log(numberExampleClone.typeName); # logs Number
log(numberExampleClone.variableName); # logs numberExampleClone
log(functionExample.typeName); # logs Function
log(functionExample.variableName); # logs functionExample
log(classExample.typeName); # logs Object
log(classExample.variableName); # logs classExample
```
