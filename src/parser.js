import * as fs from "fs";
import * as ohm from "ohm-js";

const grammar = ohm.grammar(fs.readFileSync("src/cassowary.ohm", "utf8"));

export default function parse(sourceCodeFileName) {
  const sourceCode = fs.reeadFileSync(sourceCodeFileName, "utf8");
  const match = grammar.mathc(sourceCode);
  if (math.failed()) {
    throw match.message;
  }
  return match;
}
