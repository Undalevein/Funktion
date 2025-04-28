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
        for (let i = start; i >= end; i -= step) {
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
    `\`5..1\` t-1t
    factorial(x) = x * factorial(x).step()
    print(factorial(x))`,
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
        for (let i = start; i >= end; i -= step) {
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

    const globalRange = generateRange(5, 1, 1);
    const factorial_1 = [];
    let previous_factorial_1 = 1;
    for (const x of globalRange) {
      factorial_1.push((x * previous_factorial_1));
      previous_factorial_1 = factorial_1[factorial_1.length - 1];
    }
    funktionPrint(factorial_1(x));
    `),
	},
  {
    name: "simple arithmetic",
    source: `print(1 + 2 * 3)`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint((1 + (2 * 3)));
    `)
  },
  {
    name: "bitwise operation",
    source: `print(5 & 3)`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint((5 & 3));
    `)
  },
  {
    name: "shift operation",
    source: `print(4 << 1)`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint((4 << 1));
    `)
  },
  {
    name: "modulus operation",
    source: `print(5 % 2)`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint((5 % 2));
    `)
  },
  {
    name: "exponentiation",
    source: `print(2 ** 3)`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint(Math.pow(2, 3));
    `)
  },
  {
    name: "conditional operation",
    source: `print(x > 0 ? 1 : -1)`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint(? x > 0 => 1 : -1);
    `),
  },
  {
    name: "unary negation",
    source: `print(-1)`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint((-1));
    `)
  },
  {
    name: "bitwise negation",
    source: `print(~1)`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint((~1));
    `)
  },
  {
    name: "function with step",
    source: 
    `f(x) = x + 1
    print(f(x).step(1))`,
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
        for (let i = start; i >= end; i -= step) {
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
    const f_1 = [];
    let previous_f_1 = 1;
    for (const x of globalRange) {
      f_1.push((x + 1));
      previous_f_1 = f_1[f_1.length - 1];
    }
    funktionPrint(f_1(x)[0]);
    `)
  },
  {
    name: "time call",
    source: 
    `f(x) = 5
    print(f(x) : 10)`,
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
        for (let i = start; i >= end; i -= step) {
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
    const f_1 = [];
    let previous_f_1 = 1;
    for (const x of globalRange) {
      f_1.push(5);
      previous_f_1 = f_1[f_1.length - 1];
    }
    funktionPrint(f_1(x));
    `),
  },
  {
    name: "char literal",
    source: `print('a')`,
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
        for (let i = start; i >= end; i -= step) {
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
    funktionPrint("a");
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