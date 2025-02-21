import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["simplest syntactically correct program", 'print("")'],
  ["assign constant to a function", "f(x)=2"],
  ["assign constant to a function, with spaces", "f(x) =   2"],
  [
    "declare a function with valid identifier characters",
    "ffhquEOF_FHJIDP__igo(huerhgW)=2",
  ],
  ["function name containing a keyword", "printe(x)=2"],
  ["function with 2x", "f(x)=2x"],
  ["function call through step", "f(x).step(3)"],
  ["function call through colon", "print(f:2)"],
  ["function call with multiple steps", "(G(x) + f(x)).step(2)"],
  ["print statement", 'print("Hello, World!")'],
  ["print statement with special characters", 'print("\\n\\t\\r\\b\\\\\\"")'],
  ["mixing arithmetic operators", "print(7 * 2 / 1 ** -5 + 2 % 2)"],
  ["mixing bitwise operators", "print(7 >> 2 | ~1 | 5 & 2 << 2)"],
  ["parentheses", "print((2 + 1) * 3)"],
  ["concatenation operator", 'print("Hello," + " World!")'],
  ["simple global range", "`0..10`\nprint(x)"],
  ["simple global range with time step", "`0..10` t1t\nprint(x)"],
  ["simple global range with time step", "`0..10` t1t\nprint(x)"],
  ["simple global range but reverse", "`10..0`\nprint(x)"],
  ["simple global range with negative time step", "`0..10` t-1t\nprint(x)"],
  ["simple global range with decimal time step", "`0..10` t0.2t\nprint(x)"],
  ["simple global infinite range to right", "`0..`\nprint(x)"],
  ["simple global infinite range to left", "`..0`\nprint(x)"],
  ["character range", "`'a'..'e'`\nprint(x)"],
  ["character range but reverse", "`'y'..'t'`\nprint(x)"],
  ["character range with time step", "`'a'..'h'` t2t\nprint(x)"],
  ["character range through ascii", "`'Y'..'c'`\nprint(x)"],
  ["chain of questioning", "f(x) = ? 0 == 0 => 2 : 1"],
];

// Programs with syntax errors that the parser will detect
const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c()=2;", /Line 1, col 3:/],
  ["using a keyword as a function identifier", "print(x)=2", /Line 1, col 9:/],
  ["using a keyword as a variable identifier", "f(print)=3", /Line 1, col 3:/],
  ["cart before the horse", "f(x) = x2", /Line 1, col 10:/],
  ["missing function body", "f(x)=", /Line 1, col 6:/],
  [
    "Setting a function to a print statement",
    "f(x)=print(x)",
    /Line 1, col 6:/,
  ],
  ["missing closing parenthesis", 'print("Hello, World!"', /Line 1, col 22:/],
  ["missing closing parenthesis", "print(2 + 1 * 3", /Line 1, col 16:/],
  ["missing closing parenthesis", "print(2 + (1 * 3)", /Line 1, col 18:/],
  ["missing closing parenthesis", "print(2 + (1 * (3)", /Line 1, col 19:/],
  ["timeCall within function definition", "f(x)=g(h:5)", /Line 1, col 9:/],
  [
    "Using input as a function with arithmetic operation",
    "f(x)=input() + 2",
    /Line 1, col 12:/,
  ],
];

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`matches ${scenario}`, () => {
      assert(parse(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => parse(source), errorMessagePattern);
    });
  }
});
