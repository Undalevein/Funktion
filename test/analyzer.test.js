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
  ["float addition", "f(x)=1.1+2.2"],
  ["float subtraction", "f(x)=1.1-2.2"],
  ["float multiplication", "f(x)=1.1*2.2"],
  ["float division", "f(x)=1.1/2.2"],
  ["float exponentiation", "f(x)=1.1**2.2"],
  ["float modulus", "f(x)=1.1%2.2"],
  ["float negation", "f(x)=-1.1"],
  [
    "conditional expression with integer types",
    "f(x) = ? 0 == 0 => 2 : ? 1 == 1 => 3 : 4",
  ],
];

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  [
    "input function outside function declaration",
    "input()",
    /Input statements must be inside functions/,
  ],
  [
    "adding a string by an integer",
    'f(x)="hi"+1',
    /Operands do not have the same type/,
  ],
  [
    "subtracting a string by an integer",
    'f(x)="hi"-1',
    /Operands do not have the same type/,
  ],
  [
    "multiplying a string by an integer",
    'f(x)="hi"*1',
    /Operands do not have the same type/,
  ],
  [
    "dividing a string by an integer",
    'f(x)="hi"/1',
    /Operands do not have the same type/,
  ],
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
