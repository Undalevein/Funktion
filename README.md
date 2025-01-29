<img src="https://raw.githubusercontent.com/Undalevein/Funktion/c9d5854adf0e02323d5054f57243cf65ab835b70/docs/funktion_logo.png" width="64" height="64">

# Funktion

## Da Backstory

The story behind this language begins in calculus II. I was introduced by Prof. Patrick Shanahan to the concept of parametrics, functions whose variables could be independently controlled by multiple discrete functions. I used what I had learned to expedite design of bespoke graphical components for freelance animations. This inspiration had led me down a rabbit hole of mathematical discovery, which culminated in the development of my current senior project, Parametrix, a functional animation programming suite leveraging parametric notation for quickly automating short animations. I had initially developed Funktion as a helpful way to make programming in this paradigm as quick and intuitive as possible, and although its syntax may be read by others as terse, it makes up for it with its brevity.

## About Funktion

Funktion is a functional, generational, concise programming language that leverages aspects of parametric math notation, perfect for people who love math. Functions are defined as generators that are stepped through, according to a global or local time step. The time step varies over an interval from a starting to ending point, allowing several independently-running functions that interact at different points of the program. When a variable reacher or passes its course from start to finish, or is called at a premature destination, it will return the ordered list of every output from beginning to end. Functions can have their input values increment by any amount, and either ascend in value or descend in value, depending on the orientation of the bounds.

## Language Features

### Comments

```
// This is a comment! Oooga Booga

print("Hello, World!")
```

### Types

#### Numbers

- `42`
- `5.2`

#### Character

Each character is wrapped around single quotation marks.

- `'a'`
- `'\n'` - Line Feed (New Line)
- `'\t'` - Horizontal Tab
- `'\b'` - Backspace
- `'\\'` - Backslash Character ( \\ )
- `'\"'` - Double Quotation Character ( " )

##### Strings

Each string is wrapped around double quotation marks.

- `"Hello!"`
- `"24t4t"`
- `"Bob says \"Hello\" to you!"`

### Operators

#### Arithmetic Operators

| **Operator** |         **Description**          |
| :----------: | :------------------------------: |
|     `+`      |             Addition             |
|     `-`      | Subtraction (Negation for Unary) |
|     `*`      |          Multiplication          |
|     `/`      |             Division             |
|     `**`     |          Exponentiation          |
|     `%`      |     Modulus (Not Remainder)      |

#### Bitwise Operators

| **Operator** | **Description** |
| :----------: | :-------------: |
|     `~`      |   Bitwise Not   |
|     `&`      |   Bitwise And   |
|     `\|`     |   Bitwise Or    |
|     `<<`     | Left Bit Shift  |
|     `>>`     | Right Bit Shift |

#### Miscellaneous Operators

| **Operator** |   **Description**    |
| :----------: | :------------------: |
|     `+`      | String Concatentaion |

### Ranges

Ranges are the building blocks of Funktion programming. It allows programmers to perform the same function multiple times. By default, every range iterates with a step value of 1 unless the user overrides it by specifying an interval length.

#### General Notation

##### Numerical Ranges

- `` `0..10` `` -> `0 1 2 3 4 5 6 7 8 9 10`
- `` `0..10 t1t` `` -> `0 1 2 3 4 5 6 7 8 9 10`
- `` `10..0` `` -> `10 9 8 7 6 5 4 3 2 1 0`
- `` `0..10` t-1t`` -> `10 9 8 7 6 5 4 3 2 1 0`
- `` `0..5 t0.2t` `` -> `0 0.2 0.4 0.6 ... 4.6 4.8 5`

##### Character Ranges

- `` `'a'..'e'` `` -> `a b c d e`
- `` `'y'..'t'` `` -> `y x w v u t`
- `` `'a'..'h' t2t`` -> `a c e g`
- `` `'Y'..'c' `` -> `` Y Z [ \ ] ^ _ ` a b c ``

#### Range Scoping

##### Global Scope

The top of the page is reserved for the global ranges. This will standardize the range when a function is called (unless overridden).

Syntaxwise, it is similar to the examples above.

- `` `0..10` `` is the same as `` `0..10` t1t`` (syntax sugar)
- `` `0..10` t.2t`` -> `0 0.2 0.4 0.6 0.8 ... 9.6 9.8 10`

##### Local Scope

- `` [x]:`.2..1.0` `` (Assume global scope interval is 0.2)
- `` [y]:`0..5` t1t ``

### Functions

#### Declaring Functions

- `f(x) = 2x`
- `g(x) = x`

#### Calling Functions

- `f(x).step(3)`

### Keywords

- `print` - a print statement that prints the item into the console.
  - `print("Bonjour!!!")`

## Examples

```
?? Insert Hello World Example Here
```
