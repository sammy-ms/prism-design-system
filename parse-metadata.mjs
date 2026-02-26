// Parse the Figma metadata XML to extract icon sub-element positions
import { readFileSync, writeFileSync } from 'fs';

const metaPath =
  'C:/Users/xtrap/.claude/projects/C--Users-xtrap-Music-angular-testing/459fb41d-311b-4b2e-9ce6-6abf096f5776/tool-results/mcp-274d7d5a-9f55-49d8-9fcf-f16b41e7d1d5-get_metadata-1772020630128.txt';

// Read and parse the JSON wrapper
const raw = readFileSync(metaPath, 'utf8');
const json = JSON.parse(raw);
const xmlText = json[0].text;

// Write the raw XML for inspection
writeFileSync('figma-metadata.xml', xmlText);

// Parse XML to find icon structure
// Look for Size=Large nodes and their children
const iconPattern =
  /name="Size=Large[^"]*"[^>]*id="([^"]+)"[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"/g;

// Better approach: find all elements with their attributes
const elementPattern = /<(\w+)\s+([^>]+)\/?>|<\/(\w+)>/g;

// Extract all elements
let elements = [];
let match;
while ((match = elementPattern.exec(xmlText)) !== null) {
  if (match[1]) {
    // opening tag
    const attrs = {};
    const attrPattern = /(\w+)="([^"]+)"/g;
    let a;
    while ((a = attrPattern.exec(match[2])) !== null) {
      attrs[a[1]] = a[2];
    }
    elements.push({ tag: match[1], attrs, index: match.index });
  }
}

console.log(`Total elements: ${elements.length}`);

// Find elements named "Size=Large*"
const sizeLargeElements = elements.filter(
  (e) => e.attrs.name && e.attrs.name.startsWith('Size=Large'),
);
console.log(`Size=Large elements: ${sizeLargeElements.length}`);

// Show first 3 for inspection
sizeLargeElements.slice(0, 3).forEach((e) => {
  console.log(JSON.stringify(e.attrs));
});

// Now let's parse the XML hierarchically to find icon parents
// We need to find: Icon/name -> Size=Large -> children (vectors/ellipses/etc)
// Let's parse as nested structure

// Simple approach: for each Size=Large element, find its parent (the icon component)
// and its children (the vectors)

// Let's first output a small sample of the XML
console.log('\n--- First 3000 chars of XML ---');
console.log(xmlText.substring(0, 3000));
