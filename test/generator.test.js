import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import generate from "../src/generator.js";

function dedent(s) {
	return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
  {
    name: "hello world",
    source: `print("Hello, World!")`,
    expected: dedent(`
    function generateRange(start, end, step) {
      const range = [];
      if (step === 0) step = 1;
      if (start <= end) {
        for (let i = start; i <= end; i += step) {
          range.push(i);
        }
      }
      else {
        for (let i = start; i >= end; i += step) {
          range.push(i);
        }
      }
      return range;
    }

    function funktionPrint(value) {
      if (Array.isArray(value)) {
        console.log(value.join('\\n'));
      }
      else {
        console.log(value);
      }
    }

    const globalRange = [];
    funktionPrint("Hello, World!"); 
  `),
  },
  {
    name: "factorial",
    source: 
    ` \`5..1\` t-1t
    factorial(x) = x * factorial(x).step()
    print(factorial(x))
    `,
    expected: dedent(`
    function generateRange(start, end, step) {
      const range = [];
      if (step === 0) step = 1;
      if (start <= end) {
        for (let i = start; i <= end; i += step) {
          range.push(i);
        }
      }
      else {
        for (let i = start; i >= end; i += step) {
          range.push(i);
        }
      }
      return range;
    }

    function funktionPrint(value) {
      if (Array.isArray(value)) {
        console.log(value.join('\\n'));
      }
      else {
        console.log(value);
      }
    }

    const globalRange = generateRange(5, 1, -1);
    const factorial_1 = [];
    let previous_factorial_1 = 1;
    for (const x of globalRange) {
      factorial_1.push(x * previous_factorial_1);
      previous_factorial_1 = factorial_1[factorial_1.length - 1];
    }
    funktionPrint(factorial_1);
    `),
	},
];

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = dedent(generate(analyze(parse(fixture.source))));
      assert.equal(actual.trim(), fixture.expected.trim());
    });
  }
});