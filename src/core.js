export function program(globalRange, statements) {
  return { kind: "Program", globalRange, statements };
}

export function funcDef(name, param, body, additionalDefs = []) {
  return { kind: "FuncDef", name, param, body, additionalDefs };
}

export function funcCall(name, arg) {
  return { kind: "FuncCall", name, arg };
}

export function expr(condExpr, rest = []) {
  return { kind: "Expr", condExpr, rest };
}

export function condExpr(condition, thenBranch, elseBranch) {
  return { kind: "CondExpr", condition, thenBranch, elseBranch };
}

export function bitwiseExpr(left, op, right) {
  return { kind: "BitwiseExpr", left, op, right };
}

export function shiftExpr(left, op, right) {
  return { kind: "ShiftExpr", left, op, right };
}

export function addExpr(left, op, right) {
  return { kind: "AddExpr", left, op, right };
}

export function mulExpr(left, op, right) {
  return { kind: "MulExpr", left, op, right };
}

export function factor(base, op, exponent) {
  return { kind: "Factor", base, op, exponent };
}

export function primary(value) {
  return { kind: "Primary", value };
}

export function printStmt(expr) {
  return { kind: "PrintStmt", expr };
}

export function stepCall(expr, stepValue) {
  return { kind: "StepCall", expr, stepValue };
}

export function inputStmt(prompt) {
  return { kind: "InputStmt", prompt };
}

export function timeCall(name, arg, timeValue) {
  return { kind: "TimeCall", name, arg, timeValue };
}

export function globalRange(range, timestep = null) {
  return { kind: "GlobalRange", range, timestep };
}

export function localRange(id, range, timestep = null) {
  return { kind: "LocalRange", id, range, timestep };
}

export function numRange(start, end) {
  return { kind: "NumRange", start, end };
}

export function charRange(start, end) {
  return { kind: "CharRange", start, end };
}

export function timestep(value) {
  return { kind: "Timestep", value };
}

export function num(value) {
  return { kind: "Num", value };
}

export function stringLiteral(value) {
  return { kind: "StringLiteral", value };
}

export function charLiteral(value) {
  return { kind: "CharLiteral", value };
}

export function id(name) {
  return { kind: "Id", name };
}

export const numberType = "number";
export const stringType = "string";
export const booleanType = "boolean";
export const functionType = "function";
export const voidType = "void";

export const standardLibrary = Object.freeze({
  number: numberType,
  string: stringType,
  boolean: booleanType,
  void: voidType,
  print: { kind: "IntrinsicFunction", name: "print", type: functionType },
  input: { kind: "IntrinsicFunction", name: "input", type: functionType },
  step: { kind: "IntrinsicFunction", name: "step", type: functionType },
});

Number.prototype.type = numberType;
String.prototype.type = stringType;
Boolean.prototype.type = booleanType;