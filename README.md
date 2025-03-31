<p align="center">
  <a href="https://undalevein.github.io/Funktion/">
    <img src="https://raw.githubusercontent.com/Undalevein/Funktion/c9d5854adf0e02323d5054f57243cf65ab835b70/docs/funktion_logo.png" width="64" height="64">
  </a>
</p>

<p align="center">
**Funktion**
</p>

## Da Backstory

The story behind this language begins in calculus II. I was introduced by Prof. Patrick Shanahan to the concept of parametrics, functions whose variables could be independently controlled by multiple discrete functions. I used what I had learned to expedite the design of bespoke graphical components for freelance animations. This inspiration led me down a rabbit hole of mathematical discovery, which culminated in the development of my current senior project, Parametrix, a functional animation programming suite leveraging parametric notation for quickly automating short animations. I initially developed Funktion as a helpful way to make programming in this paradigm as quick and intuitive as possible. Although its syntax may be read by others as terse, it makes up for it with its brevity.

## About Funktion

Funktion is a functional, generational, concise programming language that leverages aspects of parametric math notation, perfect for people who love math. Functions are defined as generators that are stepped through according to a global or local time step. The time step varies over an interval from a starting to ending point, allowing several independently-running functions to interact at different points in the program. When a variable reaches or passes its course from start to finish, or is called at a premature destination, it will return the ordered list of every output from beginning to end. Functions can have their input values increment by any amount and either ascend or descend in value, depending on the orientation of the bounds.

---

## Language Features

### Comments

```funktion
// This is a comment! Oooga Booga
print("Hello, World!")
```

### Types

#### Numbers

- `42`
- `5.2`

#### Characters

Each character is wrapped in single quotation marks.

- `'a'`
- `'\n'` - Line Feed (New Line)
- `'\t'` - Horizontal Tab
- `'\r'` - Carriage Return
- `'\b'` - Backspace
- `'\\'` - Backslash Character (`\`)
- `'\"'` - Double Quotation Character (`"`)

#### Strings

Each string is wrapped in double quotation marks.

- `"Hello!"`
- `"24t4t"`
- `"Bob says \"Hello\" to you!"`

---

### Operators

#### Arithmetic Operators

| **Operator** | **Description**         | **Example** |
| ------------ | ----------------------- | ----------- |
| `+`          | Addition                | `4 + 5`     |
| `-`          | Negation                | `-9`        |
| `-`          | Subtraction             | `7 - 2`     |
| `*`          | Multiplication          | `4 * 8`     |
| `/`          | Division                | `12 / 3`    |
| `**`         | Exponentiation          | `2 ** 9`    |
| `%`          | Modulus (Not Remainder) | `11 % 2`    |

#### Bitwise Operators

| **Operator** | **Description** | **Example** |
| ------------ | --------------- | ----------- |
| `~`          | Bitwise Not     | `~9`        |
| `&`          | Bitwise And     | `7 & 3`     |
| `\|`         | Bitwise Or      | `2 \| 8`    |
| `<<`         | Left Bit Shift  | `7 << 2`    |
| `>>`         | Right Bit Shift | `64 >> 4`   |

#### Relational Operators

| **Operator** | **Description**        | **Example** |
| ------------ | ---------------------- | ----------- |
| `==`         | Equals                 | `9 == 9`    |
| `!=`         | Not Equals             | `9 != 9`    |
| `<`          | Less Than              | `9 < 9`     |
| `<=`         | Less Than or Equals    | `9 <= 9`    |
| `>`          | Greater Than           | `9 > 9`     |
| `>=`         | Greater Than or Equals | `9 >= 9`    |

#### Miscellaneous Operators

| **Operator** | **Description**      | **Example**     |
| ------------ | -------------------- | --------------- |
| `+`          | String Concatenation | `"Hi" + " Joe"` |

---

### Ranges

Ranges are the building blocks of Funktion programming. They allow programmers to perform the same function multiple times. By default, every range iterates with a step value of 1 unless the user overrides it by specifying an interval length. Intervals can also start at a value and generate unbounded by an end value, ending their generation under a given function print call

#### General Notation

##### Numerical Ranges

- `` `0..10` `` → `0 1 2 3 4 5 6 7 8 9 10`
- `` `0..10 t1t` `` → `0 1 2 3 4 5 6 7 8 9 10`
- `` `10..0` `` → `10 9 8 7 6 5 4 3 2 1 0`
- `` `0..10 t-1t` `` → `0`
- `` `0..5 t0.2t` `` → `0 0.2 0.4 0.6 ... 4.6 4.8 5`

##### Infinite Numerical Ranges

- `` `0..` `` → `0 1 2 3 4 5 6 7 8 9 10 11 12 13...`
- `` `..0` `` → `0 -1 -2 -3 -4 -5 -6 -7 -8 -9 -10 -11 -12 -13...`

These types of ranges will not stop until some goal condition is met. For example, a function with an infinite numerical range may end if the program will print on the first input value for the function that is divisible by 152, for instance. However, these types of functions will prematurely end if they reach or pass the bounds of the globally-defined range, if it is defined.

##### Character Ranges

- `` `'a'..'e'` `` → `a b c d e`
- `` `'y'..'t'` `` → `y x w v u t`
- `` `'a'..'h' t2t` `` → `a c e g`
- `` `'Y'..'c'` `` → `` Y Z [ \ ] ^ _ ` a b c ``

#### Range Scoping

##### Global Scope

The top of the page is reserved for global ranges. This will standardize the range when a function is called (unless overridden).

Syntax-wise, it is similar to the examples above.

- `` `0..10` `` is the same as `` `0..10 t1t` `` (syntax sugar)
- `` `0..10 t0.2t` `` → `0 0.2 0.4 0.6 0.8 ... 9.6 9.8 10`

##### Local Scope

- `` [x]:`.2..1.0` `` (Assume global scope interval is 0.2)
- `` [y]:`0..5 t1t` ``

If a local scope exceeds the bounds of a given global scope, the program will let the function continue to generate until the program's global scope is reached or passed.

---

### Functions

#### Declaring Functions

- `f(x) = 2x`
- `g(x) = x`

#### Calling Functions

- `f(x).step(3)` - Calls the function 3 times.
- `print(f(x):2)` - Prints the output of the function until 2.

In Funktion, any time a function is called with `.step()`, the function will generate the next output over the given time step, moving forward from the first step to also generate the next step when initially called. By default, `.step()` will step one defined time step. If the time step is defined as 2, it will step through the input value by 2. If a function with a time step of 2 calls itself with `.step(2)`, it will step twice, generating twice, stepping through the input value by 4. The local defined time step takes precedence over the global time step for all functions in the given program, which is 1 by default if not defined at the start of the program. The step value need not align with the global or even local time step, but the function will end generation once the end value is either reached or passed.

A function's generated outputs are influenced by any additional operations or mutations applied to it when stepped through. This mutation is shared between the functions involved for a given number of steps.

For example, consider the expression:

```funktion
{G(x) + f(x)}.step(2)
```

This will step through both `G` and `f` by `x`'s step value, while also making their output for that iteration the sum of their results for two generations.

---

### Chain of Questioning

In Funktion, the **chain of questioning** allows you to perform a series of conditional checks using consecutive `?` symbols. Each `?` represents a case to be checked, and the `:` symbol represents the "else" condition.

#### Syntax:

```funktion
? condition1 => action1
? condition2 => action2
? condition3 => action3
: defaultAction
```

---

### Consecutive Action Operator

### Consecutive Action Operator (`,`)

The **consecutive action operator (`,`)** allows you to chain multiple actions together on a single line. Actions are evaluated from left to right.

#### Syntax:

```funktion
action1, action2, action3
```

---

### Keywords

- `print` - A print statement that prints the item into the console.
  - `print("Bonjour!!!")`

---

## Code Snippets

### Hello World - (`hello.funk`)

Program below prints `"Hello, World!"`.

```funktion
// This example prints the simple program "Hello, World!"
print("Hello, World!")
```

**Output:**

```
Hello, World!
```

---

### Factorial - (`factorial.funk`)

Program below prints the factorial of 5, which will output `120` after iterating through each product. This is created using a method that outputs the answer using a recursive algorithm.

```funktion
`5..1` t1t

factorial(x) = x * factorial(x).step()

print(factorial(x):1)
```

**Output:**

```
5
20
60
120
120
```

---

### Example: Combining Functions and Casting User Input

```funktion
`1..5` t1t

f(x) = x
f(x).step(2)
G(x) = number(input("Give me a value and I will multiply that sequence with that value."))

(f(x) * G(x)).step(2)
print(f(x):5)
```

**Expected Output:**

```
1
2
3
20
25
```

In this example, `f(x)` generates a sequence of numbers from 1 to 5. When combined with `G(x)`, which multiplies the sequence by a user-provided value, the `.step(2)` operation ensures that both functions are evaluated together, sharing their mutations for the specified number of steps. The final output reflects the combined effect of both functions over the sequence.

### Example: Chain of Questioning, Consecutive Actions

```funktion
`15..1` t1t

fizzbuzz(x) =
    ? x % 15 == 0 => print("fizzbuzz"), fizzbuzz(x).step()
    ? x % 3 == 0 => print("fizz"), fizzbuzz(x).step()
    ? x % 5 == 0 => print("buzz"), fizzbuzz(x).step()
    : print(x), fizzbuzz(x).step()
```

**Expected Output:**

```
fizzbuzz
14
13
fizz
11
buzz
fizz
8
7
fizz
buzz
4
fizz
2
1
```
## Static Checks
This language also implements static checks to ensure that there are no grammatical errors with the code before it is compiled and ran.

### Identifier ${name} already declared
A function that is already declared cannot be declared again in the same code

function mustNotAlreadyBeDeclared(name, at) {
  must(!context.lookup(name), `Identifier ${name} already declared`, at);
}

### Identifier ${name} not declared
A function that is not declared cannot be called in the code

function mustHaveBeenFound(entity, name, at) {
  must(entity, `Identifier ${name} not declared`, at);
}

### Operator does not support ${e1.type} types. Expected ${type}
An operator must be a type that is supported by the language

function mustBeTypeUnary(e1, type, at) {
  must(
    e1.type === type || e1.type === core.anyType,
    `Operator does not support ${e1.type} types. Expected ${type}`,
    at
  );
}

### Operands do not have the same type. Given ${e1.type} and ${e2.type} types
When 2 operators are used in the same operation, they must be the same type and a type supported by the language

function mustBeTypeBinary(e1, e2, type, at) {
  must(
    e1.type === e2.type ||
      e1.type === core.anyType ||
      e2.type === core.anyType,
    `Operands do not have the same type. Given ${e1.type} and ${e2.type} types`,
    at
  );
  must(
    (e1.type === type || e1.type === core.anyType) &&
      (e2.type === type || e2.type === core.anyType),
    `Operator does not support ${e1.type} types. Expected ${type}`,
    at
  );
}

### Input statements must be inside functions
When an input statement is used, it must be written as a function in the code

InputStmt(_input, _open, prompt, _close) {
  if (!context.parent) {
    throw new Error("Input statements must be inside functions");
  }
  return core.inputStmt(prompt?.rep());
}