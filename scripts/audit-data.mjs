import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const requiredFiles = ['ship.csv', 'images.zip', 'no-image.svg'];
const failures = [];

for (const fileName of requiredFiles) {
  const filePath = join(rootDir, fileName);

  if (!existsSync(filePath)) {
    failures.push(`${fileName}: missing`);
    continue;
  }

  const stats = statSync(filePath);

  if (!stats.isFile()) {
    failures.push(`${fileName}: not a file`);
    continue;
  }

  if (stats.size <= 0) {
    failures.push(`${fileName}: empty`);
  }
}

if (failures.length > 0) {
  console.error(`Bundled data audit failed:\n${failures.map((entry) => `- ${entry}`).join('\n')}`);
  process.exit(1);
}

const summary = requiredFiles
  .map((fileName) => {
    const { size } = statSync(join(rootDir, fileName));
    return `${fileName} (${size} bytes)`;
  })
  .join(', ');

console.log(`Bundled data audit passed. Required files present: ${summary}.`);
