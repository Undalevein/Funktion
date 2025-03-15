import * as core from "./core.js";

class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
    Object.assign(this, { parent, locals, inLoop, function: f });
  }

  add(name, entity) {
    this.locals.set(name, entity);
  }

  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name);
  }

  static root() {
    return new Context({ locals: new Map(Object.entries(core.standardLibrary)) });
  }

  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() });
  }
}

export default function analyze(match) {
  let context = Context.root();

  function must(condition, message, errorLocation) {
    if (!condition) {
      const prefix = errorLocation.at.source.getLineAndColumnMessage();
      throw new Error(`${prefix}${message}`);
    }
  }

  function mustNotAlreadyBeDeclared(name, at) {
    must(!context.lookup(name), `Identifier ${name} already declared`, at);
  }

  function mustHaveBeenFound(entity, name, at) {
    must(entity, `Identifier ${name} not declared`, at);
  }

  function mustHaveBooleanType(e, at) {
    must(e.type === core.booleanType, "Expected a boolean", at);
  }

  function mustBothHaveTheSameType(e1, e2, at) {
    must(e1.type === e2.type, "Operands do not have the same type", at);
  }

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(globalRange, statements) {
      return core.program(globalRange?.rep(), statements.children.map(s => s.rep()));
    },

    FuncDef(id, param, _eq, body) {
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      const func = core.funcDef(id.sourceString, param.rep(), body.rep());
      context.add(id.sourceString, func);
      return func;
    },

    FuncCall(id, arg) {
      const func = context.lookup(id.sourceString);
      mustHaveBeenFound(func, id.sourceString, { at: id });
      return core.funcCall(id.sourceString, arg.rep());
    },

    Expr(condExpr, rest) {
      return core.expr(condExpr.rep(), rest.children.map(r => r.rep()));
    },

    CondExpr(condition, thenBranch, elseBranch) {
      const cond = condition.rep();
      mustHaveBooleanType(cond, { at: condition });
      return core.condExpr(cond, thenBranch.rep(), elseBranch?.rep());
    },

    BitwiseExpr(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.bitwiseExpr(l, op.sourceString, r);
    },

    ShiftExpr(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.shiftExpr(l, op.sourceString, r);
    },

    AddExpr(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.addExpr(l, op.sourceString, r);
    },

    MulExpr(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.mulExpr(l, op.sourceString, r);
    },

    Factor(base, op, exponent) {
      const b = base.rep();
      const e = exponent?.rep();
      return core.factor(b, op?.sourceString, e);
    },

    Primary(value) {
      return core.primary(value.rep());
    },

    PrintStmt(_print, _open, expr, _close) {
      return core.printStmt(expr.rep());
    },

    StepCall(expr, _dot, _step, _open, stepValue, _close) {
      return core.stepCall(expr.rep(), stepValue?.rep());
    },

    InputStmt(_input, _open, prompt, _close) {
      return core.inputStmt(prompt.rep());
    },

    TimeCall(id, _colon, timeValue) {
      return core.timeCall(id.sourceString, id.rep(), timeValue.rep());
    },

    GlobalRange(range, timestep) {
      return core.globalRange(range.rep(), timestep?.rep());
    },

    LocalRange(_open, id, _close, range, timestep) {
      return core.localRange(id.sourceString, range.rep(), timestep?.rep());
    },

    NumRange(_open, start, _dots, end, _close) {
      return core.numRange(start.rep(), end?.rep());
    },

    CharRange(_open, start, _dots, end, _close) {
      return core.charRange(start.rep(), end?.rep());
    },

    Timestep(_t, value, _t) {
      return core.timestep(value.rep());
    },

    Num(value) {
      return core.num(Number(value.sourceString));
    },

    StringLiteral(value) {
      return core.stringLiteral(value.sourceString);
    },

    CharLiteral(value) {
      return core.charLiteral(value.sourceString);
    },

    Id(name) {
      const entity = context.lookup(name.sourceString);
      mustHaveBeenFound(entity, name.sourceString, { at: name });
      return entity;
    },
  });

  return builder(match).rep();
}