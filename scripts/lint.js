import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const targets = [join(root, "mock"), join(root, "scripts"), join(root, "tests")];
const disallowedPatterns = [/\beval\s*\(/, /new Function\s*\(/];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, files);
      continue;
    }
    if (path.endsWith(".js")) files.push(path);
  }
  return files;
}

const jsFiles = targets.flatMap((dir) => walk(dir));
const failures = [];

for (const file of jsFiles) {
  const content = readFileSync(file, "utf8");
  if (/\bvar\s+[A-Za-z_$]/.test(content)) {
    failures.push(`${file}: avoid legacy declarations`);
  }
  for (const pattern of disallowedPatterns) {
    if (pattern.test(content)) {
      failures.push(`${file}: disallowed unsafe pattern ${pattern}`);
    }
  }
}

if (failures.length) {
  console.error("Lint failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Lint passed for ${jsFiles.length} files.`);
