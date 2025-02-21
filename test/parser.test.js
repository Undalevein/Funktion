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
    "ffhquEOFFHJIDPigo(huerhgW)=2",
  ],
  ["function name containing a keyword", "printe(x)=2"],
  ["function with 2x", "f(x)=2x"],
  ["function with 2x_2", "f(x)=2x_2"],
  ["print statement", 'print("Hello, World!")'],
  ["print statement with special characters", 'print("\\n\\t\\r\\b\\\\\\"")'],
  ["Mixing Arithmetic Operators", "print(7 * 2 / 1 ** -5 + 2 % 2)"],
  ["Mixing Bitwise Operators", "print(7 >> 2 | ~1 | 5 & 2 << 2)"],
  ["Parentheses", "print((2 + 1) * 3)"],
  ["Concatenation Operator", 'print("Hello," + " World!")'],
];

// Programs with syntax errors that the parser will detect
const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c()=2;", /Line 1, col 3:/],
  ["using a keyword as a function identifier", "print(x)=2", /Line 1, col 9:/],
  ["using a keyword as a variable identifier", "f(print)=3", /Line 1, col 3:/],
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
