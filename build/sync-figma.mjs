// Prints a Figma plugin script that brings a file's variables and text styles in line
// with dist/figma/variables.json. An agent runs the output with Figma's use_figma tool.
//   node build/sync-figma.mjs          apply
//   node build/sync-figma.mjs --dry    report what would change, change nothing
// Variables are matched by their WEB code syntax (the CSS name), text styles by the
// Webflow class in their description, so renames keep every existing binding.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'dist/figma/variables.json'), 'utf8'));
const dry = process.argv.includes('--dry');

const SCOPES = { COLOR: ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR'], FLOAT: ['GAP', 'WIDTH_HEIGHT', 'CORNER_RADIUS'], STRING: ['FONT_FAMILY'] };

const plugin = async (data, dry, SCOPES) => {
  const changes = [];
  const note = (s) => changes.push(s);
  const hex = (h) => {
    const n = h.replace('#', '');
    const c = (i) => parseInt(n.slice(i, i + 2), 16) / 255;
    return { r: c(0), g: c(2), b: c(4), a: n.length === 8 ? c(6) : 1 };
  };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const roundColor = (c) => c && typeof c === 'object' && 'r' in c ? Object.fromEntries(Object.entries(c).map(([k, x]) => [k, Math.round(x * 255)])) : c;

  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const byWeb = new Map(vars.filter((v) => v.codeSyntax?.WEB).map((v) => [v.codeSyntax.WEB, v]));
  const byName = new Map(); // new name -> variable (filled as we go)

  // Pass 1: collections, modes, variables (names, code syntax, descriptions)
  const plan = [];
  for (const c of data.collections) {
    let col = cols.find((x) => x.name === c.name);
    if (!col) {
      note(`create collection ${c.name}`);
      if (dry) { plan.push({ c, col: null }); continue; }
      col = figma.variables.createVariableCollection(c.name);
    }
    const modeIds = c.modes.map((m, i) => {
      let mode = col.modes.find((x) => x.name === m) ?? (i === 0 ? col.modes[0] : null);
      if (mode && mode.name !== m) { note(`rename mode ${col.name}/${mode.name} → ${m}`); if (!dry) col.renameMode(mode.modeId, m); }
      if (!mode) { note(`add mode ${col.name}/${m}`); return dry ? null : col.addMode(m); }
      return mode.modeId;
    });
    for (const v of c.variables) {
      let fv = byWeb.get(v.codeSyntax.WEB);
      if (!fv) {
        note(`create variable ${v.name}`);
        if (!dry) {
          fv = figma.variables.createVariable(v.name, col, v.type);
          fv.scopes = SCOPES[v.type];
          fv.setVariableCodeSyntax('WEB', v.codeSyntax.WEB);
        }
      } else if (fv.name !== v.name) {
        note(`rename ${fv.name} → ${v.name}`);
        if (!dry) fv.name = v.name;
      }
      if (fv && (fv.description || '') !== (v.description || '')) {
        note(`description ${v.name}`);
        if (!dry) fv.description = v.description || '';
      }
      byName.set(v.name, fv);
      plan.push({ v, fv, modeIds });
    }
  }

  // Pass 2: values (after every variable exists, so aliases resolve)
  for (const { v, fv, modeIds } of plan) {
    if (!v) continue;
    v && Object.values(v.valuesByMode).forEach((val, i) => {
      const modeId = modeIds[i];
      let want;
      if (val && typeof val === 'object' && 'alias' in val) {
        const target = byName.get(val.alias);
        want = target ? { type: 'VARIABLE_ALIAS', id: target.id } : { missing: val.alias };
      } else want = v.type === 'COLOR' ? hex(val) : val;
      const have = fv && modeId ? fv.valuesByMode[modeId] : undefined;
      const cmp = (x) => (x && x.type === 'VARIABLE_ALIAS' ? { alias: x.id } : roundColor(x));
      if (!same(cmp(have), cmp(want))) {
        note(`value ${v.name} [${Object.keys(v.valuesByMode)[i]}]`);
        if (!dry && !want.missing) fv.setValueForMode(modeId, want);
      }
    });
  }

  // Text styles
  const styles = await figma.getLocalTextStylesAsync();
  for (const s of data.textStyles) {
    const cls = s.description.split(' ')[1];
    let st = styles.find((x) => x.description.startsWith(`Webflow: ${cls}`) || x.name === s.name);
    if (!st) { note(`create text style ${s.name}`); if (dry) continue; st = figma.createTextStyle(); }
    const font = { family: s.fontFamily, style: s.fontStyle };
    const props = { name: s.name, description: s.description, fontName: font, fontSize: s.fontSize,
      lineHeight: s.lineHeight, letterSpacing: s.letterSpacing };
    for (const [k, want] of Object.entries(props)) {
      let have = st[k];
      if (k === 'lineHeight' || k === 'letterSpacing') have = { unit: have.unit, value: Math.round(have.value * 100) / 100 };
      if (k === 'fontName') have = { family: have.family, style: have.style };
      if (!same(have, want)) {
        note(`text style ${s.name}: ${k}`);
        if (!dry) {
          if (k === 'fontName') await figma.loadFontAsync(want);
          else await figma.loadFontAsync(st.fontName);
          st[k] = want;
        }
      }
    }
  }
  return { dry, changed: changes.length, changes };
};

// use_figma runs top-level code with await and return, so emit the function body directly.
const src = plugin.toString();
const body = src.slice(src.indexOf('{') + 1, src.lastIndexOf('}'));
console.log(`const data = ${JSON.stringify(data)};\nconst dry = ${dry};\nconst SCOPES = ${JSON.stringify(SCOPES)};\n${body}`);
