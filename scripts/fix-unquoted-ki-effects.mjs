import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PLACEHOLDER = "Effect not yet documented.";
const path = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "kiAbilities.ts");

let source = readFileSync(path, "utf8");
source = source.replace(/^(\s*)([A-Za-z][A-Za-z0-9_ ()]*):\s*\{/gm, (match, indent, name) => {
  if (match.includes("effect:")) return match;
  return `${indent}${name}: {\n${indent}  effect: "${PLACEHOLDER}",`;
});

writeFileSync(path, source);
console.log("Fixed unquoted Ki ability keys.");
