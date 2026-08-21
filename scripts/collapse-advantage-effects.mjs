import fs from "node:fs";

const path = new URL("../src/data/advantages.ts", import.meta.url);
let content = fs.readFileSync(path, "utf8");

content = content.replace(/effect:\s*`([\s\S]*?)`/g, (_match, body) => {
  const singleLine = body.replace(/\s+/g, " ").trim();
  const escaped = singleLine.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `effect: "${escaped}"`;
});

fs.writeFileSync(path, content);
console.log("Collapsed effect strings in advantages.ts");
