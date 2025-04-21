export const numberType = "number";
export const stringType = "string";
export const charType = "char";
export const functionType = "function";
export const anyType = "any";
export const voidType = "void";

export function program(globalRange, statements) {
  return { type: voidType, kind: "Program", globalRange, statements };
}

export function funcDef(name, param, body, additionalDefs = []) {
  return { type: anyType, kind: "FuncDef", name, param, body, additionalDefs };
}

export function funcCall(name, arg) {
  return { type: anyType, kind: "FuncCall", name, arg };
}

export function functionGroup(expr) {
  return { type: expr?.type ?? anyType, kind: "FunctionGroup", expr };
}

export function expr(condExpr, rest = []) {
  return { type: condExpr?.type ?? anyType, kind: "Expr", condExpr, rest };
}

export function condExpr(condition, thenBranch, elseBranch) {
  return {
    type: thenBranch?.type ?? anyType,
    kind: "CondExpr",
    condition,
    thenBranch,
    elseBranch,
  };
}

export function bitwiseExpr(left, op, right) {
  return { type: left?.type ?? anyType, kind: "BitwiseExpr", left, op, right };
}

export function shiftExpr(left, op, right) {
  return { type: left?.type ?? anyType, kind: "ShiftExpr", left, op, right };
}

export function addExpr(left, op, right) {
  return { type: left?.type ?? anyType, kind: "AddExpr", left, op, right };
}

export function mulExpr(left, op, right) {
  return { type: left?.type ?? anyType, kind: "MulExpr", left, op, right };
}

export function factor(base, op, exponent) {
  return { type: base?.type ?? anyType, kind: "Factor", base, op, exponent };
}

export function primary(value) {
  return { type: value?.type ?? anyType, kind: "Primary", value };
}

export function printStmt(expr) {
  return { type: voidType, kind: "PrintStmt", expr };
}

export function stepCall(expr, stepValue) {
  return { type: anyType, kind: "StepCall", expr, stepValue };
}

export function inputStmt(prompt) {
  return { type: anyType, kind: "InputStmt", prompt };
}

export function timeCall(funcCall, timeValue) {
  return { type: voidType, kind: "TimeCall", funcCall, timeValue };
}

export function globalRange(range, timestep = null) {
  return { type: voidType, kind: "GlobalRange", range, timestep };
}

export function localRange(id, range, timestep = null) {
  return { type: voidType, kind: "LocalRange", id, range, timestep };
}

export function numRange(start, end) {
  return { type: voidType, kind: "numRange", start, end };
}

export function charRange(start, end) {
  return { type: voidType, kind: "charRange", start, end };
}

export function timestep(value) {
  return { type: voidType, kind: "timestep", value };
}

export function num(value) {
  return { type: numberType, kind: "num", value };
}

export function stringLiteral(value) {
  return { type: stringType, kind: "StringLiteral", value };
}

export function charLiteral(value) {
  return { type: charType, kind: "CharLiteral", value };
}

export function id(name) {
  return { type: anyType, kind: "Id", name };
}

export const standardLibrary = Object.freeze({
  number: numberType,
  string: stringType,
  char: charType,
  function: functionType,
  any: anyType,
  void: voidType,
  print: { kind: "IntrinsicFunction", name: "print", type: functionType },
  input: { kind: "IntrinsicFunction", name: "input", type: functionType },
  step: { kind: "IntrinsicFunction", name: "step", type: functionType },
});

Number.prototype.type = numberType;
String.prototype.type = stringType;
