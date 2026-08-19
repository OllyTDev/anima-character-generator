import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsDir = path.join(root, "js");
const outDir = path.join(root, "src", "data");

fs.mkdirSync(outDir, { recursive: true });

function writeTs(fileName, exportName, objectLiteral, extraHeader = "") {
  const contents = `${extraHeader}export const ${exportName} = ${objectLiteral} as const;\n`;
  fs.writeFileSync(path.join(outDir, fileName), contents, "utf8");
}

function extractDefineObject(content) {
  const start = content.indexOf("define({");
  if (start === -1) {
    throw new Error("define({ not found");
  }
  let i = start + "define(".length;
  let depth = 0;
  const begin = i;
  for (; i < content.length; i++) {
    const ch = content[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return content.slice(begin, i + 1);
      }
    }
  }
  throw new Error("unbalanced braces");
}

function extractReturnObject(content) {
  const start = content.indexOf("return {");
  if (start === -1) {
    throw new Error("return { not found");
  }
  let i = start + "return ".length;
  let depth = 0;
  const begin = i;
  for (; i < content.length; i++) {
    const ch = content[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return content.slice(begin, i + 1);
      }
    }
  }
  throw new Error("unbalanced braces");
}

writeTs(
  "tables.ts",
  "tables",
  extractDefineObject(fs.readFileSync(path.join(jsDir, "tables.js"), "utf8")),
);
writeTs(
  "combatModules.ts",
  "combatModules",
  extractDefineObject(fs.readFileSync(path.join(jsDir, "modules.js"), "utf8")),
);
writeTs(
  "martialArts.ts",
  "martialArts",
  extractDefineObject(fs.readFileSync(path.join(jsDir, "martial_arts.js"), "utf8")),
);
writeTs(
  "culturalRoots.ts",
  "culturalRoots",
  extractDefineObject(fs.readFileSync(path.join(jsDir, "cultural_roots.js"), "utf8")),
);
writeTs(
  "metamagic.ts",
  "metamagic",
  extractDefineObject(fs.readFileSync(path.join(jsDir, "metamagic.js"), "utf8")),
);
writeTs(
  "powers.ts",
  "powers",
  extractReturnObject(fs.readFileSync(path.join(jsDir, "powers.js"), "utf8")),
);

const psychic = fs.readFileSync(path.join(jsDir, "psychic_disciplines.js"), "utf8");
writeTs(
  "psychicDisciplines.ts",
  "psychicDisciplines",
  extractDefineObject(psychic),
);

console.log("Converted catalogs into src/data");
