import { describe, it } from "node:test";
import assert from "node:assert/strict";
import optimize from "../src/optimizer.js";
import * as core from "../src/core.js";

const num = (value) => core.num(value);
const add = (left, op, right) => core.addExpr(left, op, right);
const mul = (left, op, right) => core.mulExpr(left, op, right);
const condExpr = (left, op, right, then, elseB) => core.condExpr(left, op, right, then, elseB);
const id = (name) => core.id(name);

const tests = [
  [
    "folds addition",
    add(num(5), "+", num(8)),
    num(13),
  ],
  [
    "optimizes x + 0 to x",
    add(id("x"), "+", num(0)),
    id("x"),
  ],
  [
    "optimizes 0 + x to x",
    add(num(0), "+", id("x")),
    id("x"),
  ],
  [
    "folds multiplication",
    mul(num(5), "*", num(3)),
    num(15),
  ],
  [
    "optimizes x * 1 to x",
    mul(id("x"), "*", num(1)),
    id("x"),
  ],
  [
    "optimizes 1 * x to x",
    mul(num(1), "*", id("x")),
    id("x"),
  ],
  [
    "optimizes x * 0 to 0",
    mul(id("x"), "*", num(0)),
    num(0),
  ],
  [
    "optimizes 0 * x to 0",
    mul(num(0), "*", id("x")),
    num(0),
  ],
  [
    "folds exponentiation",
    core.factor(num(2), "**", num(3)),
    num(8),
  ],
  [
    "optimizes x ** 0 to 1",
    core.factor(id("x"), "**", num(0)),
    num(1),
  ],
  [
    "optimizes x ** 1 to x",
    core.factor(id("x"), "**", num(1)),
    id("x"),
  ],
  [
    "folds negation",
    core.factor(null, "-", num(5)),
    num(-5),
  ],
  [
    "folds bitwise not",
    core.factor(null, "~", num(0)),
    num(-1),
  ],
  [
    "optimizes conditional with true condition",
    condExpr(num(1), "==", num(1), num(10), num(20)),
    num(10),
  ],
  [
    "optimizes conditional with false condition",
    condExpr(num(1), "!=", num(1), num(10), num(20)),
    num(20),
  ],
];

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(scenario, () => {
      const result = optimize(before);
      assert.deepEqual(result, after);
    });
  }
});
