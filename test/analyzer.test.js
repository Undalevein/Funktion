import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";

// Programs that are semantically correct
const semanticChecks = [
  ["function declarations", "f(x)=0"],
  ["function declaration with unknown type returned", "f(x)=x"],
  ["integer addition", "f(x)=1+1"],
  ["integer subtraction", "f(x)=1-1"],
  ["integer multiplication", "f(x)=1*1"],
  ["integer division", "f(x)=1/1"],
  ["integer exponentiation", "f(x)=1**1"],
  ["integer modulus", "f(x)=1%1"],
  ["integer negation", "f(x)=-1"],
  ["integer bitwise negation", "f(x)=~1"],
  ["integer bitwise and", "f(x)=1&1"],
  ["integer bitwise or", "f(x)=1|1"],
  ["integer bitwise xor", "f(x)=1^1"],
  ["integer bitwise left shift", "f(x)=1<<1"],
  ["integer bitwise right shift", "f(x)=1>>1"],
  ["float addition", "f(x)=1.1+2.2"],
  ["float subtraction", "f(x)=1.1-2.2"],
  ["float multiplication", "f(x)=1.1*2.2"],
  ["float division", "f(x)=1.1/2.2"],
  ["float exponentiation", "f(x)=1.1**2.2"],
  ["float modulus", "f(x)=1.1%2.2"],
  ["float negation", "f(x)=-1.1"],
  ["float negation", "f(x)=-1.1"],
  ["float bitwise and", "f(x)=1.1&2.2"],
  ["float bitwise or", "f(x)=1.1|2.2"],
  ["float bitwise xor", "f(x)=1.1^2.2"],
  ["float bitwise left shift", "f(x)=1.1<<2.2"],
  ["float bitwise right shift", "f(x)=1.1>>2.2"],
  ["addition with a anytype variable", "f(x)=x + 1"],
  ["special multiplication synax", "f(x)=3x"],
  ["concatenating strings", 'f(x)="Hello, " + "World!"'],
  [
    "conditional expression with integer types",
    "f(x) = ? 0 == 0 => 2 : ? 1 == 1 => 3 : 4",
  ],
  ["complicated conditionals", "f(x) = ? x > 1 => 1 : ? x <= 2 => 4 : 2"],
  ["chained operators", "f(x)=1+2-3*4/5**6%7"],
  ["function calls", "f(x)=1\nprint(f(x))"],
  ["step call", "f(x)=x\nprint(f(x).step())"],
  ["step call with specified number", "f(x)=x\nprint(f(x).step(4))"],
  ["time call", "f(x)=x\nprint(f(x):5)"],
  ["global range in increasing range", "`1..3`\n"],
  ["global range in decreasing range", "`1..-4`\n"],
  ["global range with positive integer time step", "`1..10` t2t\n"],
  ["global range with negative integer time step", "`1..10` t-2t\n"],
  ["global range with float time step", "`1..10` t2.5t\n"],
  ["global range with character step", "`'a'..'z'`\n"],
  ["function group", "f(x)=x\ng(x)=x\n{f(x)+g(x)}.step()"],
  ["input statement with prompt", 'f(x)=input("Hello")'],
  ["using the function parameter", "f(x)=x*3+x"],
  ["identifiers", "f(x)=x"],
  ["character literals", "f(x)='2'"],
  ["parentheses around a primary", "f(x)=(3)"],
  ["complicated equation", "f(x) = 1 + (2 + -3) << -4 >> (19 * 39) % x ^ 2 << 38 & 18"],
];

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  [
    "input function outside function declaration",
    "input()",
    /Input statements must be inside functions/,
  ],
  [
    "input function outside function declaration in print statement",
    "print(input())",
    /Input statements must be inside functions/,
  ],
  [
    "adding a string by an integer",
    'f(x)="hi"+1',
    /Operands do not have the same type. Given string and number types/,
  ],
  [
    "subtracting a string by an integer",
    'f(x)="hi"-1',
    /Operands do not have the same type. Given string and number types/,
  ],
  [
    "multiplying a string by an integer",
    'f(x)="hi"*1',
    /Operands do not have the same type. Given string and number types/,
  ],
  [
    "dividing a string by an integer",
    'f(x)="hi"/1',
    /Operands do not have the same type. Given string and number types/,
  ],
  [
    "subtracting strings",
    'f(x)="hi" - "hey"',
    /Operator does not support string types. Expected number/,
  ],
  [
    "mutliplying strings",
    'f(x)="hi" * "hey"',
    /Operator does not support string types. Expected number/,
  ],
  [
    "dividing strings",
    'f(x)="hi" / "hey"',
    /Operator does not support string types. Expected number/,
  ],
  [
    "exponentiating strings",
    'f(x)="hi" ** "hey"',
    /Operator does not support string types. Expected number/,
  ],
  [
    "negating strings",
    'f(x)=-"hey"',
    /Operator does not support string types. Expected number/,
  ],
  [
    "functions have similar identifier",
    "f(x)=1\nf(x)=2",
    /Identifier f already declared/,
  ],
  ["function not declared", "print(f(x))", /Identifier f not declared/],
];

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }
});
