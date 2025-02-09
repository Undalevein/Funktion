import * as fs from "fs";
import * as ohm from "ohm-js";

if (process.argv.length !== 3) {
  console.error("Usage: node src/cassowary.js FILENAME");
  process.exit(1);
}
