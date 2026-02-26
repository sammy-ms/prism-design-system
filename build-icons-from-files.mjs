import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const ICONS_ROOT = join('..', 'icons');
const ICONS_ICON = join(ICONS_ROOT, 'Icon');
const ORDER_FILE = 'figma-icon-order.txt';
const NODE_IDS_FILE = 'icon-node-ids.txt';
const OUTPUT = join('src', 'app', 'pages', 'icons', 'icon-data.ts');

// ── Read figma order (deduplicated) ──
const rawOrder = readFileSync(ORDER_FILE, 'utf-8')
  .trim()
  .split('\n')
  .map((s) => s.trim().toLowerCase());
const seen = new Set();
const ORDER = [];
for (const name of rawOrder) {
  if (!seen.has(name)) {
    seen.add(name);
    ORDER.push(name);
  }
}
console.log(`Figma order: ${rawOrder.length} entries, ${ORDER.length} unique`);

// ── Read node IDs ──
const nodeIdMap = {};
readFileSync(NODE_IDS_FILE, 'utf-8')
  .trim()
  .split('\n')
  .forEach((line) => {
    const [name, nodeId] = line.trim().split('|');
    if (name && nodeId) {
      nodeIdMap[name.toLowerCase()] = nodeId;
    }
  });

// ── Read ALL SVG files from both directories ──
function readAllSvgFiles() {
  const files = [];

  // Read from icons/Icon/
  if (existsSync(ICONS_ICON)) {
    for (const f of readdirSync(ICONS_ICON)) {
      if (f.endsWith('.svg')) {
        files.push({ dir: ICONS_ICON, filename: f, path: join(ICONS_ICON, f) });
      }
    }
  }

  // Read from icons/ root
  for (const f of readdirSync(ICONS_ROOT)) {
    if (f.endsWith('.svg')) {
      files.push({ dir: ICONS_ROOT, filename: f, path: join(ICONS_ROOT, f) });
    }
  }

  return files;
}

// ── Extract inner SVG content (everything inside <svg>...</svg>) ──
function extractSvgInner(svgText) {
  // Remove the outer <svg> wrapper
  const innerMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!innerMatch) return '';
  let inner = innerMatch[1].trim();
  // Remove xmlns attributes from inner elements
  inner = inner.replace(/\s*xmlns="[^"]*"/g, '');
  return inner;
}

// ── Extract viewBox from SVG ──
function extractViewBox(svgText) {
  const match = svgText.match(/viewBox="([^"]+)"/);
  return match ? match[1] : '0 0 24 24';
}

// ── Extract width/height ──
function extractDimensions(svgText) {
  const w = svgText.match(/width="([^"]+)"/);
  const h = svgText.match(/height="([^"]+)"/);
  return { width: w ? w[1] : '24', height: h ? h[1] : '24' };
}

// ── Determine icon type from SVG content ──
function determineIconType(svgText, inner) {
  // Check if it's a filled icon (has fill with actual colors, no stroke)
  const hasColoredFill = /fill="(?!none|white|#F0F0F0)[^"]+"/i.test(inner);
  const hasStroke = /stroke="[^"]+"/i.test(inner);
  const hasClipPath = /clip-path/i.test(inner);
  const hasMultipleColors = (inner.match(/fill="(?!none|white)[^"]+"/gi) || []).length > 2;

  if (hasClipPath || hasMultipleColors) return 'image'; // flags, logos with multiple colors
  if (hasColoredFill && !hasStroke) return 'filled';
  if (hasStroke) return 'stroke';
  if (hasColoredFill) return 'filled';
  return 'stroke';
}

// ── Get stroke width from SVG ──
function getStrokeWidth(svgText) {
  const match = svgText.match(/stroke-width="([^"]+)"/);
  return match ? match[1] : '2';
}

// ── Normalize SVG content for comparison ──
function normalizePaths(inner) {
  // Extract just the d= values from paths for fingerprinting
  const dValues = [];
  const re = /d="([^"]+)"/g;
  let m;
  while ((m = re.exec(inner)) !== null) {
    // Normalize: remove spaces around operators, round numbers
    dValues.push(m[1].replace(/\s+/g, ' ').trim().substring(0, 50));
  }
  return dValues.join('|');
}

// ── Read all Large (24px) SVG files ──
const allFiles = readAllSvgFiles();
const large24Files = allFiles.filter((f) => f.filename.includes('Size=Large (24px)'));
const specialFiles = allFiles.filter(
  (f) =>
    !f.filename.includes('Size=Large (24px)') &&
    !f.filename.includes('Size=Medium') &&
    !f.filename.includes('Size=Small') &&
    !f.filename.includes('Size=Extra Small') &&
    f.dir === ICONS_ROOT,
);

console.log(`\nTotal SVG files: ${allFiles.length}`);
console.log(`Large (24px) files: ${large24Files.length}`);
console.log(`Special files: ${specialFiles.map((f) => f.filename).join(', ')}`);

// ── Build fingerprint database from all files ──
const fileData = [];
for (const file of [...large24Files, ...specialFiles]) {
  try {
    const content = readFileSync(file.path, 'utf-8');
    const inner = extractSvgInner(content);
    const viewBox = extractViewBox(content);
    const dims = extractDimensions(content);
    const iconType = determineIconType(content, inner);
    const strokeWidth = getStrokeWidth(content);
    const fingerprint = normalizePaths(inner);

    fileData.push({
      ...file,
      content,
      inner,
      viewBox,
      dims,
      iconType,
      strokeWidth,
      fingerprint,
    });
  } catch (e) {
    console.error(`Error reading ${file.path}: ${e.message}`);
  }
}

// ── Try to match files to icon names using Tabler icon data ──
// Read existing icon-data.ts to get the current name-to-content mapping
let existingIcons = [];
try {
  const existingTs = readFileSync(OUTPUT, 'utf-8');
  const iconRe = /name:\s*'([^']+)'[\s\S]*?svgContent:\s*'([\s\S]*?)',\n\s*viewBox/g;
  let m;
  while ((m = iconRe.exec(existingTs)) !== null) {
    existingIcons.push({ name: m[1], svgContent: m[2], fingerprint: normalizePaths(m[2]) });
  }
  console.log(`\nExisting icon-data.ts: ${existingIcons.length} icons`);
} catch {
  console.log('\nNo existing icon-data.ts found, building from scratch');
}

// ── Manual mappings for known special files ──
const KNOWN_FILES = {
  // Logos
  'Logo (1) 1.svg': 'logo-amazon',
  'Logo 2.svg': 'logo-ups',
  'Size=Large.svg': 'logo-mobilesentrix',
  'idpeg29Gmw_1766561828257 1.svg': 'usps',
  'Flags.svg': 'flag-united states',
  'Vector 5.svg': null, // skip
  'Size=Default.svg': null, // skip (16px globe-languages)
  'Size=Extra Small (12px).svg': null, // skip
};

// ── Match flags by reading each flag file and identifying by colors ──
// Standard flag color patterns
const FLAG_PATTERNS = {
  // Afghanistan: black, red, green with emblem
  'flag-afghanistan': (inner) => /#000|#D80027/.test(inner) && /#496E2D/.test(inner),
  // Albania: red with black eagle
  'flag-albania': (inner) =>
    /#D80027/.test(inner) &&
    /#000/.test(inner) &&
    !/white.*blue/i.test(inner) &&
    (inner.match(/#D80027/g) || []).length <= 3,
  // Algeria: green + white + red crescent
  'flag-algeria': (inner) =>
    /#496E2D/.test(inner) && /#D80027/.test(inner) && !/#0052B4/.test(inner),
  // Canada: red + white with maple leaf
  'flag-canada': (inner) =>
    /#D80027/.test(inner) &&
    /#F0F0F0/.test(inner) &&
    !/#0052B4/.test(inner) &&
    !/#496E2D/.test(inner) &&
    !/#000/.test(inner),
  // China: red + yellow stars
  'flag-china': (inner) => /#D80027/.test(inner) && /#FFDA44/.test(inner) && !/#0052B4/.test(inner),
  // Finland: white + blue cross
  'flag-finland': (inner) =>
    /#F0F0F0/.test(inner) && /#0052B4/.test(inner) && !/#D80027/.test(inner),
  // France: blue + white + red vertical
  'flag-france': (inner) =>
    /#0052B4/.test(inner) &&
    /#D80027/.test(inner) &&
    /#F0F0F0/.test(inner) &&
    !/#FFDA44/.test(inner) &&
    !/#000/.test(inner),
  // Germany: black + red + gold
  'flag-germany': (inner) =>
    /#000|#333/.test(inner) && /#D80027|#DD0000/.test(inner) && /#FFDA44|#FFCE00/.test(inner),
  // Italy: green + white + red vertical
  'flag-italy': (inner) => /#6DA544/.test(inner) && /#D80027/.test(inner) && !/#0052B4/.test(inner),
  // Japan: white + red circle
  'flag-japan': (inner) =>
    /#D80027/.test(inner) &&
    /#F0F0F0/.test(inner) &&
    !/#0052B4/.test(inner) &&
    !/#FFDA44/.test(inner) &&
    !/#6DA544/.test(inner) &&
    (inner.match(/circle|Circle/g) || []).length > 0,
  // Portugal: green + red with emblem
  'flag-portugal': (inner) =>
    /#6DA544/.test(inner) && /#D80027/.test(inner) && /#FFDA44/.test(inner),
  // Russia: white + blue + red horizontal
  'flag-russia': (inner) =>
    /#0052B4/.test(inner) &&
    /#D80027/.test(inner) &&
    !/#FFDA44/.test(inner) &&
    !/#6DA544/.test(inner) &&
    !/#000/.test(inner),
  // South Korea: white with yin-yang red/blue and trigrams
  'flag-sout-korea': (inner) =>
    /#D80027/.test(inner) && /#0052B4/.test(inner) && /#333/.test(inner),
  // UK: Union Jack - complex red/white/blue
  'flag-united kingdom': (inner) =>
    /#0052B4/.test(inner) && /#D80027/.test(inner) && (inner.match(/#0052B4/g) || []).length > 3,
  // US: already matched as Flags.svg
  'flag-united states': (inner) => false, // already known
};

// ── Build the final icon data ──
const results = [];
const matched = new Set();
const errors = [];

function toDisplayName(name) {
  return name
    .split(/[-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Process each icon in order
for (const iconName of ORDER) {
  // Check if it's a known special file
  let foundFile = null;

  // Check manual mappings
  for (const [filename, mappedName] of Object.entries(KNOWN_FILES)) {
    if (mappedName === iconName) {
      foundFile = fileData.find((f) => f.filename === filename);
      break;
    }
  }

  // Check flag patterns
  if (!foundFile && iconName.startsWith('flag-')) {
    const pattern = FLAG_PATTERNS[iconName];
    if (pattern) {
      // Look through all large 24px files for matching flag
      const flagCandidates = fileData.filter(
        (f) =>
          f.iconType === 'image' &&
          f.viewBox === '0 0 24 24' &&
          !matched.has(f.path) &&
          pattern(f.inner),
      );
      if (flagCandidates.length > 0) {
        foundFile = flagCandidates[0];
      }
    }
  }

  // For country/state icons - these are custom icons, try to find by fingerprint
  if (!foundFile && (iconName === 'country' || iconName === 'state')) {
    // These are likely custom icons that look like map-related icons
    // Try matching from existing data
    const existing = existingIcons.find((e) => e.name === iconName);
    if (existing && existing.svgContent) {
      results.push({
        name: iconName,
        displayName: toDisplayName(iconName),
        svgContent: existing.svgContent,
        viewBox: '0 0 24 24',
        strokeWidth: '2',
        iconType: 'stroke',
      });
      continue;
    }
  }

  // For star-filled - use Tabler but make it orange
  if (iconName === 'star-filled') {
    const existing = existingIcons.find((e) => e.name === 'star-filled');
    if (existing) {
      // Replace fill="currentColor" with fill="#FF9811" for orange star
      const orangeSvg = existing.svgContent.replace(/fill="currentColor"/g, 'fill="#FF9811"');
      results.push({
        name: iconName,
        displayName: 'Star Filled',
        svgContent: orangeSvg || existing.svgContent,
        viewBox: '0 0 24 24',
        strokeWidth: '2',
        iconType: 'filled',
      });
      continue;
    }
  }

  if (foundFile) {
    matched.add(foundFile.path);
    let inner = foundFile.inner;

    // For standard stroke icons, normalize stroke color
    if (foundFile.iconType === 'stroke') {
      inner = inner.replace(/stroke="#1B1F22"/g, 'stroke="currentColor"');
    }

    results.push({
      name: iconName,
      displayName: toDisplayName(iconName),
      svgContent: inner,
      viewBox: foundFile.viewBox,
      strokeWidth: foundFile.strokeWidth,
      iconType: foundFile.iconType,
    });
    continue;
  }

  // Fall back to existing icon-data.ts content
  const existing = existingIcons.find((e) => e.name === iconName);
  if (existing && existing.svgContent) {
    // Determine icon type
    let iconType = 'stroke';
    if (/fill="currentColor"/.test(existing.svgContent) && !/stroke=/.test(existing.svgContent)) {
      iconType = 'filled';
    }

    results.push({
      name: iconName,
      displayName: toDisplayName(iconName),
      svgContent: existing.svgContent,
      viewBox: '0 0 24 24',
      strokeWidth: '2',
      iconType,
    });
    continue;
  }

  // Not found at all
  errors.push(`MISSING: ${iconName}`);
  results.push({
    name: iconName,
    displayName: toDisplayName(iconName),
    svgContent: '<circle cx="12" cy="12" r="8" />',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
    iconType: 'placeholder',
  });
}

console.log(`\nBuilt ${results.length} icons`);
console.log(`Matched from files: ${matched.size}`);
console.log(`Errors: ${errors.length}`);
errors.forEach((e) => console.log('  ' + e));

// Count by type
const typeCounts = {};
for (const r of results) {
  typeCounts[r.iconType] = (typeCounts[r.iconType] || 0) + 1;
}
console.log('\nBy type:', typeCounts);

// ── Write TypeScript ──
function escapeTs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

let ts = `// =============================================================================
// Prism Design System — Icon Data
// Auto-generated from Figma-exported SVG files
// ${results.length} icons in Figma visual order
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
  ts += `    name: '${escapeTs(icon.name)}',\n`;
  ts += `    displayName: '${escapeTs(icon.displayName)}',\n`;
  ts += `    svgContent: '${escapeTs(icon.svgContent)}',\n`;
  ts += `    viewBox: '${escapeTs(icon.viewBox)}',\n`;
  ts += `    strokeWidth: '${escapeTs(icon.strokeWidth)}',\n`;
  ts += `    iconType: '${icon.iconType}',\n`;
  ts += `  },\n`;
}

ts += `];\n`;

writeFileSync(OUTPUT, ts, 'utf-8');
console.log(`\nWritten: ${OUTPUT} (${results.length} icons)`);
