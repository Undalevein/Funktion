import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["simplest syntactically correct program", 'print("")'],
  ["assign constant to a function", "f(x)=2"],
];

// Programs with syntax errors that the parser will detect
const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c()=2;", /Line 1, col 3:/],
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
