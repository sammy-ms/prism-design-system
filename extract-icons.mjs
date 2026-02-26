import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const OUTLINE_DIR = join('node_modules', '@tabler', 'icons', 'icons', 'outline');
const FILLED_DIR = join('node_modules', '@tabler', 'icons', 'icons', 'filled');

// Map: figmaName → { tabler: tablerFileName, filled?: boolean, displayName?: string }
const ICON_MAP = [
  { figma: 'align-center', tabler: 'align-center' },
  { figma: 'align-left', tabler: 'align-left' },
  { figma: 'align-right', tabler: 'align-right' },
  { figma: 'arrow-back-up', tabler: 'arrow-back-up' },
  { figma: 'arrow-down', tabler: 'arrow-down' },
  { figma: 'arrow-left', tabler: 'arrow-left' },
  { figma: 'arrow-right', tabler: 'arrow-right' },
  { figma: 'arrow-up', tabler: 'arrow-up' },
  { figma: 'article', tabler: 'article' },
  { figma: 'asterik', tabler: 'asterisk', displayName: 'Asterisk' },
  { figma: 'at-sign', tabler: 'at', displayName: 'At Sign' },
  { figma: 'blacklist-user', tabler: 'user-x', displayName: 'Blacklist User' },
  { figma: 'bold', tabler: 'bold' },
  { figma: 'book-open', tabler: 'book', displayName: 'Book Open' },
  { figma: 'bookmark', tabler: 'bookmark' },
  { figma: 'boxes', tabler: 'packages', displayName: 'Boxes' },
  { figma: 'brand-apple', tabler: 'brand-apple' },
  { figma: 'calendar', tabler: 'calendar' },
  { figma: 'chalkboard', tabler: 'chalkboard' },
  { figma: 'check', tabler: 'check' },
  { figma: 'chevron-down', tabler: 'chevron-down' },
  { figma: 'chevron-left', tabler: 'chevron-left' },
  { figma: 'chevron-right', tabler: 'chevron-right' },
  { figma: 'chevron-up', tabler: 'chevron-up' },
  { figma: 'chevrons-up-down', tabler: 'selector', displayName: 'Chevrons Up Down' },
  {
    figma: 'circle-check-solid',
    tabler: 'circle-check',
    filled: true,
    displayName: 'Circle Check Solid',
  },
  { figma: 'circle-code', tabler: 'code-circle', displayName: 'Circle Code' },
  { figma: 'circle-cross', tabler: 'circle-x', displayName: 'Circle Cross' },
  { figma: 'clock', tabler: 'clock' },
  { figma: 'command', tabler: 'command' },
  { figma: 'copy', tabler: 'copy' },
  { figma: 'copy-plus', tabler: 'copy-plus' },
  { figma: 'cry', tabler: 'mood-cry', displayName: 'Cry' },
  { figma: 'dark-mode', tabler: 'moon', displayName: 'Dark Mode' },
  { figma: 'dashboard', tabler: 'dashboard' },
  { figma: 'database', tabler: 'database' },
  { figma: 'device-dollar', tabler: 'device-mobile-dollar', displayName: 'Device Dollar' },
  { figma: 'device-mobile', tabler: 'device-mobile' },
  { figma: 'device-user', tabler: 'user-scan', displayName: 'Device User' },
  { figma: 'devices', tabler: 'devices' },
  { figma: 'dots-horizontal', tabler: 'dots', displayName: 'Dots Horizontal' },
  { figma: 'dots-vertical', tabler: 'dots-vertical' },
  { figma: 'download', tabler: 'download' },
  { figma: 'external-link', tabler: 'external-link' },
  { figma: 'eye', tabler: 'eye' },
  { figma: 'eye-closed', tabler: 'eye-closed' },
  { figma: 'eye-edit', tabler: 'eye-edit' },
  { figma: 'file-bar-chart', tabler: 'file-analytics', displayName: 'File Bar Chart' },
  { figma: 'file-box', tabler: 'file-stack', displayName: 'File Box' },
  { figma: 'file-pdf', tabler: 'file-type-pdf', displayName: 'File PDF' },
  { figma: 'file-plus', tabler: 'file-plus' },
  { figma: 'filter', tabler: 'filter' },
  { figma: 'folder', tabler: 'folder' },
  {
    figma: 'gear-play-automation',
    tabler: 'settings-automation',
    displayName: 'Gear Play Automation',
  },
  { figma: 'github', tabler: 'brand-github', displayName: 'GitHub' },
  { figma: 'grid', tabler: 'layout-grid', displayName: 'Grid' },
  { figma: 'happy', tabler: 'mood-happy', displayName: 'Happy' },
  { figma: 'history', tabler: 'history' },
  { figma: 'hold', tabler: 'hand-stop', displayName: 'Hold' },
  { figma: 'image', tabler: 'photo', displayName: 'Image' },
  { figma: 'image-plus', tabler: 'photo-plus', displayName: 'Image Plus' },
  { figma: 'info', tabler: 'info-circle', displayName: 'Info' },
  { figma: 'italic', tabler: 'italic' },
  { figma: 'knowledge-base', tabler: 'library', displayName: 'Knowledge Base' },
  { figma: 'light-mode', tabler: 'sun', displayName: 'Light Mode' },
  { figma: 'like', tabler: 'thumb-up', displayName: 'Like' },
  { figma: 'link', tabler: 'link' },
  { figma: 'list', tabler: 'list' },
  { figma: 'list-letters', tabler: 'list-letters' },
  { figma: 'list-number', tabler: 'list-numbers', displayName: 'List Number' },
  { figma: 'login-customer', tabler: 'login', displayName: 'Login Customer' },
  { figma: 'mark-issue', tabler: 'flag-exclamation', displayName: 'Mark Issue' },
  { figma: 'mark-suspicous', tabler: 'alert-octagon', displayName: 'Mark Suspicious' },
  { figma: 'minus', tabler: 'minus' },
  { figma: 'not-ship', tabler: 'ship-off', displayName: 'Not Ship' },
  { figma: 'pencil', tabler: 'pencil' },
  { figma: 'pin', tabler: 'pin' },
  { figma: 'plus', tabler: 'plus' },
  { figma: 'refund', tabler: 'receipt-refund', displayName: 'Refund' },
  { figma: 'sad', tabler: 'mood-sad', displayName: 'Sad' },
  { figma: 'search', tabler: 'search' },
  { figma: 'server', tabler: 'server' },
  { figma: 'settings', tabler: 'settings' },
  { figma: 'shopping-bag', tabler: 'shopping-bag' },
  {
    figma: 'sidebar-left-expand',
    tabler: 'layout-sidebar-left-expand',
    displayName: 'Sidebar Left Expand',
  },
  {
    figma: 'sidebar-right-expand',
    tabler: 'layout-sidebar-right-expand',
    displayName: 'Sidebar Right Expand',
  },
  { figma: 'smile', tabler: 'mood-smile', displayName: 'Smile' },
  { figma: 'sparkles', tabler: 'sparkles' },
  { figma: 'spinner', tabler: 'loader', displayName: 'Spinner' },
  { figma: 'stack', tabler: 'stack-2', displayName: 'Stack' },
  { figma: 'star', tabler: 'star' },
  { figma: 'table-dashed', tabler: 'table-dashed' },
  { figma: 'tags', tabler: 'tags' },
  { figma: 'ticket', tabler: 'ticket' },
  { figma: 'trash', tabler: 'trash' },
  { figma: 'triangle-alert', tabler: 'alert-triangle', displayName: 'Triangle Alert' },
  { figma: 'truck-delivery', tabler: 'truck-delivery' },
  { figma: 'underline', tabler: 'underline' },
  { figma: 'unlike', tabler: 'thumb-down', displayName: 'Unlike' },
  { figma: 'unverified', tabler: 'shield-off', displayName: 'Unverified' },
  { figma: 'upload', tabler: 'upload' },
  { figma: 'users', tabler: 'users' },
  { figma: 'warning', tabler: 'alert-triangle', displayName: 'Warning' },
  { figma: 'x', tabler: 'x' },
];

function toDisplayName(name) {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractPaths(svgContent) {
  // Extract all <path> elements, skip the background rect (M0 0h24v24H0z)
  const paths = [];
  const circleRegex = /<circle\s+([^>]*)\/?>/g;
  const rectRegex = /<rect\s+([^>]*)\/?>/g;
  const lineRegex = /<line\s+([^>]*)\/?>/g;
  const pathRegex = /<path\s+[^>]*d="([^"]+)"[^>]*\/?>/g;

  let match;
  while ((match = pathRegex.exec(svgContent)) !== null) {
    const d = match[1];
    if (d === 'M0 0h24v24H0z') continue; // Skip background
    paths.push(`<path d="${d}" />`);
  }

  while ((match = circleRegex.exec(svgContent)) !== null) {
    const attrs = match[1];
    const cx = attrs.match(/cx="([^"]+)"/)?.[1];
    const cy = attrs.match(/cy="([^"]+)"/)?.[1];
    const r = attrs.match(/r="([^"]+)"/)?.[1];
    if (cx && cy && r) {
      paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" />`);
    }
  }

  while ((match = lineRegex.exec(svgContent)) !== null) {
    const attrs = match[1];
    const x1 = attrs.match(/x1="([^"]+)"/)?.[1];
    const y1 = attrs.match(/y1="([^"]+)"/)?.[1];
    const x2 = attrs.match(/x2="([^"]+)"/)?.[1];
    const y2 = attrs.match(/y2="([^"]+)"/)?.[1];
    if (x1 && y1 && x2 && y2) {
      paths.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`);
    }
  }

  return paths.join('');
}

function extractStrokeWidth(svgContent) {
  const match = svgContent.match(/stroke-width="([^"]+)"/);
  return match ? match[1] : '2';
}

const results = [];
const errors = [];

for (const entry of ICON_MAP) {
  const dir = entry.filled ? FILLED_DIR : OUTLINE_DIR;
  const filePath = join(dir, `${entry.tabler}.svg`);

  try {
    const svg = readFileSync(filePath, 'utf-8');
    const svgContent = extractPaths(svg);
    const strokeWidth = extractStrokeWidth(svg);
    const displayName = entry.displayName || toDisplayName(entry.figma);

    if (!svgContent) {
      errors.push(`EMPTY: ${entry.figma} (${filePath})`);
      continue;
    }

    results.push({
      name: entry.figma,
      displayName,
      svgContent,
      viewBox: '0 0 24 24',
      strokeWidth,
      filled: entry.filled || false,
    });
  } catch (e) {
    errors.push(`ERROR: ${entry.figma} → ${filePath}: ${e.message}`);
  }
}

// Remove duplicate 'warning' (same as triangle-alert)
const seen = new Set();
const deduplicated = results.filter((r) => {
  if (seen.has(r.name)) return false;
  seen.add(r.name);
  return true;
});

console.log(`Extracted ${deduplicated.length} icons, ${errors.length} errors`);
if (errors.length) {
  console.log('Errors:', errors);
}

// Generate TypeScript file
let ts = `// =============================================================================
// Prism Design System — Icon Data
// Auto-generated from @tabler/icons v3.37.1
// =============================================================================

export interface IconEntry {
  /** kebab-case name, e.g. 'arrow-back-up' */
  name: string;
  /** Human-readable label, e.g. 'Arrow Back Up' */
  displayName: string;
  /** Inner SVG markup (<path>, <circle>, <line> elements) */
  svgContent: string;
  /** SVG viewBox attribute */
  viewBox: string;
  /** SVG stroke-width attribute */
  strokeWidth: string;
}

export const ICONS: IconEntry[] = [\n`;

for (const icon of deduplicated) {
  ts += `  {\n`;
  ts += `    name: '${icon.name}',\n`;
  ts += `    displayName: '${icon.displayName}',\n`;
  ts += `    svgContent: '${icon.svgContent.replace(/'/g, "\\'")}',\n`;
  ts += `    viewBox: '${icon.viewBox}',\n`;
  ts += `    strokeWidth: '${icon.strokeWidth}',\n`;
  ts += `  },\n`;
}

ts += `];\n`;

writeFileSync(join('src', 'app', 'pages', 'icons', 'icon-data.ts'), ts, 'utf-8');
console.log('Written: src/app/pages/icons/icon-data.ts');
