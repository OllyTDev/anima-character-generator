import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const legacyDir = join(distDir, "legacy");
const legacyPaths = ["index.html", "css", "js", "fonts"];

function hasLegacyTag() {
  try {
    execSync("git rev-parse v0-legacy", { cwd: root, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

if (!existsSync(distDir)) {
  console.log("dist/ not found; skipping legacy copy.");
  process.exit(0);
}

if (!hasLegacyTag()) {
  console.warn("v0-legacy tag not found; skipping legacy copy.");
  process.exit(0);
}

mkdirSync(legacyDir, { recursive: true });

const archivePath = join(tmpdir(), "anima-legacy-build.tar");
try {
  execSync(`git archive v0-legacy -o "${archivePath}" ${legacyPaths.join(" ")}`, {
    cwd: root,
    stdio: "inherit",
  });
  execSync(`tar -xf "${archivePath}" -C legacy`, {
    cwd: distDir,
    stdio: "inherit",
    shell: true,
  });
} finally {
  if (existsSync(archivePath)) rmSync(archivePath);
}

console.log("Copied legacy generator to dist/legacy/");
