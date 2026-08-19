import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const legacy = JSON.parse(readFileSync(join(root, "scripts", "legacy-effects.json"), "utf8"));
const PLACEHOLDER = "Effect not yet documented.";

function injectEffects(filePath, recordName, legacyKey, benefitField = false) {
  let source = readFileSync(filePath, "utf8");
  const recordStart = source.indexOf(`export const ${recordName}`);
  if (recordStart === -1) throw new Error(`Could not find ${recordName} in ${filePath}`);

  const names = [...source.matchAll(/^\s*"([^"]+)":\s*\{/gm)]
    .map((match) => match[1])
    .filter((name) => {
      const index = source.indexOf(`"${name}":`);
      return index > recordStart;
    });

  for (const name of names) {
    if (source.includes(`"${name}": {`) && source.match(new RegExp(`"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":\\s*\\{[^}]*effect:`))) {
      continue;
    }

    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const openPattern = new RegExp(`("${escaped}":\\s*\\{)`);
    const effect = legacy[legacyKey][name] ?? PLACEHOLDER;
    const escapedEffect = effect.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    source = source.replace(openPattern, `$1\n    effect: "${escapedEffect}",`);
  }

  writeFileSync(filePath, source);
  console.log(`Updated ${names.length} entries in ${filePath}`);
}

injectEffects(join(root, "src", "data", "advantages.ts"), "advantages", "advantages");
injectEffects(join(root, "src", "data", "disadvantages.ts"), "disadvantages", "disadvantages");
