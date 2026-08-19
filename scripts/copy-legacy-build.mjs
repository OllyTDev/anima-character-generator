import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const legacyDir = join(distDir, "legacy");
const legacyPaths = ["index.html", "css", "js", "fonts"];
const legacySources = ["v0-legacy", "origin/gh-pages", "gh-pages"];

function resolveLegacyRef() {
  for (const ref of legacySources) {
    try {
      execSync(`git rev-parse ${ref}`, { cwd: root, stdio: "pipe" });
      return ref;
    } catch {
      // try next source
    }
  }
  return null;
}

if (!existsSync(distDir)) {
  console.log("dist/ not found; skipping legacy copy.");
  process.exit(0);
}

const legacyRef = resolveLegacyRef();
if (!legacyRef) {
  const message = "No legacy source found (expected v0-legacy tag or gh-pages branch).";
  if (process.env.REQUIRE_LEGACY_BUILD === "1") {
    console.error(message);
    process.exit(1);
  }
  console.warn(`${message} Skipping legacy copy.`);
  process.exit(0);
}

mkdirSync(legacyDir, { recursive: true });

const archivePath = join(tmpdir(), "anima-legacy-build.tar");
try {
  execSync(`git archive ${legacyRef} -o "${archivePath}" ${legacyPaths.join(" ")}`, {
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

if (!existsSync(join(legacyDir, "index.html"))) {
  const message = `Legacy bundle missing after archiving ${legacyRef}.`;
  if (process.env.REQUIRE_LEGACY_BUILD === "1") {
    console.error(message);
    process.exit(1);
  }
  console.warn(message);
  process.exit(0);
}

console.log(`Copied legacy generator from ${legacyRef} to dist/legacy/`);
