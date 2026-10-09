// Builds dist/ from tokens/. No dependencies.
//   node build/build.mjs          write dist/
//   node build/build.mjs --check  fail if dist/ is out of date
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEME = 'aether-creative-studio';
const COLLECTIONS = { base: 'Base', spacing: 'Spacing', status: 'Status' };
const WEBFLOW_TYPE = { color: 'Color', dimension: 'Size', fontFamily: 'FontFamily' };
const FIGMA_TYPE = { color: 'COLOR', dimension: 'FLOAT', fontFamily: 'STRING' };
const WEIGHT_STYLE = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };

// ---------- read ----------
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith('.json') ? [join(dir, e.name)] : []);

function flatten(tree, set, out = new Map(), path = []) {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;
    const p = [...path, key];
    if (node && typeof node === 'object' && '$value' in node) {
      const id = p.join('.');
      if (out.has(id)) throw new Error(`Duplicate token ${id}`);
      out.set(id, { id, path: p, set, type: node.$type, value: node.$value, description: node.$description });
    } else flatten(node, set, out, p);
  }
  return out;
}

const tokenDir = join(root, 'tokens');
const sets = {}; // set name -> raw tree, in load order
for (const f of files(tokenDir).sort()) {
  const rel = relative(tokenDir, f).replace(/\\/g, '/').replace(/\.json$/, '');
  sets[rel] = JSON.parse(readFileSync(f, 'utf8'));
}
const baseSets = Object.keys(sets).filter((s) => !s.startsWith('themes/'));
const darkSet = `themes/${THEME}/dark`;

const base = new Map();
for (const s of baseSets) for (const [k, t] of flatten(sets[s], s)) {
  if (base.has(k)) throw new Error(`Duplicate token ${k}`);
  base.set(k, t);
}
const dark = flatten(sets[darkSet] ?? {}, darkSet);
for (const k of dark.keys()) if (!base.has(k)) throw new Error(`Dark override for unknown token ${k}`);

// ---------- helpers ----------
const refOf = (v) => (typeof v === 'string' && /^\{[^}]+\}$/.test(v) ? v.slice(1, -1) : null);
for (const map of [base, dark]) for (const t of map.values()) {
  const refs = typeof t.value === 'object' && !Array.isArray(t.value) && t.type === 'typography'
    ? Object.values(t.value).map(refOf) : [refOf(t.value)];
  for (const r of refs) if (r && !base.has(r)) throw new Error(`${t.id} references missing token ${r}`);
}

const cssName = ([coll, group, name]) =>
  coll === 'base' ? `--${group}--${name}` : `--_${coll}---${group}--${name}`;
const dim = (d) => `${d.value}${d.unit}`;
const px = (d) => (d.unit === 'rem' ? d.value * 16 : d.value);
const resolve = (id, mode) => {
  const t = (mode === 'dark' && dark.get(id)) || base.get(id);
  const r = refOf(t.value);
  return r ? resolve(r, mode) : t.value;
};
const valueFor = (id, mode) => ((mode === 'dark' && dark.get(id)) || base.get(id)).value;
const variables = [...base.values()].filter((t) => t.type in WEBFLOW_TYPE);
const typography = [...base.values()].filter((t) => t.type === 'typography');

// ---------- CSS ----------
function cssValue(t, v) {
  const r = refOf(v);
  if (r) return `var(${cssName(base.get(r).path)})`;
  if (t.type === 'dimension') return dim(v);
  if (t.type === 'fontFamily') return v.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
  return v;
}
const cssBlock = (sel, list, mode) =>
  `${sel} {\n${list.map((t) => `  ${cssName(t.path)}: ${cssValue(t, valueFor(t.id, mode))};`).join('\n')}\n}\n`;

const typeClass = (t) => `${t.path[1]}-${t.path[2]}`;
const variablesCss = cssBlock(':root', variables, 'base') + '\n' +
  // Aliases are re-declared so they re-resolve inside a dark element, not just at :root.
  cssBlock('[data-mode="dark"]', variables.filter((t) => dark.has(t.id) || refOf(t.value)), 'dark');
const typographyCss = typography.map((t) => {
  const v = t.value;
  return `.${typeClass(t)} {\n` +
    `  font-family: ${cssValue({ type: 'fontFamily' }, v.fontFamily)};\n` +
    `  font-size: ${dim(v.fontSize)};\n  font-weight: ${v.fontWeight};\n` +
    `  line-height: ${v.lineHeight};\n  letter-spacing: ${dim(v.letterSpacing)};\n}\n`;
}).join('\n');

// ---------- Webflow ----------
const wfValue = (t, v) => {
  const r = refOf(v);
  if (r) return { ref: cssName(base.get(r).path) };
  if (t.type === 'dimension') return { value: v.value, unit: v.unit };
  if (t.type === 'fontFamily') return v[0];
  return v;
};
const webflow = {
  collections: Object.entries(COLLECTIONS).map(([key, name]) => {
    const list = variables.filter((t) => t.path[0] === key);
    const hasDark = list.some((t) => dark.has(t.id));
    const modes = hasDark ? ['Base mode', 'Dark'] : ['Base mode'];
    return {
      name, modes,
      variables: list.map((t) => ({
        cssName: cssName(t.path), type: WEBFLOW_TYPE[t.type],
        values: Object.fromEntries(modes.map((m) => [m, wfValue(t, valueFor(t.id, m === 'Dark' ? 'dark' : 'base'))])),
      })),
    };
  }).filter((c) => c.variables.length),
  classes: typography.map((t) => ({
    name: typeClass(t),
    properties: {
      'font-family': resolve(refOf(t.value.fontFamily), 'base')[0],
      'font-size': dim(t.value.fontSize), 'font-weight': String(t.value.fontWeight),
      'line-height': String(t.value.lineHeight), 'letter-spacing': dim(t.value.letterSpacing),
    },
  })),
};

// ---------- Figma ----------
const figmaName = (p) => `${p[1]}/${p[2]}`;
const figValue = (t, v) => {
  const r = refOf(v);
  if (r) return { alias: figmaName(base.get(r).path) };
  if (t.type === 'dimension') return px(v);
  if (t.type === 'fontFamily') return v[0];
  return v;
};
const figma = {
  collections: Object.entries(COLLECTIONS).map(([key, name]) => {
    const list = variables.filter((t) => t.path[0] === key);
    const hasDark = list.some((t) => dark.has(t.id));
    const modes = hasDark ? ['Base', 'Dark'] : ['Base'];
    return {
      name, modes,
      variables: list.map((t) => ({
        name: figmaName(t.path), type: FIGMA_TYPE[t.type],
        codeSyntax: { WEB: `var(${cssName(t.path)})` },
        valuesByMode: Object.fromEntries(modes.map((m) => [m, figValue(t, valueFor(t.id, m === 'Dark' ? 'dark' : 'base'))])),
        ...(t.description ? { description: t.description } : {}),
      })),
    };
  }).filter((c) => c.variables.length),
  textStyles: typography.map((t) => {
    const v = t.value;
    return {
      name: figmaName(t.path),
      description: `Webflow: .${typeClass(t)}${t.description ? ` — ${t.description}` : ''}`,
      fontFamily: resolve(refOf(v.fontFamily), 'base')[0],
      fontStyle: WEIGHT_STYLE[v.fontWeight],
      fontSize: px(v.fontSize),
      lineHeight: { unit: 'PERCENT', value: Math.round(v.lineHeight * 10000) / 100 },
      letterSpacing: { unit: 'PIXELS', value: px(v.letterSpacing) },
    };
  }),
};

// ---------- Penpot (Tokens Studio multi-set format: string values, px units) ----------
const PENPOT_TYPE = { fontFamily: 'fontFamilies' };
function penpotTree(tree) {
  if (tree && typeof tree === 'object' && '$value' in tree) {
    const v = tree.$value;
    const conv = (x) => (x && typeof x === 'object' && 'unit' in x ? `${px(x)}px`
      : typeof x === 'number' ? String(x) : x);
    const value = tree.$type === 'typography'
      ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, conv(x)]))
      : tree.$type === 'fontFamily' ? v[0] : conv(v);
    return { ...tree, $type: PENPOT_TYPE[tree.$type] ?? tree.$type, $value: value };
  }
  return Object.fromEntries(Object.entries(tree).map(([k, x]) => [k, k.startsWith('$') ? x : penpotTree(x)]));
}
const penpot = {
  ...Object.fromEntries(Object.entries(sets).map(([s, tree]) => [s, penpotTree(tree)])),
  $themes: [
    { name: 'Light', group: 'Aether Creative Studio', selectedTokenSets: Object.fromEntries(baseSets.map((s) => [s, 'enabled'])) },
    { name: 'Dark', group: 'Aether Creative Studio', selectedTokenSets: Object.fromEntries([...baseSets, darkSet].map((s) => [s, 'enabled'])) },
  ],
  $metadata: { tokenSetOrder: [...baseSets, darkSet], activeThemes: ['Aether Creative Studio/Light'] },
};

// ---------- write or check ----------
const header = '/* Generated from tokens/ by build/build.mjs. Do not edit. */\n';
const json = (o) => JSON.stringify(o, null, 2) + '\n';
const outputs = {
  'dist/css/variables.css': header + variablesCss,
  'dist/css/typography.css': header + typographyCss,
  'dist/webflow/variables.json': json(webflow),
  'dist/figma/variables.json': json(figma),
  'dist/penpot/tokens.json': json(penpot),
};

const check = process.argv.includes('--check');
const stale = [];
for (const [rel, content] of Object.entries(outputs)) {
  const p = join(root, rel);
  if (check) {
    if (!existsSync(p) || readFileSync(p, 'utf8') !== content) stale.push(rel);
  } else {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  }
}
if (stale.length) {
  console.error(`dist/ is out of date. Run: npm run build\n  ${stale.join('\n  ')}`);
  process.exit(1);
}
console.log(`${check ? 'Checked' : 'Built'} ${Object.keys(outputs).length} files from ${base.size} tokens (${dark.size} dark overrides).`);
