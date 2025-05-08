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
    
    return new Context({ ...this, ...props, parent: this, locals: this.locals });
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
      // Temporary check inside the function.
      const originalContext = context;
      context = context.newChildContext();
      context.add(id.sourceString, {
        kind: "Function",
        type: core.functionType,
        name: id.sourceString,
      });
      context.add(param.sourceString, {
        kind: "MutableRange",
        type: core.numberType,
        name: param.sourceString,
      });
      const functionId = `${id.sourceString}(${param.sourceString})`;
      context.add(functionId, {
        kind: "Function",
        type: core.functionType,
        name: functionId,
      });
      const analyzedBody = body?.rep();
      // Checks outside of the function definition.
      context = originalContext;
      context.add(id.sourceString, {
        kind: "Function",
        type: core.functionType,
        name: functionId,
      });
      context.add(param.sourceString, {
        kind: "MutableRange",
        type: core.numberType,
        name: param.sourceString,
      });
      const func = core.funcDef(
        id.sourceString,
        param.sourceString,
        analyzedBody
      );
      context.add(id.sourceString, func);
      return func;
    },

    FuncCall(id, _open, arg, _close) {
      const func = context.lookup(id.sourceString);
      mustHaveBeenFound(func, id.sourceString, { at: id });
      return core.funcCall(id.sourceString, arg.rep());
    },

    Expr(condExpr, _sep, _newLine, rest) {
      return core.expr(
        condExpr.rep(),
        rest.children.map((r) => r.rep())
      );
    },

    SliceExpr(expr, _backslash, rest) {
      const expressions = [expr.rep()];
      if (rest.children.length > 0) {
        expressions.push(...rest.children.map(child => child.rep()));
      }
      return core.sliceExpr(expressions);
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
      const r = right.rep();
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

    StepCall(id, _open, arg, _close, _dot, _step, _open1, stepValue, _close1) {
      // Syntax Sugar: Default step count is 1.
      return core.stepCall(
        {name: id.sourceString, arg: arg.sourceString},
        stepValue.rep().length ? stepValue.rep()[0].value : 1
      );
    },

    InputStmt(_input, _open, prompt, _close) {
      if (!context.parent) {
        throw new Error("Input statements must be inside functions");
      }
      return core.inputStmt(prompt?.rep());
    },

    TimeCall(id, _colon, timeValue) {
      return core.timeCall(id.rep(), timeValue.rep());
    },

    GlobalRange(range, timestep) {
      return core.globalRange(range.rep(), timestep?.rep());
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

    num(sign, value, _period, decimal) {
      const number = Number(
        sign.sourceString +
        value.sourceString +
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
      const idName = firstChar.sourceString + name?.sourceString;
      const entity = context.lookup(idName);
      mustHaveBeenFound(entity, idName, { at: name });
      return core.id(idName);
    },

    _terminal(...children) {
      return children.map((c) => c.sourceString).join("");
    },
  });

  return builder(match).rep();
}
