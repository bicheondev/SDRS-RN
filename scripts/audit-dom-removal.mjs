import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const rootDir = process.cwd();
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json']);
const scanRoots = ['src', 'scripts'];
const scanFiles = ['package.json', 'vite.config.js'];
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build']);
const domDirectoryName = 'd' + 'om';
const useDirectivePattern = new RegExp(`(^|\\n)\\s*['"]use\\s+${domDirectoryName}['"]\\s*;?`);
const domImportPattern = new RegExp(
  `(?:from\\s*['"]|import\\s*\\(\\s*['"]|require\\s*\\(\\s*['"])(?:\\.?\\.?\\/)+${domDirectoryName}(?:\\/|['"]|\\))`,
);
const domPathPattern = new RegExp(`(?:^|[^a-zA-Z0-9_-])(?:src\\/|\\.?\\.?\\/)${domDirectoryName}(?:\\/|['"])`);
const domSegmentPattern = new RegExp(`\\/${domDirectoryName}\\/`);

function getExtension(filePath) {
  const lastDot = filePath.lastIndexOf('.');
  return lastDot === -1 ? '' : filePath.slice(lastDot);
}

function walkFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const files = [];

  for (const entry of readdirSync(dir)) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }

    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    if (stats.isFile() && sourceExtensions.has(getExtension(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectScanFiles() {
  return [
    ...scanRoots.flatMap((root) => walkFiles(join(rootDir, root))),
    ...scanFiles.map((fileName) => join(rootDir, fileName)).filter(existsSync),
  ];
}

const removedWrapperDir = join(rootDir, 'src', domDirectoryName);
const violations = [];

if (existsSync(removedWrapperDir)) {
  violations.push(`src/${domDirectoryName} still exists`);
}

for (const filePath of collectScanFiles()) {
  const source = readFileSync(filePath, 'utf8');
  const relativePath = relative(rootDir, filePath);

  if (useDirectivePattern.test(source)) {
    violations.push(`${relativePath}: contains removed wrapper directive`);
  }

  if (
    domImportPattern.test(source) ||
    domPathPattern.test(source) ||
    domSegmentPattern.test(source)
  ) {
    violations.push(`${relativePath}: references removed wrapper path`);
  }
}

if (violations.length > 0) {
  console.error(`DOM wrapper audit failed:\n${violations.map((entry) => `- ${entry}`).join('\n')}`);
  process.exit(1);
}

console.log('DOM wrapper audit passed. No active wrapper references found.');
