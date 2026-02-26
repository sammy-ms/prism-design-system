/**
 * build-icon-mapping.mjs
 *
 * Generates icon-data.ts by combining:
 * 1. Tabler Icons for standard icons (with correct path data from the npm package)
 * 2. Figma-exported SVG files for non-Tabler icons (flags, logos)
 *
 * The Figma exports are modified versions of Tabler Icons with stroke-width="1.75"
 * instead of "2", and use expanded absolute path coordinates. Since the file numbering
 * doesn't correspond to the icon order, we use the authoritative Tabler source for
 * path data accuracy, and Figma files only for custom (non-Tabler) icons.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUTLINE = join('node_modules', '@tabler', 'icons', 'icons', 'outline');
const FILLED_DIR = join('node_modules', '@tabler', 'icons', 'icons', 'filled');
const ICONS_ROOT = join('..', 'icons');

// ── Figma order (from figma-icon-order.txt) ──
const ORDER = readFileSync('figma-icon-order.txt', 'utf-8')
  .trim()
  .split('\n')
  .map((s) => s.trim());

// ── Mapping: figmaName -> { tabler, filled?, displayName? } ──
const MAP = {
  'circle-check-solid': { tabler: 'circle-check', filled: true },
  'gear-play-automation': { tabler: 'settings-automation' },
  spinner: { tabler: 'loader' },
  'device-user': { tabler: 'user-scan' },
  'circle-cross': { tabler: 'circle-x' },
  'exclamation-circle': { tabler: 'alert-circle' },
  'at-sign': { tabler: 'at' },
  'book-open': { tabler: 'book' },
  boxes: { tabler: 'packages' },
  'chevrons-up-down': { tabler: 'selector' },
  'circle-code': { tabler: 'code-circle' },
  'dark-mode': { tabler: 'moon' },
  'dots-horizontal': { tabler: 'dots' },
  'file-bar-chart': { tabler: 'file-analytics' },
  'file-box': { tabler: 'file-stack' },
  'file-pdf': { tabler: 'file-type-pdf' },
  github: { tabler: 'brand-github' },
  grid: { tabler: 'layout-grid' },
  happy: { tabler: 'mood-happy' },
  hold: { tabler: 'hand-stop' },
  image: { tabler: 'photo' },
  'image-plus': { tabler: 'photo-plus' },
  info: { tabler: 'info-circle' },
  'knowledge-base': { tabler: 'library' },
  'light-mode': { tabler: 'sun' },
  like: { tabler: 'thumb-up' },
  'list-number': { tabler: 'list-numbers' },
  'login-customer': { tabler: 'login' },
  'mark-issue': { tabler: 'flag-exclamation' },
  'mark-suspicous': { tabler: 'alert-octagon' },
  'not-ship': { tabler: 'ship-off' },
  refund: { tabler: 'receipt-refund' },
  sad: { tabler: 'mood-sad' },
  'sidebar-left-expand': { tabler: 'layout-sidebar-left-expand' },
  'sidebar-right-expand': { tabler: 'layout-sidebar-right-expand' },
  smile: { tabler: 'mood-smile' },
  cry: { tabler: 'mood-cry' },
  unlike: { tabler: 'thumb-down' },
  unverified: { tabler: 'shield-off' },
  'triangle-alert': { tabler: 'alert-triangle' },
  warning: { tabler: 'alert-triangle' },
  asterik: { tabler: 'asterisk' },
  'device-dollar': { tabler: 'device-mobile-dollar' },
  stack: { tabler: 'stack-2' },
  'star-filled': { tabler: 'star', filled: true },
  'globe - languages': { tabler: 'language' },
  enlarge: { tabler: 'arrows-maximize' },
  notification: { tabler: 'bell' },
  'blacklist-user': { tabler: 'user-x' },
  reset: { tabler: 'refresh' },
  remove: { tabler: 'square-x' },
  save: { tabler: 'device-floppy' },
  email: { tabler: 'mail' },
  drag: { tabler: 'grip-vertical' },
  'multi-column': { tabler: 'columns' },
  'arrow-drag': { tabler: 'arrows-move' },
  'horizontal-drag': { tabler: 'grip-horizontal' },
  'drag-and-place': { tabler: 'drag-drop' },
  product: { tabler: 'box' },
  shipment: { tabler: 'package' },
  'credit-card': { tabler: 'credit-card' },
  archive: { tabler: 'archive' },
  'sort-ascending': { tabler: 'sort-ascending' },
  'sort-descending': { tabler: 'sort-descending' },
  exclamation: { tabler: 'exclamation-mark' },
  'calendar-time': { tabler: 'calendar-time' },
  'calendar-today': { tabler: 'calendar-event' },
  'shield-check': { tabler: 'shield-check' },
  package: { tabler: 'package' },
  'package-network': { tabler: 'topology-star-ring-3' },
  supplier: { tabler: 'building-warehouse' },
  call: { tabler: 'phone-call' },
  warehouse: { tabler: 'building-warehouse' },
  'circle-check': { tabler: 'circle-check' },
  'user-round-key': { tabler: 'user-shield' },
  globe: { tabler: 'world' },
  speed: { tabler: 'gauge' },
  report: { tabler: 'report' },
  change: { tabler: 'transfer' },
  'column-group': { tabler: 'columns-3' },
  unpin: { tabler: 'pinned-off' },
  sort: { tabler: 'arrows-sort' },
  'arrow-left-up': { tabler: 'arrow-up-left' },
  'log-out': { tabler: 'logout' },
  'system-mode': { tabler: 'device-desktop' },
  barcode: { tabler: 'barcode' },
  flag: { tabler: 'flag' },
  layout: { tabler: 'layout' },
  'list-text': { tabler: 'list-details' },
  'place-marker': { tabler: 'map-pin' },
  help: { tabler: 'help' },
  'user-solid': { tabler: 'user', filled: true },
  user: { tabler: 'user' },
  message: { tabler: 'message' },
  phone: { tabler: 'phone' },
  csv: { tabler: 'file-spreadsheet' },
  excel: { tabler: 'file-type-xls' },
  delay: { tabler: 'clock-pause' },
  'cloud-arrow': { tabler: 'cloud-upload' },
  translate: { tabler: 'language-hiragana' },
  'cursor-solid': { tabler: 'pointer', filled: true },
  envelope: { tabler: 'mail' },
  'text-box': { tabler: 'text-resize' },
  dropdown: { tabler: 'select' },
  sigma: { tabler: 'math-symbols' },
  mean: { tabler: 'math-avg' },
  hashtag: { tabler: 'hash' },
  'count-empty': { tabler: 'number' },
  range: { tabler: 'arrows-left-right' },
  permission: { tabler: 'lock' },
  procurement: { tabler: 'shopping-cart' },
  buyback: { tabler: 'receipt-refund' },
  'graduation-cap': { tabler: 'school' },
  'folder-setting': { tabler: 'folder-cog' },
  'light-bulb': { tabler: 'bulb' },
  'setting-tool': { tabler: 'tool' },
  plane: { tabler: 'plane' },
  'price-tag': { tabler: 'tag' },
  'map-pin': { tabler: 'map-pin' },
  tag: { tabler: 'tag' },
  box: { tabler: 'box' },
  'lithium-battery': { tabler: 'battery-charging' },
  'chevron-solid-down': { tabler: 'caret-down', filled: true },
  'chevron-solid-up': { tabler: 'caret-up', filled: true },
  'chevron-solid-left': { tabler: 'caret-left', filled: true },
  'chevron-solid-right': { tabler: 'caret-right', filled: true },
  'filter-dot': { tabler: 'filter-star' },
  country: { tabler: 'world' },
  state: { tabler: 'map-2' },
};

// Non-Tabler icons (flags, logos) — use Figma files directly
const NON_TABLER = new Set([
  'logo-fedex',
  'logo-amazon',
  'logo-ups',
  'logo-mobilesentrix',
  'usps',
  'flag-united states',
  'flag-united kingdom',
  'flag-afghanistan',
  'flag-albania',
  'flag-algeria',
  'flag-canada',
  'flag-china',
  'flag-france',
  'flag-germany',
  'flag-japan',
  'flag-italy',
  'flag-portugal',
  'flag-russia',
  'flag-sout-korea',
  'flag-finland',
]);

// ── Known file mappings for non-Tabler icons ──
// Maps icon names to specific SVG files (identified by visual inspection)
const FIGMA_FILE_MAP = {
  // Logos
  'logo-fedex': 'Frame.svg',
  'logo-amazon': 'Logo (1) 1.svg',
  'logo-ups': 'Logo 2.svg',
  'logo-mobilesentrix': 'Size=Large.svg',
  usps: 'idpeg29Gmw_1766561828257 1.svg',
  // Flags (Large 24px files identified by color patterns)
  'flag-united states': 'Flags.svg',
  'flag-afghanistan': 'Size=Large (24px)-95.svg',
  'flag-albania': 'Size=Large (24px)-138.svg',
  'flag-algeria': 'Size=Large (24px)-57.svg',
  'flag-canada': 'Size=Large (24px)-35.svg',
  'flag-china': 'Size=Large (24px)-48.svg',
  'flag-france': 'Size=Large (24px)-34.svg',
  'flag-germany': 'Size=Large (24px)-109.svg',
  'flag-italy': 'Size=Large (24px)-60.svg',
  'flag-japan': 'Size=Large (24px)-42.svg',
  'flag-portugal': 'Size=Large (24px)-13.svg',
  'flag-russia': 'Size=Large (24px)-12.svg',
  'flag-sout-korea': 'Size=Large (24px)-64.svg',
  'flag-finland': 'Size=Large (24px)-2.svg',
  // flag-united kingdom: no 24px export available
};

// ── Helpers ──
function toDisplayName(name) {
  return name
    .split(/[-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractSvgInner(svgContent) {
  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!innerMatch) return '';
  return innerMatch[1].trim();
}

/** Extract clean inner content from a Tabler SVG.
 *  @param {string} svgContent - raw SVG file text
 *  @param {boolean} isFilled  - true when reading from the filled/ directory
 */
function extractTablerInner(svgContent, isFilled = false) {
  const paths = [];
  let m;

  // For filled icons the <svg> element carries fill="currentColor" and
  // individual <path> elements inherit it (no explicit fill attribute).
  // We detect this so we can add fill="currentColor" to every visible path.
  const svgHasFill = /^<svg[^>]+fill="currentColor"/.test(svgContent) || isFilled;

  // Extract <path> elements (skip background rect)
  const pathRe = /<path\s+[^>]*?d="([^"]+)"[^>]*?\/?>/g;
  while ((m = pathRe.exec(svgContent)) !== null) {
    if (m[1] === 'M0 0h24v24H0z') continue;
    const fillMatch = m[0].match(/fill="([^"]+)"/);
    const hasFill = fillMatch && fillMatch[1] !== 'none';
    if (hasFill) {
      paths.push(`<path d="${m[1]}" fill="currentColor" />`);
    } else if (svgHasFill) {
      // Filled icon: path inherits fill from SVG element — make it explicit
      paths.push(`<path d="${m[1]}" fill="currentColor" />`);
    } else {
      paths.push(`<path d="${m[1]}" />`);
    }
  }

  // Extract <circle> elements
  const circRe = /<circle\s+([^>]*?)\/?>/g;
  while ((m = circRe.exec(svgContent)) !== null) {
    const cx = m[1].match(/cx="([^"]+)"/)?.[1];
    const cy = m[1].match(/cy="([^"]+)"/)?.[1];
    const r = m[1].match(/\br="([^"]+)"/)?.[1];
    if (cx && cy && r) paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" />`);
  }

  // Extract <line> elements
  const lineRe = /<line\s+([^>]*?)\/?>/g;
  while ((m = lineRe.exec(svgContent)) !== null) {
    const a = m[1];
    const x1 = a.match(/x1="([^"]+)"/)?.[1],
      y1 = a.match(/y1="([^"]+)"/)?.[1];
    const x2 = a.match(/x2="([^"]+)"/)?.[1],
      y2 = a.match(/y2="([^"]+)"/)?.[1];
    if (x1 && y1 && x2 && y2) paths.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`);
  }

  // Extract <rect> (non-background)
  const rectRe = /<rect\s+([^>]*?)\/?>/g;
  while ((m = rectRe.exec(svgContent)) !== null) {
    const a = m[1];
    const x = a.match(/\bx="([^"]+)"/)?.[1] || '0';
    const y = a.match(/\by="([^"]+)"/)?.[1] || '0';
    const w = a.match(/width="([^"]+)"/)?.[1];
    const h = a.match(/height="([^"]+)"/)?.[1];
    const rx = a.match(/rx="([^"]+)"/)?.[1];
    if (w && h) {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}"`;
      if (rx) s += ` rx="${rx}"`;
      s += ' />';
      paths.push(s);
    }
  }

  // Extract <polyline> elements
  const polyRe = /<polyline\s+([^>]*?)\/?>/g;
  while ((m = polyRe.exec(svgContent)) !== null) {
    const ptsMatch = m[1].match(/points="([^"]+)"/);
    if (ptsMatch) paths.push(`<polyline points="${ptsMatch[1]}" />`);
  }

  return paths.join('') || null;
}

/** Read a Figma SVG file and normalize its inner content */
function readFigmaFile(filename) {
  // Try both directories
  const searchDirs = [ICONS_ROOT, join(ICONS_ROOT, 'Icon')];
  for (const dir of searchDirs) {
    const filePath = join(dir, filename);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      let inner = extractSvgInner(content);
      // Normalize colors
      inner = inner.replace(/stroke="#1B1F22"/g, 'stroke="currentColor"');
      inner = inner.replace(/fill="#1B1F22"/g, 'fill="currentColor"');
      const viewBox = content.match(/viewBox="([^"]+)"/)?.[1] || '0 0 24 24';
      return { inner, viewBox, filename };
    }
  }
  return null;
}

// ── Build icon data ──
const results = [];
const errors = [];
const seen = new Set();

const stats = {
  tabler: 0,
  figma: 0,
  placeholders: 0,
};

for (const rawName of ORDER) {
  const lowerName = rawName.toLowerCase();

  // Skip duplicates
  if (seen.has(lowerName)) continue;
  seen.add(lowerName);

  const displayName = MAP[lowerName]?.displayName || toDisplayName(rawName);

  // Determine category
  let category = 'stroke';
  if (lowerName.startsWith('flag-') || lowerName === 'country' || lowerName === 'state') {
    category = 'flag';
  } else if (lowerName.startsWith('logo-') || lowerName === 'usps') {
    category = 'logo';
  } else {
    const mapping = MAP[lowerName];
    if (mapping?.filled) {
      category = 'filled';
    }
  }

  // ── Non-Tabler icons: use Figma files directly ──
  if (NON_TABLER.has(lowerName)) {
    const figmaFilename = FIGMA_FILE_MAP[lowerName];
    if (figmaFilename) {
      const figmaData = readFigmaFile(figmaFilename);
      if (figmaData) {
        results.push({
          name: lowerName,
          displayName,
          svgContent: figmaData.inner,
          viewBox: figmaData.viewBox,
          strokeWidth: '1.75',
          iconType: 'image',
          category,
        });
        stats.figma++;
        continue;
      }
    }

    // No Figma file found - placeholder
    results.push({
      name: lowerName,
      displayName,
      svgContent: '<circle cx="12" cy="12" r="8" />',
      viewBox: '0 0 24 24',
      strokeWidth: '2',
      iconType: 'placeholder',
      category,
    });
    errors.push(`PLACEHOLDER (non-tabler, no file): ${lowerName}`);
    stats.placeholders++;
    continue;
  }

  // ── Tabler icons: use Tabler SVG content ──
  const mapping = MAP[lowerName];
  const tablerName = mapping?.tabler || lowerName;
  const isFilled = mapping?.filled || false;
  const dir = isFilled ? FILLED_DIR : OUTLINE;
  const filePath = join(dir, `${tablerName}.svg`);

  if (!existsSync(filePath)) {
    errors.push(`MISS: ${rawName} -> ${tablerName} (${filePath})`);
    results.push({
      name: lowerName,
      displayName,
      svgContent: '<circle cx="12" cy="12" r="8" />',
      viewBox: '0 0 24 24',
      strokeWidth: '2',
      iconType: 'placeholder',
      category,
    });
    stats.placeholders++;
    continue;
  }

  const svg = readFileSync(filePath, 'utf-8');
  let svgContent = extractTablerInner(svg, isFilled);

  if (!svgContent) {
    errors.push(`EMPTY: ${rawName} -> ${tablerName}`);
    continue;
  }

  // Special handling for star-filled: use orange fill
  if (lowerName === 'star-filled') {
    svgContent = svgContent.replace(/fill="currentColor"/g, 'fill="#FF9811"');
  }

  results.push({
    name: lowerName,
    displayName,
    svgContent,
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    iconType: isFilled ? 'filled' : 'stroke',
    category,
  });
  stats.tabler++;
}

// ── Print statistics ──
console.log(`\n=== Build Statistics ===`);
console.log(`Total icons:           ${results.length}`);
console.log(`From Tabler:           ${stats.tabler}`);
console.log(`From Figma (non-Tabler): ${stats.figma}`);
console.log(`Placeholders:          ${stats.placeholders}`);

if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach((e) => console.log('  ' + e));
}

// Count by category
const catCounts = {};
for (const r of results) {
  catCounts[r.category] = (catCounts[r.category] || 0) + 1;
}
console.log('\nBy category:', catCounts);

// Count by icon type
const typeCounts = {};
for (const r of results) {
  typeCounts[r.iconType] = (typeCounts[r.iconType] || 0) + 1;
}
console.log('By icon type:', typeCounts);

// ── Write TypeScript ──
function escapeTs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

let ts = `// =============================================================================
// Prism Design System - Icon Data
// Auto-generated from Tabler Icons + Figma-exported SVGs for flags/logos
// ${results.length} icons in Figma visual order
// Generated: ${new Date().toISOString().split('T')[0]}
// =============================================================================

export type IconType = 'stroke' | 'filled' | 'image' | 'placeholder';
export type IconCategory = 'stroke' | 'filled' | 'flag' | 'logo';

export interface IconEntry {
  name: string;
  displayName: string;
  svgContent: string;
  viewBox: string;
  strokeWidth: string;
  iconType: IconType;
  category: IconCategory;
}

export const ICONS: IconEntry[] = [\n`;

for (const icon of results) {
  ts += `  {\n`;
  ts += `    name: '${escapeTs(icon.name)}',\n`;
  ts += `    displayName: '${escapeTs(icon.displayName)}',\n`;
  ts += `    svgContent: '${escapeTs(icon.svgContent)}',\n`;
  ts += `    viewBox: '${escapeTs(icon.viewBox)}',\n`;
  ts += `    strokeWidth: '${escapeTs(icon.strokeWidth)}',\n`;
  ts += `    iconType: '${icon.iconType}',\n`;
  ts += `    category: '${icon.category}',\n`;
  ts += `  },\n`;
}

ts += `];\n`;

const OUTPUT = join('src', 'app', 'pages', 'icons', 'icon-data.ts');
writeFileSync(OUTPUT, ts, 'utf-8');
console.log(`\nWritten: ${OUTPUT} (${results.length} icons)`);
