import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

const LAYER_ORDER = {
  app: 5,
  pages: 4,
  widgets: 3,
  features: 2,
  entities: 1,
  shared: 0,
};

const SLICE_LAYERS = new Set(['pages', 'widgets', 'features', 'entities']);

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.some((ext) => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function parseFsdPath(filePath) {
  const rel = path.relative(srcDir, filePath).replace(/\\/g, '/');
  const parts = rel.split('/');
  const layer = parts[0];
  const slice = SLICE_LAYERS.has(layer) ? parts[1] : null;
  return { rel, layer, slice };
}

function resolveImportTarget(sourceFile, importSpecifier) {
  if (importSpecifier.startsWith('@/')) {
    const withoutPrefix = importSpecifier.slice(2);
    const parts = withoutPrefix.split('/');
    const layer = parts[0];
    const slice = SLICE_LAYERS.has(layer) ? parts[1] : null;
    return {
      isFsd: true,
      layer,
      slice,
      rawPath: withoutPrefix,
      isDeep: SLICE_LAYERS.has(layer) && parts.length > 2,
    };
  }

  if (importSpecifier.startsWith('.')) {
    const absTarget = path.resolve(path.dirname(sourceFile), importSpecifier);
    const relToSrc = path.relative(srcDir, absTarget).replace(/\\/g, '/');
    if (relToSrc.startsWith('..')) {
      return { isFsd: false };
    }
    const parts = relToSrc.split('/');
    const layer = parts[0];
    const slice = SLICE_LAYERS.has(layer) ? parts[1] : null;
    return {
      isFsd: true,
      layer,
      slice,
      rawPath: relToSrc,
      isDeep: false, // Relative internal imports within slice are allowed
    };
  }

  return { isFsd: false };
}

function extractImports(code) {
  const importRegex = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
  const matches = [];
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function validateFsdBoundaries() {
  const files = getAllFiles(srcDir);
  const violations = [];

  for (const file of files) {
    const source = parseFsdPath(file);
    if (!(source.layer in LAYER_ORDER)) continue;

    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(content);

    for (const imp of imports) {
      const target = resolveImportTarget(file, imp);
      if (!target.isFsd || !(target.layer in LAYER_ORDER)) continue;

      // Rule 1: No deep imports into slices from external modules
      const isExternalToTargetSlice =
        source.layer !== target.layer || (source.slice && target.slice && source.slice !== target.slice);

      if (target.isDeep && isExternalToTargetSlice) {
        violations.push({
          file: source.rel,
          import: imp,
          rule: 'Public API Violation',
          message: `Deep import into slice "${target.layer}/${target.slice}" is forbidden. Import only through Public API (@/${target.layer}/${target.slice}).`,
        });
      }

      // Rule 2: Cross-slice isolation (Slices on the same layer CANNOT import each other)
      if (
        source.layer === target.layer &&
        SLICE_LAYERS.has(source.layer) &&
        source.slice &&
        target.slice &&
        source.slice !== target.slice
      ) {
        violations.push({
          file: source.rel,
          import: imp,
          rule: 'Cross-Slice Import Violation',
          message: `Slice "${source.layer}/${source.slice}" cannot import from sibling slice "${target.layer}/${target.slice}". Compose slices at the next higher layer.`,
        });
      }

      // Rule 3: Hierarchy violation (Lower layer cannot import from higher layer)
      const sourceLevel = LAYER_ORDER[source.layer];
      const targetLevel = LAYER_ORDER[target.layer];
      if (sourceLevel < targetLevel) {
        violations.push({
          file: source.rel,
          import: imp,
          rule: 'Layer Hierarchy Violation',
          message: `Layer "${source.layer}" (level ${sourceLevel}) cannot import from higher layer "${target.layer}" (level ${targetLevel}).`,
        });
      }
    }
  }

  return violations;
}

const errors = validateFsdBoundaries();

if (errors.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', ` FSD Architectural Violations Found (${errors.length}):\n`);
  for (const err of errors) {
    console.error(`  - [\x1b[33m${err.rule}\x1b[0m] in \x1b[36m${err.file}\x1b[0m`);
    console.error(`    Import: "${err.import}"`);
    console.error(`    Reason: ${err.message}\n`);
  }
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✔ FSD Boundaries Check Passed: 0 cross-imports or hierarchy violations.');
  process.exit(0);
}
