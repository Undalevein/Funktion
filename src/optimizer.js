import * as core from "./core.js";

export default function optimize(node) {
  return optimizers?.[node?.kind]?.(node) ?? node;
}

const optimizers = {
  Program(p) {
    if (p.globalRange) p.globalRange = optimize(p.globalRange);
    p.statements = p.statements.flatMap(s => optimize(s));
    return p;
  },

  FuncDef(d) {
    d.body = optimize(d.body);
    d.additionalDefs = d.additionalDefs.map(optimize);
    return d;
  },

  FuncCall(c) {
    c.arg = optimize(c.arg);
    return c;
  },

  Expr(e) {
    e.condExpr = optimize(e.condExpr);
    e.rest = e.rest.map(optimize);
    return e;
  },

  CondExpr(e) {
    e.leftCond = optimize(e.leftCond);
    e.rightCond = optimize(e.rightCond);
    e.thenBranch = optimize(e.thenBranch);
    e.elseBranch = optimize(e.elseBranch);
    if (e.op && e.leftCond?.kind === 'num' && e.rightCond?.kind === 'num') {
      const left = e.leftCond.value;
      const right = e.rightCond.value;
      let result;
      switch (e.op) {
        case '==': result = left === right; break;
        case '!=': result = left !== right; break;
        case '<': result = left < right; break;
        case '<=': result = left <= right; break;
        case '>': result = left > right; break;
        case '>=': result = left >= right; break;
        default: return e;
      }
      return result ? e.thenBranch : e.elseBranch;
    }
    return e;
  },

  AddExpr(e) {
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.left.kind === 'num' && e.right.kind === 'num') {
      const result = e.op === '+' 
      ? e.left.value + e.right.value 
      : e.left.value - e.right.value;
    return core.num(result);
    }
    if (e.op === '+') {
      if (e.left.kind === 'num' && e.left.value === 0) return e.right;
      if (e.right.kind === 'num' && e.right.value === 0) return e.left;
    } else if (e.op === '-') {
      if (e.right.kind === 'num' && e.right.value === 0) return e.left;
    }
    return e;
  },

  MulExpr(e) {
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.left.kind === 'num' && e.right.kind === 'num') {
      return core.num(e.left.value * e.right.value);
    }
    if (e.op === '*') {
      if (e.left.kind === 'num' && e.left.value === 1) return e.right;
      if (e.right.kind === 'num' && e.right.value === 1) return e.left;
      if (e.left.kind === 'num' && e.left.value === 0) return core.num(0);
      if (e.right.kind === 'num' && e.right.value === 0) return core.num(0);
    } else if (e.op === '/' && e.right.kind === 'num' && e.right.value === 1) {
      return e.left;
    }
    return e;
  },

  Factor(e) {
    if (e.base) e.base = optimize(e.base);
    if (e.exponent) e.exponent = optimize(e.exponent);
    if (e.op === '**') {
      if (e.base?.kind === 'num' && e.exponent?.kind === 'num') {
        return core.num(e.base.value ** e.exponent.value);
      }
      if (e.exponent?.kind === 'num' && e.exponent.value === 0) return core.num(1);
      if (e.exponent?.kind === 'num' && e.exponent.value === 1) return e.base;
    } else if (e.op === '-') {
      if (e.exponent?.kind === 'num') return core.num(-e.exponent.value);
    } else if (e.op === '~') {
      if (e.exponent?.kind === 'num') return core.num(~e.exponent.value);
    }
    return e;
  },

  PrintStmt(s) {
    s.expr = optimize(s.expr);
    return s;
  },

  StepCall(s) {
    s.expr = optimize(s.expr);
    s.stepValue = optimize(s.stepValue);
    return s;
  },

  TimeCall(t) {
    t.funcCall = optimize(t.funcCall);
    t.timeValue = optimize(t.timeValue);
    return t;
  },

  GlobalRange(g) {
    g.range = optimize(g.range);
    g.timestep = optimize(g.timestep);
    return g;
  },

  numrange(nr) {
    nr.start = optimize(nr.start);
    nr.end = optimize(nr.end);
    return nr;
  },

  num(n) {
    return n;
  },

  id(i) {
    return i;
  }
};