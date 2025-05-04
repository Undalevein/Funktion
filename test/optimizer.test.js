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
  [
    "optimizes x - 0 to x",
    add(id("x"), "-", num(0)),
    id("x"),
  ],
  [
    "folds subtraction",
    add(num(8), "-", num(3)),
    num(5),
  ],
  [
    "optimizes x / 1 to x",
    mul(id("x"), "/", num(1)),
    id("x"),
  ],
  [
    "optimizes conditional with <",
    condExpr(num(3), "<", num(5), num(10), num(20)),
    num(10),
  ],
  [
    "optimizes conditional with >=",
    condExpr(num(5), ">=", num(5), num(10), num(20)),
    num(10),
  ],
  [
    "optimizes conditional with > operator (false)",
    condExpr(num(3), ">", num(5), num(10), num(20)),
    num(20),
  ],
  [
    "optimizes conditional with <= operator (true)",
    condExpr(num(5), "<=", num(5), num(10), num(20)),
    num(10),
  ],
  [
    "optimizes x - 0 to x with subtraction",
    add(id("x"), "-", num(0)),
    id("x"),
  ],
  [
    "optimizes division by 1",
    mul(id("x"), "/", num(1)),
    id("x"),
  ],
  [
    "does not optimize negation of identifier",
    core.factor(null, "-", id("x")),
    core.factor(null, "-", id("x")),
  ],
  [
    "does not optimize bitwise not of identifier",
    core.factor(null, "~", id("x")),
    core.factor(null, "~", id("x")),
  ],
  [
    "optimizes print statement expression",
    core.printStmt(add(num(2), "+", num(3))),
    core.printStmt(num(5)),
  ],
  [
    "optimizes step call arguments",
    core.stepCall(add(num(1), "+", num(2)), num(3)),
    core.stepCall(num(3), num(3)),
  ],
  [
    "optimizes time call components",
    core.timeCall(
      core.funcCall("f", add(num(2), "+", num(3))),
      add(num(1), "+", num(1))
    ),
    core.timeCall(core.funcCall("f", num(5)), num(2)),
  ],
  [
    "returns identical ids",
    id("x"),
    id("x"),
  ],
  [
    "optimizes program with global range and statements",
    core.program (
      core.globalRange(core.numRange(num(1))),
      [
        core.printStmt(num(5)),
        core.funcDef("f", "x", add(num(1), "+", num(2)), [])
      ]
    ),
    core.program(
      core.globalRange(core.numRange(num(1))),
      [
        core.printStmt(num(5)),
        core.funcDef("f", "x", num(3), [])
      ]
    ),
  ],
  [
    "optimizes function with additional definitions",
    core.funcDef("f", "x", 
      core.expr(num(5)),
      [
        core.funcDef("g", "y", add(num(2), "+", num(3)), [])
      ]
    ),
    core.funcDef("f", "x", 
      core.expr(num(5)),
      [
        core.funcDef("g", "y", num(5), [])
      ]
    ),
  ],
  [
    "optimizes expression with multiple parts",
    core.expr(
      condExpr(num(1), "==", num(1), num(10), num(20)),
      [add(num(1), "+", num(1)), num(3)]
    ),
    core.expr(num(10), [num(2), num(3)])
  ],
  [
    "handles unoptimizable global range",
    core.globalRange(
      core.numRange(id("start")), 
      core.timestep(id("step"))
    ),
    core.globalRange(
      core.numRange(id("start")), 
      core.timestep(id("step"))
    ),
  ],
  [
    "returns unoptimized print statement",
    core.printStmt(id("x")),
    core.printStmt(id("x"))
  ],
  [
    "returns unoptimized conditional with non-numeric operands",
    condExpr(id("a"), "==", id("b"), num(10), num(20)),
    condExpr(id("a"), "==", id("b"), num(10), num(20)),
  ],
  [
    "returns unoptimized addition with non-numeric operands",
    add(id("x"), "+", id("y")),
    add(id("x"), "+", id("y")),
  ],
  [
    "returns unoptimized multiplication with non-numeric operands",
    mul(id("x"), "*", id("y")),
    mul(id("x"), "*", id("y")),
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