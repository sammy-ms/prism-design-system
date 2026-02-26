import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUTLINE = join('node_modules', '@tabler', 'icons', 'icons', 'outline');
const FILLED = join('node_modules', '@tabler', 'icons', 'icons', 'filled');

// ── Figma order (from figma-icon-order.txt) ────────────────────────────
const ORDER = readFileSync('figma-icon-order.txt', 'utf-8')
  .trim()
  .split('\n')
  .map((s) => s.trim());

// ── Mapping: figmaName → { tabler, filled?, displayName? } ───────────
// Only entries that differ from a direct name match need to be listed.
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
  // Filled chevrons → Tabler filled carets
  'chevron-solid-down': { tabler: 'caret-down', filled: true },
  'chevron-solid-up': { tabler: 'caret-up', filled: true },
  'chevron-solid-left': { tabler: 'caret-left', filled: true },
  'chevron-solid-right': { tabler: 'caret-right', filled: true },
  // filter-dot → filter outline (best match)
  'filter-dot': { tabler: 'filter-star' },
};

// Non-Tabler icons that need special handling (flags, logos)
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
  'country',
  'state',
]);

// ── Helpers ──────────────────────────────────────────────────────────
function toDisplayName(name) {
  return name
    .split(/[-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractSvgInner(svgContent) {
  const paths = [];
  // Extract <path> elements (skip background rect)
  const pathRe = /<path\s+[^>]*?d="([^"]+)"[^>]*?\/?>/g;
  let m;
  while ((m = pathRe.exec(svgContent)) !== null) {
    if (m[1] === 'M0 0h24v24H0z') continue;
    // Check if this path has fill attribute
    const fillMatch = m[0].match(/fill="([^"]+)"/);
    const hasFill = fillMatch && fillMatch[1] !== 'none';
    if (hasFill) {
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
  return paths.join('');
}

// ── Build icon data ──────────────────────────────────────────────────
const results = [];
const errors = [];
const seen = new Set();

for (const rawName of ORDER) {
  const lowerName = rawName.toLowerCase();

  // Skip duplicates (settings, reset, database appear twice)
  if (seen.has(lowerName)) continue;
  seen.add(lowerName);

  const displayName = MAP[lowerName]?.displayName || toDisplayName(rawName);

  // Non-Tabler icons: will be filled in from non-tabler-icons.json later
  if (NON_TABLER.has(lowerName)) {
    results.push({
      name: lowerName,
      displayName,
      svgContent: '', // placeholder
      viewBox: '0 0 24 24',
      strokeWidth: '2',
      iconType: 'image', // flags/logos are images
    });
    continue;
  }

  // Tabler icon lookup
  const mapping = MAP[lowerName];
  const tablerName = mapping?.tabler || lowerName;
  const isFilled = mapping?.filled || false;
  const dir = isFilled ? FILLED : OUTLINE;
  const filePath = join(dir, `${tablerName}.svg`);

  if (!existsSync(filePath)) {
    errors.push(`MISS: ${rawName} → ${tablerName} (${filePath})`);
    results.push({
      name: lowerName,
      displayName,
      svgContent: '<circle cx="12" cy="12" r="8" />',
      viewBox: '0 0 24 24',
      strokeWidth: '2',
      iconType: 'placeholder',
    });
    continue;
  }

  const svg = readFileSync(filePath, 'utf-8');
  const svgContent = extractSvgInner(svg);

  if (!svgContent) {
    errors.push(`EMPTY: ${rawName} → ${tablerName}`);
    continue;
  }

  results.push({
    name: lowerName,
    displayName,
    svgContent,
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    iconType: isFilled ? 'filled' : 'stroke',
  });
}

console.log(`Built ${results.length} icons, ${errors.length} errors`);
if (errors.length) errors.forEach((e) => console.log('  ' + e));

// ── Try loading non-tabler-icons.json if available ──────────────────
try {
  const nonTabler = JSON.parse(readFileSync('non-tabler-icons.json', 'utf-8'));
  let patched = 0;
  for (const ext of nonTabler.icons) {
    const idx = results.findIndex((r) => r.name === ext.name.toLowerCase());
    if (idx >= 0 && ext.svgContent) {
      results[idx].svgContent = ext.svgContent;
      results[idx].viewBox = ext.viewBox || '0 0 24 24';
      results[idx].iconType = ext.type || 'image';
      patched++;
    }
  }
  console.log(`Patched ${patched} non-Tabler icons from non-tabler-icons.json`);
} catch {
  console.log('non-tabler-icons.json not found yet — non-Tabler icons use placeholders');
}

// ── Write TypeScript ─────────────────────────────────────────────────
let ts = `// =============================================================================
// Prism Design System — Icon Data
// Auto-generated: ${results.length} icons in Figma visual order
// Tabler Icons v3.37.1 (stroke-width adjusted per Figma spec)
// =============================================================================

export type IconType = 'stroke' | 'filled' | 'image' | 'placeholder';

export interface IconEntry {
  name: string;
  displayName: string;
  svgContent: string;
  viewBox: string;
  strokeWidth: string;
  iconType: IconType;
}

export const ICONS: IconEntry[] = [\n`;

for (const icon of results) {
  ts += `  {\n`;
  ts += `    name: '${icon.name}',\n`;
  ts += `    displayName: '${icon.displayName.replace(/'/g, "\\'")}',\n`;
  ts += `    svgContent: '${icon.svgContent.replace(/'/g, "\\'")}',\n`;
  ts += `    viewBox: '${icon.viewBox}',\n`;
  ts += `    strokeWidth: '${icon.strokeWidth}',\n`;
  ts += `    iconType: '${icon.iconType}',\n`;
  ts += `  },\n`;
}

ts += `];\n`;

writeFileSync(join('src', 'app', 'pages', 'icons', 'icon-data.ts'), ts, 'utf-8');
console.log(`Written: src/app/pages/icons/icon-data.ts (${results.length} icons)`);
