import * as core from "./core.js";

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, locals, inLoop, function: f });
  }

  add(name, entity) {
    this.locals.set(name, entity);
  }

  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name);
  }

  static root() {
    return new Context({
      locals: new Map(Object.entries(core.standardLibrary)),
    });
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

  function mustBothHaveTheSameType(e1, e2, at) {
    must(e1.type === e2.type, "Operands do not have the same type", at);
  }

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(globalRanges, _newLines, _moreNewlines, statements) {
      return core.program(
        globalRanges?.[0]?.rep() ?? null,
        statements.asIteration().children.map((statement) => statement?.rep())
      );
    },
    
    _iter(...children) {
      return children.map(child => child?.rep()).filter(Boolean);
    },

    FuncDef(
      id,
      _open,
      param,
      _close,
      _eq,
      _newLine,
      body,
      _semicolon,
      _something
    ) {
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      const originalContext = context;
      context = context.newChildContext();
      context.add(param.sourceString, { 
        kind: "Parameter",
        type: core.numberType,
        name: param.sourceString
      });
      const analyzedBody = body?.rep();
      context = originalContext;
      const func = core.funcDef(id.sourceString, param.sourceString, analyzedBody);
      context.add(id.sourceString, func);
      return func;
    },

    FuncCall(id, _open, arg, _close) {
      const func = context.lookup(id.sourceString);
      mustHaveBeenFound(func, id.sourceString, { at: id });
      return core.funcCall(id.sourceString, arg.rep());
    },

    FunctionGroup(_open, expr, _close) {
      return core.functionGroup(expr.rep());
    },

    Expr(condExpr, _sep, _newLine, rest) {
      return core.expr(
        condExpr.rep(),
        rest.children.map((r) => r.rep())
      );
    },

    CondExpr_ternary(
      _question,
      condition,
      _newLine,
      thenBranch,
      _semicolon,
      elseBranch
    ) {
      const cond = condition.rep();
      return core.condExpr(cond, thenBranch.rep(), elseBranch?.rep());
    },

    CondExpr(bitwiseExpr) {
      const expr = bitwiseExpr.rep();
      return core.shiftExpr(expr);
    },

    BitwiseExpr_binary(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.bitwiseExpr(l, op.sourceString, r);
    },

    BitwiseExpr(shiftExpr) {
      const expr = shiftExpr.rep();
      return core.shiftExpr(expr);
    },

    ShiftExpr_binary(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.shiftExpr(l, op.sourceString, r);
    },

    ShiftExpr(addExpr) {
      const expr = addExpr.rep();
      return core.shiftExpr(expr);
    },

    AddExpr_binary(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.addExpr(l, op.sourceString, r);
    },

    AddExpr(mulExpr) {
      const expr = mulExpr.rep();
      return core.shiftExpr(expr);
    },

    MulExpr_binary(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.mulExpr(l, op.sourceString, r);
    },

    MulExpr_mul(left, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      return core.mulExpr(l, op.sourceString, r);
    },

    MulExpr(factor) {
      const expr = factor.rep();
      return core.shiftExpr(expr);
    },

    Factor_exponentiation(base, op, exponent) {
      const b = base.rep();
      const e = exponent?.rep();
      return core.factor(b, op?.sourceString, e);
    },

    Factor_negation(op, right) {
      const r = right.rep();
      return core.factor(op.sourceString, r);
    },

    Factor_bitwisenegation(op, right) {
      const r = right.rep();
      return core.factor(op.sourceString, r);
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
      if (!context.function) {
        throw new Error("Input statements must be inside functions");
      }
      return core.inputStmt(prompt?.rep());
    },

    TimeCall(funcCall, _colon, timeValue) {
      return core.timeCall(funcCall.rep(), timeValue.rep());
    },

    GlobalRange(range, timestep) {
      return core.globalRange(range.rep(), timestep?.rep());
    },

    LocalRange(_open, id, _close, range, timestep) {
      return core.localRange(id.sourceString, range.rep(), timestep?.rep());
    },

    numrange(_open, start, _dots, end, _close) {
      return core.numRange(start?.rep(), end?.rep());
    },

    charrange(_open, start, _dots, end, _close) {
      return core.charRange(start?.rep(), end?.rep());
    },

    timestep(_tstart, _question, value, _tend) {
      return core.timestep(value.rep());
    },

    num(value, period, decimal) {
      const number = Number(
        value.sourceString + period.sourceString + decimal.sourceString
      );
      return core.num(number);
    },

    stringliteral(_start, value, _end) {
      return core.stringLiteral(value?.sourceString);
    },

    charliteral(_start, value, _end) {
      return core.charLiteral(value.sourceString);
    },

    id(firstChar, name) {
      const entity = context.lookup(
        firstChar.sourceString + name?.sourceString
      );
      mustHaveBeenFound(entity, name.sourceString, { at: name });
      return entity;
    },
  });

  return builder(match).rep();
}
