import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const checks = [];

if (args.size === 0 || args.has('--dom')) {
  checks.push('scripts/audit-dom-removal.mjs');
}

if (args.size === 0 || args.has('--bundled-data')) {
  checks.push('scripts/audit-data.mjs');
}

if (args.size === 0 || args.has('--browser-apis')) {
  checks.push('scripts/audit-browser-apis.mjs');
}

for (const scriptPath of checks) {
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('Native port readiness checks passed.');
