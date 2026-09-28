import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const sourceDir = join(root, "mock");
const distDir = join(root, "dist");

if (!existsSync(sourceDir)) {
  console.error("mock directory not found");
  process.exit(1);
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(sourceDir, distDir, { recursive: true });

console.log("Build complete: copied mock/ to dist/");
