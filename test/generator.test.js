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
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
            
      funktionPrint("Hello, World!");
      rl.close();
    `),
  },
  {
    name: "factorial",
    source: 
    `\`5..1\` t1t
      factorial(x) = ? x > 1 => x * factorial(x - 1) : 1 
      factorial(x).step(5)  // Step through 5 times
      print(x:1)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 5, end = 1, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
            
      function factorial_1(x_2) { return [( x_2 > 1 ? (x_2 * factorial_1((x_2 - 1))) : 1)]; }
      let x_2 = initializeMutableRange();
      applyFunction(x_2, 5, factorial_1);
      funktionPrint(getSlice(x_2, 1));
      rl.close();
    `),
	},
  {
    name: "simple arithmetic",
    source: `print(1 + 2 * 3)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });


      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }

      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }

      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }

      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }

      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }

      funktionPrint((1 + (2 * 3)));
      rl.close();
    `)
  },
  {
    name: "bitwise operation",
    source: `print(5 & 3)`,
    expected: dedent(`
      
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
            
      funktionPrint((5 & 3));
      rl.close();
    `)
  },
  {
    name: "shift operation",
    source: `print(4 << 1)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
            
      funktionPrint((4 << 1));
      rl.close();
    `)
  },
  {
    name: "modulus operation",
    source: `print(5 % 2)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      funktionPrint((5 % 2));
      rl.close();
    `)
  },
  {
    name: "exponentiation",
    source: `print(2 ** 3)`,
    expected: dedent(`
      
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      funktionPrint(Math.pow(2, 3));
      rl.close();
    `)
  },
  {
    name: "conditional operation",
    source: 
    `print(? 1 > 0 => 1 : -1)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      funktionPrint(( 1 > 0 ? 1 : (-1)));
      rl.close();
    `),
  },
  {
    name: "unary negation",
    source: `print(-1)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      funktionPrint((-1));
      rl.close();
    `)
  },
  {
    name: "bitwise negation",
    source: `print(~1)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      funktionPrint((~1));
      rl.close();
    `)
  },
  {
    name: "function with step",
    source: 
    `f(x) = x + 1
    print(f(x).step(1))`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      function f_1(x_2) { return [(x_2 + 1)]; }
      let x_2 = initializeMutableRange();
      applyFunction(x_2, 1, f_1);
      funktionPrint(x_2.values[x_2.index]);
      rl.close();
    `)
  },
  {
    name: "time call",
    source: 
    `f(x) = 5
    print(f : 10)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      function f_1(x_2) { return [5]; }
      let x_2 = initializeMutableRange();
      funktionPrint(getSlice(f_1, 10));
      rl.close();
    `),
  },
  {
    name: "slice with multiple elements",
    source: `
      f(x) = x \\ x * 2 \\ x ** 3
      print(f(x))
    `,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
    
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }

      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }

      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }

      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }

      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
            
      function f_1(x_2) { return [x_2, (x_2 * 2), Math.pow(x_2, 3)]; }
      let x_2 = initializeMutableRange();
      funktionPrint(f_1(x_2));
      rl.close();
    `)
  },
  {
    name: "reverse range step",
    source: 
    `\`5..1\` t1t
    print(1)`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 5, end = 1, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
            
      funktionPrint(1);
      rl.close();
    `)
  },
  {
    name: "equality operators",
    source: `print(? 1 == 1 => "yes" : "no")`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      funktionPrint(( 1 === 1 ? "yes" : "no"));
      rl.close();
    `)
  },
  {
    name: "inequality operator",
    source: `print(? 1 != 2 => "yes" : "no")`, 
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      funktionPrint(( 1 !== 2 ? "yes" : "no"));
      rl.close();
    `)
  },
  {
    name: "input with prompt",
    source: `f(x) = input("Enter your name: ")`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
      
      console.log("Enter your name: ");
      const inputVar__0 = await rl.question("Input: ");
      
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }
      
      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }
      
      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }
      
      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }
      
      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
      
      function f_1(x_2) { return [inputVar__0]; }
      let x_2 = initializeMutableRange();
      rl.close();
    `)
  },
  {
    name: "print a character literal",
    source: `print('x')`,
    expected: dedent(`
      import { createInterface } from "node:readline/promises";
      import { stdin as input, stdout as output } from "node:process";
      const rl = createInterface({ input, output });
    
      function generateRange(start = 1, end = 5, step = 1) {
        if (end < start) step *= -1;
        return {
          start,
          end,
          step
        };
      }

      function initializeMutableRange(timestepRange = generateRange()) {
        return {
          timestepRange,
          values: [],
          index: -1,
          size: 0
        };
      }

      function getSlice(value, limit) {
        const list = []
        let index = 0;
        if (value.timestepRange.step > 0) {
          for (let i = value.timestepRange.start ; i <= limit && i <= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        } else {
          for (let i = value.timestepRange.start ; i >= limit && i >= value.timestepRange.end ; i += value.timestepRange.step ) {
            list.push(value.values[index++]);
          }
        }
        return list;
      }

      function funktionPrint(value) {
        if (Array.isArray(value)) {
          console.log(value.join('\\n'));
        }
        else if (typeof value === "object") {
          console.log(value.values.join('\\n'));
        }
        else {
          console.log(value);
        }
      }

      function applyFunction(gen, iterations, f) {
        let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
        if (gen.size === 0) {
          gen.size++;
          gen.index++;
          const result = f(currentVal);
          gen.values.push(Array.isArray(result) ? result.join(' ') : result);
          currentVal += gen.timestepRange.step;
        }
        if (gen.timestepRange.step > 0) {
          while (currentVal <= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        } else {
          while (currentVal >= gen.timestepRange.end && iterations > 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
            iterations--;
          }
        }
      }
            
      funktionPrint("x");
      rl.close();
    `)
  }
];

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = dedent(generate(analyze(parse(fixture.source))));
      assert.equal(actual.trim(), fixture.expected.trim());
    });
  }
});