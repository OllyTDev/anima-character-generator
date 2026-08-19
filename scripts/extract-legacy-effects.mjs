import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function extractEffects(source) {
  const effects = {};
  for (const line of source.split("\n")) {
    const commentIdx = line.indexOf("//");
    if (commentIdx === -1) continue;
    const before = line.slice(0, commentIdx);
    const effect = line.slice(commentIdx + 2).trim();
    const nameMatch = before.match(/^\s*'([^']+)':\s*\{/) || before.match(/^\s*([A-Za-z][A-Za-z0-9_]*):\s*\{/);
    if (nameMatch && effect) effects[nameMatch[1]] = effect;
  }
  return effects;
}

const advantagesSource = execSync("git show v0-legacy:js/advantages.js", { cwd: root, encoding: "utf8" });
const disadvantagesSource = execSync("git show v0-legacy:js/disadvantages.js", { cwd: root, encoding: "utf8" });

const payload = {
  advantages: extractEffects(advantagesSource),
  disadvantages: extractEffects(disadvantagesSource),
};

writeFileSync(join(root, "scripts", "legacy-effects.json"), `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Extracted ${Object.keys(payload.advantages).length} advantage and ${Object.keys(payload.disadvantages).length} disadvantage effects.`);
