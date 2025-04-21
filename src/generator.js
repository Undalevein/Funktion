import { voidType, numberType, stringType, functionType, standardLibrary } from "./core.js";

export default function generate(program) {
  const output = [];
  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
          mapping.set(entity, mapping.size + 1);
      }
    return `${entity.name}_${mapping.get(entity)}`;
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
            for (let i = start; i >= end; i += step) {
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
      const funcName = targetName(d);
      const param = d.param;
      // console.log(d.body);
      const body = gen(d.body);
      output.push(`function ${funcName}(${param}) {`);
      output.push(`  ${body}`);
      output.push(`}`);
    },

    PrintStmt(s) {
      output.push(`funktionPrint(${gen(s.expr)});`);
    },

    StepCall(s) {
      const expr = gen(s.expr);
      const stepValue = s.stepValue ? gen(s.stepValue) : 1;
      return `${expr}[${stepValue - 1}]`;
    },

    Expr(e) {
      const exprs = [];
      for (const expr of [e.condExpr, ...e.rest]) {
        console.log(expr)
        exprs.push(gen(expr));
      }
      return exprs;
    },

    CondExpr(e) {
      if (e.thenBranch) {
        const condition = gen(e.condition);
        const thenBranch = gen(e.thenBranch);
        const elseBranch = gen(e.elseBranch);
        return `(${condition} ? ${thenBranch} : ${elseBranch})`;
      }
      return gen(e.left);
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
      if (e.op) {
        const left = gen(e.left);
        const right = gen(e.right);
        return `(${left} ${e.op} ${right})`;
      }
      return gen(e.left);
    },

    Factor(e) {
      if (e.op === '**') {
        return `Math.pow(${gen(e.base)}, ${gen(e.exponent)})`;
      } else if (e.op === '-') {
        return `(-${gen(e.operand)})`;
      } else if (e.op === '~') {
        return `(~${gen(e.operand)})`;
      }
      return gen(e.primary);
    },

    Primary(e) {
      return gen(e.value);
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
      return targetName(i);
    },

    FunctionCall(c) {
      return `${gen(c.callee)}`;
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