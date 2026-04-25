import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const rootDir = process.cwd();
const sourceDir = join(rootDir, 'src');
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const allowedPathPatterns = [/^src\/platform\/web\//];

const browserApiPatterns = [
  { category: 'Browser globals', label: 'window', pattern: /\bwindow\b/g },
  { category: 'Browser globals', label: 'document', pattern: /\bdocument\b/g },
  { category: 'Browser globals', label: 'navigator', pattern: /\bnavigator\b/g },
  { category: 'DOM element types', label: 'HTMLElement', pattern: /\bHTMLElement\b/g },
  { category: 'DOM element types', label: 'HTMLInputElement', pattern: /\bHTMLInputElement\b/g },
  { category: 'DOM element types', label: 'HTMLButtonElement', pattern: /\bHTMLButtonElement\b/g },
  { category: 'Viewport and media', label: 'visualViewport', pattern: /\bvisualViewport\b/g },
  { category: 'Viewport and media', label: 'matchMedia', pattern: /\bmatchMedia\b/g },
  { category: 'Viewport and media', label: 'ResizeObserver', pattern: /\bResizeObserver\b/g },
  { category: 'Viewport and media', label: 'IntersectionObserver', pattern: /\bIntersectionObserver\b/g },
  { category: 'Storage', label: 'localStorage', pattern: /\blocalStorage\b/g },
  { category: 'Storage', label: 'indexedDB', pattern: /\bindexedDB\b/g },
  { category: 'Files and blobs', label: 'File', pattern: /\bnew\s+File\b/g },
  { category: 'Files and blobs', label: 'FileReader', pattern: /\bFileReader\b/g },
  { category: 'Files and blobs', label: 'Blob', pattern: /\bBlob\b/g },
  { category: 'Files and blobs', label: 'URL.createObjectURL', pattern: /URL\.createObjectURL/g },
  { category: 'Files and blobs', label: 'URL.revokeObjectURL', pattern: /URL\.revokeObjectURL/g },
  {
    category: 'File input/download',
    label: 'file input element',
    pattern: /createElement\(['"]input['"]\)|\.type\s*=\s*['"]file['"]/g,
    scope: 'raw',
  },
  {
    category: 'File input/download',
    label: 'download anchor',
    pattern: /createElement\(['"]a['"]\)|\.download\s*=/g,
    scope: 'raw',
  },
  { category: 'Canvas', label: 'canvas', pattern: /\bcanvas\b/g },
  { category: 'Layout measurement', label: 'getBoundingClientRect', pattern: /\bgetBoundingClientRect\b/g },
  { category: 'Layout measurement', label: 'DOMRect', pattern: /\bDOMRect\b/g },
  { category: 'Styles', label: 'CSSStyleDeclaration', pattern: /\bCSSStyleDeclaration\b/g },
  { category: 'Styles', label: 'CSS.escape', pattern: /\bCSS\./g },
  {
    category: 'Browser event listeners',
    label: 'addEventListener',
    pattern: /\b(?:browserWindow|document|input|mediaQuery|viewport|visualViewport|window)\.addEventListener\s*\(/g,
  },
  {
    category: 'Browser event listeners',
    label: 'removeEventListener',
    pattern: /\b(?:browserWindow|document|input|mediaQuery|viewport|visualViewport|window)\.removeEventListener\s*\(/g,
  },
  { category: 'Pointer capture', label: 'setPointerCapture', pattern: /\.\s*setPointerCapture\b/g },
  { category: 'Pointer capture', label: 'releasePointerCapture', pattern: /\.\s*releasePointerCapture\b/g },
  { category: 'Pointer capture', label: 'hasPointerCapture', pattern: /\.\s*hasPointerCapture\b/g },
];

function getExtension(filePath) {
  const lastDot = filePath.lastIndexOf('.');
  return lastDot === -1 ? '' : filePath.slice(lastDot);
}

function walkSourceFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const files = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walkSourceFiles(fullPath));
      continue;
    }

    if (stats.isFile() && sourceExtensions.has(getExtension(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
}

function isAllowedPath(relativePath) {
  return allowedPathPatterns.some((pattern) => pattern.test(relativePath));
}

function stripStringLiterals(source) {
  return source.replace(/(['"`])(?:\\[\s\S]|(?!\1)[\s\S])*\1/g, (match) => ' '.repeat(match.length));
}

function getLineNumber(source, index) {
  let line = 1;

  for (let position = 0; position < index; position += 1) {
    if (source.charCodeAt(position) === 10) {
      line += 1;
    }
  }

  return line;
}

const approvedMatches = [];
const unapprovedMatches = [];
const categoryCounts = new Map();

for (const filePath of walkSourceFiles(sourceDir)) {
  const source = readFileSync(filePath, 'utf8');
  const sourceWithoutStrings = stripStringLiterals(source);
  const relativePath = relative(rootDir, filePath);

  for (const apiPattern of browserApiPatterns) {
    const searchableSource = apiPattern.scope === 'raw' ? source : sourceWithoutStrings;
    apiPattern.pattern.lastIndex = 0;

    for (const match of searchableSource.matchAll(apiPattern.pattern)) {
      const entry = {
        category: apiPattern.category,
        label: apiPattern.label,
        line: getLineNumber(source, match.index ?? 0),
        path: relativePath,
      };

      categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);

      if (isAllowedPath(relativePath)) {
        approvedMatches.push(entry);
      } else {
        unapprovedMatches.push(entry);
      }
    }
  }
}

console.log('Browser API audit report:');

if (categoryCounts.size === 0) {
  console.log('- No browser APIs from the audit list were found.');
} else {
  for (const [category, count] of Array.from(categoryCounts.entries()).sort()) {
    console.log(`- ${category}: ${count}`);
  }
}

console.log(`Approved web-boundary matches: ${approvedMatches.length}`);

if (unapprovedMatches.length > 0) {
  console.error(
    `Browser API audit failed. Move these usages behind src/platform/web or add a documented allowlist exception:\n${unapprovedMatches
      .map((entry) => `- ${entry.path}:${entry.line} ${entry.label} (${entry.category})`)
      .join('\n')}`,
  );
  process.exit(1);
}

console.log('Browser API audit passed. Browser-specific APIs are confined to approved web platform files.');
