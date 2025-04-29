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
    return this.locals.get(name) /*|| this.parent?.lookup(name)*/;
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

  function mustBeTypeUnary(e1, type, at) {
    must(
      e1.type === type || e1.type === core.anyType,
      `Operator does not support ${e1.type} types. Expected ${type}`,
      at
    );
  }

  function mustBeTypeBinary(e1, e2, type, at) {
    must(
      e1.type === e2.type ||
        e1.type === core.anyType ||
        e2.type === core.anyType,
      `Operands do not have the same type. Given ${e1.type} and ${e2.type} types`,
      at
    );
    must(
      e1.type === type && e2.type === type ||
        e1.type === core.anyType ||
        e2.type === core.anyType,
      `Operator does not support ${e1.type} types. Expected ${type}`,
      at
    );
  }

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(globalRanges, _newLines, _moreNewlines, statements) {
      return core.program(
        globalRanges.rep().length ? globalRanges.rep() : null,
        statements.asIteration().children.map((statement) => statement?.rep())
      );
    },

    _iter(...children) {
      return children.map((child) => child?.rep()).filter(Boolean);
    },

    FuncDef(
      id,
      open,
      param,
      close,
      _eq,
      _newLine,
      body,
      _semicolon,
      _something
    ) {
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      // Temporary check inside the function.
      const originalContext = context;
      context = context.newChildContext();
      context.add(param.sourceString, {
        kind: "Parameter",
        type: core.numberType,
        name: param.sourceString,
      });
      const functionId =
        id.sourceString +
        open.sourceString +
        param.sourceString +
        close.sourceString;
      context.add(functionId, {
        kind: "Function",
        type: core.functionType,
        name: functionId,
      });
      const analyzedBody = body?.rep();
      // Checks outside of the function definition.
      context = originalContext;
      context.add(functionId, {
        kind: "Function",
        type: core.functionType,
        name: functionId,
      });
      const func = core.funcDef(
        id.sourceString,
        param.sourceString,
        analyzedBody
      );
      context.add(id.sourceString, func);
      return func;
    },

    FuncCall(id, open, arg, close) {
      const functionId =
        id.sourceString +
        open.sourceString +
        arg.sourceString +
        close.sourceString;
      const func = context.lookup(functionId);
      mustHaveBeenFound(func, id.sourceString, { at: id });
      return core.funcCall(id.sourceString, arg.sourceString);
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
      condLeft,
      op,
      condRight,
      _arrow,
      thenBranch,
      _colon,
      _newLine,
      elseBranch
    ) {
      const left = condLeft.rep();
      const right = condRight.rep();
      mustBeTypeBinary(left, right, { at: op });
      return core.condExpr(
        left,
        op.sourceString,
        right,
        thenBranch.rep(),
        elseBranch.rep()
      );
    },

    CondExpr(bitwiseExpr) {
      const expr = bitwiseExpr.rep();
      return core.condExpr(expr);
    },

    BitwiseExpr_binary(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBeTypeBinary(l, r, core.numberType, { at: op });
      return core.bitwiseExpr(l, op.sourceString, r);
    },

    BitwiseExpr(shiftExpr) {
      const expr = shiftExpr.rep();
      return core.bitwiseExpr(expr);
    },

    ShiftExpr_binary(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBeTypeBinary(l, r, core.numberType, { at: op });
      return core.shiftExpr(l, op.sourceString, r);
    },

    ShiftExpr(addExpr) {
      const expr = addExpr.rep();
      return core.shiftExpr(expr);
    },

    AddExpr_binary(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      if (op.sourceString === "-") {
        mustBeTypeBinary(l, r, core.numberType, { at: op });
      } else {
        if (l.type === core.numberType) {
          mustBeTypeBinary(l, r, core.numberType, { at: op });
        } else {
          mustBeTypeBinary(l, r, core.stringType, { at: op });
        }
      }
      return core.addExpr(l, op.sourceString, r);
    },

    AddExpr(mulExpr) {
      const expr = mulExpr.rep();
      return core.addExpr(expr);
    },

    MulExpr_binary(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBeTypeBinary(l, r, core.numberType, { at: op });
      return core.mulExpr(l, op.sourceString, r);
    },

    MulExpr_mul(left, right) {
      const l = left.rep();
      const r = right.sourceString;
      return core.mulExpr(l, "*", r);
    },

    MulExpr(factor) {
      const expr = factor.rep();
      return core.mulExpr(expr);
    },

    Factor_exponentiation(base, op, exponent) {
      const b = base.rep();
      const e = exponent?.rep();
      mustBeTypeBinary(b, e, core.numberType, { at: op });
      return core.factor(b, op?.sourceString, e);
    },

    Factor_negation(op, right) {
      const r = right.rep();
      mustBeTypeUnary(r, core.numberType, { at: op });
      return core.factor(null, op.sourceString, r);
    },

    Factor_bitwisenegation(op, right) {
      const r = right.rep();
      mustBeTypeUnary(r, core.numberType, { at: op });
      return core.factor(null, op.sourceString, r);
    },

    Factor(value) {
      return core.factor(value.rep());
    },

    Primary_parens(_open, expr,_close) {
      return core.primary(expr.rep());
    },

    Primary(value) {
      return core.primary(value.rep());
    },

    PrintStmt(_print, _open, expr, _close) {
      return core.printStmt(expr.rep());
    },

    StepCall(expr, _dot, _step, _open, stepValue, _close) {
      // Syntax Sugar: Default step count is 1.
      return core.stepCall(
        expr.rep(),
        stepValue.rep().length ? stepValue.rep() : 1
      );
    },

    InputStmt(_input, _open, prompt, _close) {
      if (!context.parent) {
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

    // LocalRange(_open, id, _close, range, timestep) {
    //   return core.localRange(id.sourceString, range.rep(), timestep?.rep());
    // },

    numrange(_open, start, _dots, end, _close) {
      return core.numRange(start?.rep(), end?.rep());
    },

    charrange(_open, start, _dots, end, _close) {
      return core.charRange(start?.rep(), end?.rep());
    },

    timestep(_tstart, _question, value, _tend) {
      return core.timestep(value.rep());
    },

    num(sign, value, period, decimal) {
      const number = Number(
        sign.sourceString +
          value.sourceString +
          period.sourceString +
          decimal.sourceString
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
      return core.id(firstChar.sourceString + name?.sourceString);
    },

    _terminal(...children) {
      return children.map((c) => c.sourceString).join("");
    },
  });

  return builder(match).rep();
}
