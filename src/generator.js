import { voidType, numberType, stringType, functionType, standardLibrary } from "./core.js";

export default function generate(program) {
  const output = [];
  const targetName = ((mapping) => {
    return (name) => {
      if (!mapping.has(name)) {
        mapping.set(name, mapping.size + 1);
      }
      return `${name}_${mapping.get(name)}`;
    };
  })(new Map());

  const gen = node => generators?.[node?.kind]?.(node) ?? node

  // const gen = (node) => {
  //   if (!node) return '';
  //   const handler = generators[node.kind];
  //   if (handler) {
  //     return handler(node);
  //   }
  //   throw new Error(`No generator for node type: ${node.kind}`);
  // };

  let currentFunction = { name: null, param: null };

  const generators = {
    Program(p) {
      output.push(`
        function generateRange(start, end, step) {
          const range = [];
          if (step === 0) step = 1;
          if (start <= end) {
            for (let i = start; i <= end; i += step) {
              range.push(i);
            }
          }
          else {
            for (let i = start; i >= end; i -= step) {
              range.push(i);
            }
          }
          return range;
        }

        function funktionPrint(value) {
          if (Array.isArray(value)) {
            console.log(value.join('\\n'));
          }
          else {
            console.log(value);
          }
        }
      `);
      if (p.globalRange) {
        const start = gen(p.globalRange[0].range.start);
        const end = gen(p.globalRange[0].range.end[0]);
        const step = p.globalRange[0].timestep ? gen(p.globalRange[0].timestep[0].value) : (start <= end ? 1 : -1);
        output.push(`const globalRange = generateRange(${start}, ${end}, ${step});`);
      } 
      else {
        output.push(`const globalRange = [];`);
      }
      p.statements.forEach(gen);
    },

    // FuncDef(d) {
    //   const funcName = targetName(d);
    //   const param = d.param;
    //   output.push(`const ${funcName} = [];`);
    //   output.push(`let previous_${funcName} = 1;`);
    //   output.push(`for (const ${param} of globalRange) {`);
    //   const body = gen(d.body);
    //   output.push(`  ${funcName}.push(${body});`);
    //   output.push(`  previous_${funcName} = ${funcName}[${funcName}.length - 1];`);
    //   output.push(`}`);
    // },

    FuncDef(d) {
      const funcName = targetName(d.name);
      const param = d.param;
      currentFunction.name = funcName;
      currentFunction.param = param;
      output.push(`const ${funcName} = [];`);
      output.push(`let previous_${funcName} = 1;`);
      output.push(`for (const ${param} of globalRange) {`);
      const body = gen(d.body);
      output.push(`  ${funcName}.push(${body});`);
      output.push(`  previous_${funcName} = ${funcName}[${funcName}.length - 1];`);
      output.push(`}`);
      currentFunction.name = null;
      currentFunction.param = null;
    },

    PrintStmt(s) {
      output.push(`funktionPrint(${gen(s.expr)});`);
    },

    StepCall(s) {
      const expr = gen(s.expr);
      let stepValue = s.stepValue ? gen(s.stepValue) : 1;
      stepValue = Number(stepValue) || 1;
      if (currentFunction.name && expr === `${currentFunction.name}(${currentFunction.param})`) {
        return `previous_${currentFunction.name}`;
      }
      return `${expr}[${stepValue - 1}]`;
    },

    Expr(e) {
      const exprs = [];
      for (const expr of [e.condExpr, ...e.rest]) {
        exprs.push(gen(expr));
      }
      return exprs;
    },

    CondExpr(e) {
      if (e.thenBranch) {
        const condleft = gen(e.leftCond);
        const op = e.op;
        const condright = gen(e.rightCond);
        const thenBranch = gen(e.thenBranch);
        const elseBranch = gen(e.elseBranch);
        return `(${condleft} ${op} ${condright} ? ${thenBranch} : ${elseBranch})`;
      }
      return gen(e.leftCond);
    },

    BitwiseExpr(e) {
      if (e.op) {
        const left = gen(e.left);
        const right = gen(e.right);
        return `(${left} ${e.op} ${right})`;
      }
      return gen(e.left);
    },

    ShiftExpr(e) {
      if (e.op) {
        const left = gen(e.left);
        const right = gen(e.right);
        return `(${left} ${e.op} ${right})`;
      }
      return gen(e.left);
    },

    AddExpr(e) {
      if (e.op) {
        const left = gen(e.left);
        const right = gen(e.right);
        return `(${left} ${e.op} ${right})`;
      }
      return gen(e.left);
    },

    MulExpr(e) {
      if (e.right) {
        const left = gen(e.left);
        const right = gen(e.right);
        return `(${left} ${e.op || "*"} ${right})`;
      }
      return gen(e.left);
    },

    Factor(e) {
      if (e.op === '**') {
        return `Math.pow(${gen(e.base)}, ${gen(e.exponent)})`;
      } else if (e.op === '-') {
        return `(-${gen(e.exponent)})`;
      } else if (e.op === '~') {
        return `(~${gen(e.exponent)})`;
      }
      return gen(e.base);
    },

    Primary(e) {
      return gen(e.value);
    },

    TimeCall(e) {
      return gen(e.funcCall);
    },

    num(n) {
      return n.value;
    },

    StringLiteral(s) {
      return JSON.stringify(s.value);
    },

    CharLiteral(c) {
      return JSON.stringify(c.value.charAt(0));
    },

    id(i) {
      return i.name;
    },

    FuncCall(c) {
      return `${targetName(c.name)}(${c.arg})`;
    },

    GlobalRange(r) {
      return r;
    },

    numRange(r) {
      return { start: gen(r.start), end: gen(r.end) };
    },

    timestep(t) {
      return t.value;
    }
  };

  gen(program);
  return output.join("\n");
}