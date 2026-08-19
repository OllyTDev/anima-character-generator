import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PLACEHOLDER = "Effect not yet documented.";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "src", "data", "kiAbilities.ts");

let source = readFileSync(path, "utf8");
const recordStart = source.indexOf("export const kiAbilities");
if (recordStart === -1) throw new Error("Could not find kiAbilities export");

const names = [...source.matchAll(/^\s*"([^"]+)":\s*\{/gm)]
  .map((match) => match[1])
  .filter((name) => {
    const index = source.indexOf(`"${name}":`);
    return index > recordStart;
  });

let updated = 0;
for (const name of names) {
  if (source.match(new RegExp(`"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":\\s*\\{[^}]*effect:`))) {
    continue;
  }
  const openPattern = new RegExp(`("${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":\\s*\\{)`);
  source = source.replace(openPattern, `$1\n    effect: "${PLACEHOLDER}",`);
  updated++;
}

writeFileSync(path, source);
console.log(`Added effect placeholders to ${updated} Ki abilities (${names.length} total).`);
