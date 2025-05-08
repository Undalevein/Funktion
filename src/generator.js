export default function generate(program) {
  const inputCode = [];
  let inputIndex = 0;
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

  const instantiatedMutableRanges = new Set([]);


  const generators = {
    Program(p) {
      /**
       * Standard generator code used in every file.
       */
      this.functions = new Map();
      p.statements.forEach(s => {
        if (s.kind === "FuncDef") {
          this.functions.set(s.name, s);
        }
      });
      const range = p.globalRange?.[0]?.range;
      const timestep = p.globalRange?.[0]?.timestep?.[0];
      const start = range ? gen(range.start) : 1;
      const end = range ? gen(range.end[0]) : 5;
      const step = timestep ? gen(timestep.value) : 1;
      inputCode.push(`
        import { createInterface } from "node:readline/promises";
        import { stdin as input, stdout as output } from "node:process";
        const rl = createInterface({ input, output });
      `);
      output.push(`
        function generateRange(start = ${start}, end = ${end}, step = ${step}) {
          if (end < start) step *= -1;
          return {
            start,
            end,
            step
          };
        }

        function initializeMutableRange(timestepRange = generateRange()) {
          return {
            timestepRange,
            values: [],
            index: -1,
            size: 0
          };
        }

        function funktionPrint(value) {
          if (Array.isArray(value)) {
            console.log(value.join('\\n'));
          } 
          else if (typeof value === "object") {
            console.log(value.values.join('\\n'));
          }
          else {
            console.log(value);
          }
        }

        function applyFunction(gen, iterations, f) {
          let currentVal = gen.timestepRange.start + gen.timestepRange.step * (gen.index + 1);
          if (gen.size === 0) {
            gen.size++;
            gen.index++;
            const result = f(currentVal);
            gen.values.push(Array.isArray(result) ? result.join(' ') : result);
            currentVal += gen.timestepRange.step;
          }
          if (gen.timestepRange.step > 0) {
            while (currentVal <= gen.timestepRange.end && iterations > 0) {
              gen.size++;
              gen.index++;
              const result = f(currentVal);
              gen.values.push(Array.isArray(result) ? result.join(' ') : result);
              currentVal += gen.timestepRange.step;
              iterations--;
            }
          } else {
            while (currentVal >= gen.timestepRange.end && iterations > 0) {
              gen.size++;
              gen.index++;
              const result = f(currentVal);
              gen.values.push(Array.isArray(result) ? result.join(' ') : result);
              currentVal += gen.timestepRange.step;
              iterations--;
            }
          }
        }
      `);
      p.statements.forEach(gen);
      output.push(`rl.close();`);
      output.unshift(...inputCode);
    },

    FuncDef(d) {
      const funcName = targetName(d.name);
      const param = targetName(d.param);
      // const body = gen(d.body);

      // check for slices in the body of the function
      if (d.body.kind === "SliceExpr") {
        const sliceExpressions = d.body.expressions.map(expr => gen(expr)).join(", ");
        output.push(`function ${funcName}(${param}) { return [${sliceExpressions}]; }`);
      }
      if (!instantiatedMutableRanges.has(param)) {
        output.push(`let ${param} = initializeMutableRange();`);
        instantiatedMutableRanges.add(param)
      }
    },

    PrintStmt(s) {
      output.push(`funktionPrint(${gen(s.expr)});`);
    },

    StepCall(s) {
      const expr = targetName(s.expr.name);
      const stepValue = gen(s.stepValue);
      const arg = targetName(s.expr.arg);
      output.push(`applyFunction(${arg}, ${stepValue}, ${expr});`);
      return `${arg}.values[${arg}.index]`;
    },

    Expr(e) {
      const exprs = [];
      for (const expr of [e.condExpr, ...e.rest]) {
        exprs.push(gen(expr));
      }
      return exprs;
    },

    // SliceExpr(e) {
    //   const slices = e.expressions.map(gen);
    //   return `[${slices.join(', ')}]`;
    // },

    CondExpr(e) {
      if (e.thenBranch) {
        const condleft = gen(e.leftCond);
        const op = e.op === "==" ? "===" : 
                   e.op === "!=" ? "!==" :
                   e.op;
        const condright = gen(e.rightCond);
        const thenBranch = gen(e.thenBranch);
        const elseBranch = gen(e.elseBranch);
        return `( ${condleft} ${op} ${condright} ? ${thenBranch} : ${elseBranch})`;
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
        return `(${left} ${e.op} ${right})`;
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
      return `${gen(e.id)}.values.slice(0, ${gen(e.timeValue)})`;
    },

    InputStmt(e) {
      inputCode.push(`
        console.log(${gen(e.prompt[0])});
        const inputVar__${inputIndex} = await rl.question("Input: ");
      `);
      return `inputVar__${inputIndex++}`
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
      return targetName(i.name);
    },

    FuncCall(c) {
      return `${targetName(c.name)}(${gen(c.arg)})`;
    }
  };

  gen(program);
  return output.join("\n");
}