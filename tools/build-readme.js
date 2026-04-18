#!/usr/bin/env node
/**
 * Rebuilds the top-level README.md from index.yaml.
 * Sections are ordered to match categories.yaml.
 * Row description is the first sentence of the summary, trimmed.
 */
const fs = require('fs');
const path = require('path');

const OUT_ROOT = '/home/faik/robomotion-src/robomotion-templates';

// Preferred display order; any other category falls through alphabetically.
const CATEGORY_ORDER = [
  'Monitoring',
  'System Administration',
  'Web Scraping',
  'Web Automation',
  'File Operations',
  'Data Processing',
  'Networking',
  'Databases',
  'Productivity',
  'System Utilities',
  'Date & Time',
  'Desktop Automation',
  'Excel Automation',
  'PDF',
  'Scripting',
  'Text Manipulation',
  'Flow Control',
  'Concurrency',
  'Error Handling',
  'AI',
  'Other',
];

// Hand-crafted one-liners for existing templates (kept verbatim from the
// previous README). For the 51 new templates we derive from summary.
const CUSTOM = {
  'api-health-check': 'Checks whether an API endpoint is reachable by sending an HTTP GET request and inspecting the response status code',
  'content-checker': 'Monitors a webpage element for changes — useful for tracking price drops, stock availability, or any text on a page',
  'domain-inspector': 'An AI chat agent that checks live SSL certificates and DNS records for any domain',
  'ssl-watch': 'Monitors SSL certificates for domains listed in Google Sheets and writes expiration data back to the spreadsheet',
  'duckduckgo-scraper': 'Searches DuckDuckGo and saves result titles and links to an Excel file',
  'screen-capture': 'Takes a screenshot of a web page and saves it to a file',
  'download-file-from-web': 'Downloads a file from a URL and saves it to a local path',
  'duplicate-file-remover': 'Finds and deletes duplicate files in a directory by comparing SHA-256 content hashes',
  'read-text-file': 'Reads a text file from disk and displays its content in a message box',
  'convert-excel-document-to-csv-file': 'Converts an Excel file (.xls/.xlsx) into a CSV file with a configurable delimiter',
  'json-beautifier': 'Pretty-prints a JSON string with custom indentation and saves the result to a file',
  'json-minifier': 'Compacts a JSON object into a single-line string with no whitespace',
  'merge-csv': 'Combines all `.csv` files from a directory into a single CSV file with a configurable delimiter',
  'rest-api': 'Creates a local HTTP server with GET and POST endpoints as a starting point for HTTP-triggered robots',
  'send-get-request': 'Sends an HTTP GET request and displays the response body in a message box',
  'sqlite-quick-start': 'Demonstrates core SQLite operations: create a database, insert rows, batch-insert, and run a SELECT query',
  'translator': 'Translates text between languages using Google Translate via headless browser automation',
  'web-element-to-pdf': 'Converts a specific element on a web page into a downloadable PDF',
  'read-from-clipboard': 'Reads the current text from the system clipboard and displays it in a message box',
  'write-to-clipboard': 'Prompts for text input via a dialog and copies it to the system clipboard',
  'password-generator': 'Generates a random alphanumeric password of configurable length and copies it to the clipboard',
  'fork-branch-with-memory-queue': 'Demonstrates parallel browser automation — 6 browser instances process a shared queue of URLs concurrently',
  'handle-errors': 'Demonstrates the throw/catch error handling pattern with input validation and a retry loop',
  'bmi-calculator': 'Calculates Body Mass Index from weight and height inputs — a beginner-friendly demo of input dialogs and basic math',
  'calorie-coach-agent': 'A chat-based nutrition tracker that logs meals into SQLite and coaches the user toward calorie and macro goals',
  'generic-chat-assistant': 'Minimal Chat Assistant + LLM Agent starter for building custom conversational robots',
};

function firstSentence(s) {
  // Take up to the first terminal punctuation, fall back to full string.
  const m = s.match(/^([^.!?]+[.!?])/);
  let out = m ? m[1] : s;
  return out.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseTemplateYaml(text) {
  const out = {};
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val === '>-') {
      const parts = [];
      for (let j = i + 1; j < lines.length; j++) {
        if (/^\s{2}/.test(lines[j])) {
          parts.push(lines[j].replace(/^\s{2}/, ''));
          i = j;
        } else break;
      }
      out[key] = parts.join('\n');
      continue;
    }
    out[key] = val;
  }
  return out;
}

function main() {
  const slugs = fs.readdirSync(OUT_ROOT).filter(e => {
    const p = path.join(OUT_ROOT, e, 'template.yaml');
    try { return fs.statSync(path.join(OUT_ROOT, e)).isDirectory() && fs.existsSync(p); } catch { return false; }
  }).sort();

  const entries = slugs.map(slug => ({
    slug,
    ...parseTemplateYaml(fs.readFileSync(path.join(OUT_ROOT, slug, 'template.yaml'), 'utf-8')),
  }));

  // Group by category
  const byCat = new Map();
  for (const e of entries) {
    if (!byCat.has(e.category)) byCat.set(e.category, []);
    byCat.get(e.category).push(e);
  }

  const orderedCats = [
    ...CATEGORY_ORDER.filter(c => byCat.has(c)),
    ...[...byCat.keys()].filter(c => !CATEGORY_ORDER.includes(c)).sort(),
  ];

  const out = [];
  out.push('# Robomotion Templates');
  out.push('');
  out.push('Ready-to-use flow templates for the [Robomotion](https://robomotion.io) RPA platform.');
  out.push('');
  out.push(`Every template declares a \`level\` (Beginner / Intermediate / Advanced) so you can pick an entry point that matches your experience. See [docs/level-field.md](docs/level-field.md).`);
  out.push('');
  out.push('## Templates');
  out.push('');

  for (const cat of orderedCats) {
    const list = byCat.get(cat).slice().sort((a, b) => a.name.localeCompare(b.name));
    out.push(`### ${cat}`);
    out.push('');
    out.push('| Template | Level | Description |');
    out.push('|----------|-------|-------------|');
    for (const e of list) {
      const desc = CUSTOM[e.slug] || firstSentence(e.summary);
      out.push(`| [${e.name}](${e.slug}) | ${e.level} | ${desc} |`);
    }
    out.push('');
  }

  fs.writeFileSync(path.join(OUT_ROOT, 'README.md'), out.join('\n'));
  console.log(`Wrote README.md with ${entries.length} templates across ${orderedCats.length} categories.`);
}

main();
