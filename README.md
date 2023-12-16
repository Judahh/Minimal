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
##### Integer(size:Natural=32)
##### Rational(pSize:Natural=32,qSize:Natural=32)
##### Real
###### Float(sizeMultiplier:Integer=1) | Float(size:Natural=32, mantissaSize:Natural=23)
###### Number(integerSize:Natural=32,decimalSize:Natural=32) | Number(options: NumberOptions)

#### Text Types

##### Char(encoding:String='utf-8')
literal: 'c'1 or "c"1 or \`c\`1
##### String<Type=Array>(encoding:String='utf-8')
literal: 'string' or "string" or `string`
#### Array<T?>(size?:Natural) (if it doesnot have a size it's growable)

## Example:
```minimal
# Variable/Constant/Function declaration
x: Number = 5;
y: const(Number) = 10;
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
      y: const(Number) = 10;
      w: Number = 10;
      
      constructor = (x: Number) => {
                this.x = x;
      }

      sum = () => {
               => x+y+w;
      }
};

SampleClassChild: sampleClass = { # inheritance
      constructor =| (x: Number, w: Number) => { # new constructor signature option
                this.x = x;
                this.w = w;
      }
};

SampleClass2 = (z?: Number) => {
      private x: Number = z || 5;
      y: const(Number) = 10;
};

sampleClassChild = SampleClassChild(13);
log(sampleClassChild.x); # prints 13
log(sampleClassChild.w); # prints 10
log(sampleClassChild.sum()); # prints 33

# Struct
sampleStruct = {
      x: Number = 5;
      y: const(Number) = 10;
};
log(sampleStruct.x); # prints 5
log(sampleStruct.y); # prints 10

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
  <functionName> [= | =|] (<parameters>) [=>] { <functionBody> }
  ```

#### Classes:
- Class Declaration Syntax:
  ```
  <ClassName> = { <classBody> }
  ```

#### Types/Interfaces:
- Type Declaration Syntax:
  ```
  <TypeName>:Type = { <typeBody> }
  ```

#### Conditional Statements:
- Syntax:
  ```
  if(<condition>, { <trueBlock> }, [<elseBlock>]);
  ```

#### Looping Statements:
- Syntax:
  ```
  loop(<initialization>; <condition>; <increment>, { <loopBody> });
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

functionDeclaration ::= <functionName> [= | =|] ( <parameters> ) [ => ] { <functionBody> }

classDeclaration ::= <ClassName> = { <classBody> }

typeDeclaration ::= <TypeName> : Type = { <typeBody> }

conditionalStatement ::= if ( <condition> , { <trueBlock> } , [ <elseBlock> ] ) ;

loopingStatement ::= loop ( <initialization> ; <condition> ; <increment> , { <loopBody> } )
                    | loop ( iterates ( <array> ) , { <loopBody> } )
                    | loop ( properties ( <object> ) , { <loopBody> } )
                    | loop ( { <loopBody> } , <condition> )
                    | loop ( <condition> , { <loopBody> } )
                    ;

arrayDeclaration ::= <arrayName> = [ <elements> ] ;
```

This is a simplified representation of the syntax rules using a BNF-like notation for some constructs in the "Minimal" language. For a complete and accurate grammar, additional rules for various constructs, including expressions, operators, scoping, and more, would need to be defined.

Developing a complete and precise formal grammar for a programming language involves specifying rules for all language constructs in detail, handling precedence, associativity, and other intricacies. It typically requires a dedicated language specification document with extensive details and examples.
