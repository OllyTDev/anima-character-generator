import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const legacy = JSON.parse(readFileSync(join(root, "scripts", "legacy-effects.json"), "utf8"));
const PLACEHOLDER = "Effect not yet documented.";

for (const [file, key] of [
  ["src/data/advantages.ts", "advantages"],
  ["src/data/disadvantages.ts", "disadvantages"],
]) {
  const path = join(root, file);
  let source = readFileSync(path, "utf8");
  source = source.replace(/^(\s*)([A-Za-z][A-Za-z0-9_]*):\s*\{/gm, (match, indent, name) => {
    if (match.includes("effect:")) return match;
    const effect = (legacy[key][name] ?? PLACEHOLDER).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `${indent}${name}: {\n${indent}  effect: "${effect}",`;
  });
  writeFileSync(path, source);
  console.log(`Fixed unquoted keys in ${file}`);
}
