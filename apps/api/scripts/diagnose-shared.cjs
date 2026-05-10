const fs = require("fs");
const path = require("path");

const apiDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(apiDir, "../..");

const targets = [
  path.join(repoRoot, "packages/shared"),
  path.join(repoRoot, "packages/shared/dist"),
  path.join(apiDir, "node_modules/@smartjob/shared"),
  path.join(apiDir, "node_modules/@smartjob/shared/dist"),
];

console.log("=== diagnose-shared ===");
console.log("cwd:", process.cwd());
console.log("apiDir:", apiDir);
console.log("repoRoot:", repoRoot);

for (const t of targets) {
  try {
    const stat = fs.lstatSync(t);
    const kind = stat.isSymbolicLink()
      ? `symlink -> ${fs.readlinkSync(t)}`
      : stat.isDirectory()
        ? "dir"
        : "file";
    console.log(`\n[${kind}] ${t}`);
    if (stat.isDirectory() || stat.isSymbolicLink()) {
      try {
        const entries = fs.readdirSync(t);
        console.log("  contents:", entries.join(", ") || "(empty)");
      } catch (e) {
        console.log("  readdir failed:", e.message);
      }
    }
  } catch (e) {
    console.log(`\n[MISSING] ${t}`);
    console.log("  ", e.message);
  }
}

console.log("\n=== end diagnose-shared ===");
