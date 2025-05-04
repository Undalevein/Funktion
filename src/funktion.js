#! /usr/bin/env node

import * as fs from "node:fs/promises";
import stringify from "graph-stringify";
import compile from "./compiler.js";

const help = `Funktion compiler

Syntax: funktion <filename> <outputType>

Available compiler phases (outputType):
  parsed     - Show raw parser output
  analyzed   - Display analyzed AST
  optimized  - Show optimized AST
  js         - Generate JavaScript code

Or run individual phases:
  parse      - Only run the parser
  analyze    - Run parser + analyzer
  optimize   - Run up to optimizer
  generate   - Full compilation pipeline
`;

// Modify the compileFromFile function
async function compileFromFile(filename, outputType) {
  try {
    const buffer = await fs.readFile(filename);
    let result;
    
    switch(outputType.toLowerCase()) {
      case 'parse':
        result = parse(buffer.toString());
        break;
      case 'analyze':
        result = analyze(parse(buffer.toString()));
        break;
      case 'optimize':
        result = optimize(analyze(parse(buffer.toString())));
        break;
      case 'generate':
        result = generate(optimize(analyze(parse(buffer.toString()))));
        break;
      default: // Maintain original output types
        result = compile(buffer.toString(), outputType);
    }
    
    console.log(stringify(result, "kind") || result);
  } catch (e) {
    console.error(`\u001b[31m${e}\u001b[39m`);
    process.exitCode = 1;
  }
}

if (process.argv.length !== 4) {
  console.log(help);
} else {
  compileFromFile(process.argv[2], process.argv[3]);
}
