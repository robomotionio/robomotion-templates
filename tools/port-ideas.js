#!/usr/bin/env node
/**
 * Ports 51 ideas flows into robomotion-templates/ published form.
 * One-shot utility — produces main.ts, subflows/, template.yaml, README.md per slug.
 * Designer files are produced by a separate generate-designer.js script.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IDEAS_ROOT = '/home/faik/ideas';
const OUT_ROOT = '/home/faik/robomotion-src/robomotion-templates';

// Catalog — 51 entries. Each entry carries:
//   slug, cat (ideas folder), category (published), name, level,
//   summary (2–3 sentence), tags (3–5), has_subflows.
const CATALOG = [
  // datetime-handling
  { slug: 'convert-datetime-to-text', cat: 'datetime-handling', category: 'Date & Time', name: 'Convert Datetime to Text', level: 'Beginner',
    summary: 'Converts a datetime value into a formatted text string using the Robomotion DateTime package. Demonstrates standard and custom output layouts for logging, filenames, and reports.',
    tags: ['datetime', 'format', 'text', 'dialog'], has_subflows: false },
  { slug: 'convert-text-to-datetime', cat: 'datetime-handling', category: 'Date & Time', name: 'Convert Text to Datetime', level: 'Beginner',
    summary: 'Parses a text string like "2025-05-01 09:30:00" into a true datetime value the flow can work with. Shows how to declare an input layout so downstream nodes can format or compare the date.',
    tags: ['datetime', 'parsing', 'conversion', 'dialog'], has_subflows: false },
  { slug: 'days-of-your-life', cat: 'datetime-handling', category: 'Date & Time', name: 'Days of Your Life', level: 'Intermediate',
    summary: 'Calculates how many days you have been alive by subtracting your birthday from today. Uses DateTime Now, Subtract, and a Function node to produce a clean day count.',
    tags: ['datetime', 'calculation', 'interval', 'dialog'], has_subflows: false },
  { slug: 'get-current-time', cat: 'datetime-handling', category: 'Date & Time', name: 'Get Current Time', level: 'Beginner',
    summary: 'Reads the local date and time and formats it as a long time string (HH:mm:ss). Displays the result in an information dialog so you can verify the system clock at a glance.',
    tags: ['datetime', 'now', 'timestamp', 'dialog'], has_subflows: false },
  { slug: 'get-first-working-day-of-next-month', cat: 'datetime-handling', category: 'Date & Time', name: 'Get First Working Day of the Next Month', level: 'Intermediate',
    summary: 'Computes the first business day of next month, skipping weekends. Useful for scheduling invoices, reports, or reminders that must fire on a working day.',
    tags: ['datetime', 'working-day', 'calendar', 'conditional'], has_subflows: false },
  { slug: 'get-previous-working-date', cat: 'datetime-handling', category: 'Date & Time', name: 'Get Previous Working Date', level: 'Advanced',
    summary: 'Walks backwards from today to find the previous working day, handling weekends through conditional logic. A building block for backdated reports or audits.',
    tags: ['datetime', 'working-day', 'conditional', 'loop'], has_subflows: false },

  // desktop-automation
  { slug: 'add-datetime-to-file-names', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Add Datetime to File Names', level: 'Beginner',
    summary: 'Renames every file in a directory by appending the current date to its name. A quick way to version artefacts, snapshots, or export batches.',
    tags: ['file', 'rename', 'datetime', 'subflow'], has_subflows: true },
  { slug: 'copy-files', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Copy Files', level: 'Beginner',
    summary: 'Copies every file from a source directory into a destination, with optional overwrite. Demonstrates how to enumerate files and drive file-system operations from a subflow.',
    tags: ['file', 'copy', 'folder', 'subflow'], has_subflows: true },
  { slug: 'delete-files-of-specific-size-range', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Delete Files of Specific Size Range', level: 'Intermediate',
    summary: 'Scans a directory and deletes files whose size falls inside a min/max range. Useful for pruning oversized logs or clearing tiny scratch files.',
    tags: ['file', 'delete', 'size', 'filter', 'subflow'], has_subflows: true },
  { slug: 'find-and-delete-empty-files', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Find and Delete Empty Files', level: 'Beginner',
    summary: 'Walks a directory, locates zero-byte files, and deletes them in a single pass. Handy for cleaning up broken export folders.',
    tags: ['file', 'delete', 'empty-file', 'cleanup', 'subflow'], has_subflows: true },
  { slug: 'gui-testing-calculator', cat: 'desktop-automation', category: 'Desktop Automation', name: 'GUI Testing Calculator', level: 'Advanced',
    summary: 'Drives the Windows Calculator through native UI automation to validate arithmetic. A concrete template for end-to-end GUI testing of desktop apps.',
    tags: ['desktop', 'calculator', 'ui-automation', 'testing', 'subflow'], has_subflows: true },
  { slug: 'open-a-folder', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Open a Folder', level: 'Beginner',
    summary: 'Launches the system file explorer pointed at a given path. Minimal template demonstrating the Application.Launch node.',
    tags: ['folder', 'desktop', 'application-launcher'], has_subflows: false },
  { slug: 'print-current-weeks-calendar', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Print Current Week\'s Calendar', level: 'Intermediate',
    summary: 'Generates an HTML page for the current week and sends it to the default printer. Useful for team dashboards or physical planning boards.',
    tags: ['calendar', 'print', 'datetime', 'html'], has_subflows: false },
  { slug: 'print-documents', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Print Documents', level: 'Beginner',
    summary: 'Iterates a folder of documents and sends each one to the default printer. A compact recipe for automating bulk print jobs.',
    tags: ['print', 'file', 'desktop', 'subflow'], has_subflows: true },
  { slug: 'run-an-application', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Run an Application', level: 'Beginner',
    summary: 'Starts a desktop application by executable path — the simplest form of process orchestration in Robomotion.',
    tags: ['application-launcher', 'desktop', 'process'], has_subflows: false },
  { slug: 'send-text-to-notepad', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Send Text to Notepad', level: 'Beginner',
    summary: 'Opens Notepad and types a provided string into its editor window. Demonstrates how to pair Application.Launch with keyboard automation.',
    tags: ['notepad', 'text', 'keyboard', 'desktop'], has_subflows: false },
  { slug: 'share-powerpoint-file-as-pdf', cat: 'desktop-automation', category: 'Desktop Automation', name: 'Share PowerPoint File as PDF', level: 'Advanced',
    summary: 'Opens a .pptx file, exports it to PDF, and saves it next to the original. Automates a common office pipeline end to end.',
    tags: ['powerpoint', 'pdf', 'conversion', 'office', 'subflow'], has_subflows: true },

  // excel-automation
  { slug: 'consolidate-excel-reports', cat: 'excel-automation', category: 'Excel Automation', name: 'Consolidate Excel Reports', level: 'Intermediate',
    summary: 'Combines rows from multiple Excel workbooks in a folder into one consolidated sheet. A reporting helper that removes repetitive copy-paste work.',
    tags: ['excel', 'consolidate', 'merge', 'subflow'], has_subflows: true },
  { slug: 'launch-excel', cat: 'excel-automation', category: 'Excel Automation', name: 'Launch Excel', level: 'Beginner',
    summary: 'Opens Microsoft Excel and creates a new empty workbook. Starter template for any Excel automation.',
    tags: ['excel', 'spreadsheet', 'office', 'subflow'], has_subflows: true },
  { slug: 'launch-excel-and-extract-table', cat: 'excel-automation', category: 'Excel Automation', name: 'Launch Excel and Extract Table', level: 'Beginner',
    summary: 'Opens an Excel workbook and reads its first table into a structured message variable. Ideal starting point for data-driven flows.',
    tags: ['excel', 'table', 'extract', 'data', 'subflow'], has_subflows: true },
  { slug: 'manipulate-excel-data-using-sql', cat: 'excel-automation', category: 'Excel Automation', name: 'Manipulate Excel Data Using SQL', level: 'Advanced',
    summary: 'Loads Excel data into an in-memory SQL engine and runs a SELECT / UPDATE statement against it. Gives you database-level expressiveness over spreadsheet data.',
    tags: ['excel', 'sql', 'query', 'data', 'subflow'], has_subflows: true },
  { slug: 'search-and-replace-excel-values', cat: 'excel-automation', category: 'Excel Automation', name: 'Search and Replace Excel Values', level: 'Beginner',
    summary: 'Performs a find-and-replace across an Excel worksheet and saves the result. Handy for bulk corrections or masking sensitive fields.',
    tags: ['excel', 'search-replace', 'text', 'subflow'], has_subflows: true },

  // flow-control
  { slug: 'use-and-operator-in-conditionals', cat: 'flow-control', category: 'Flow Control', name: 'Use the AND Operator in Conditionals', level: 'Intermediate',
    summary: 'Shows how to branch a flow only when two conditions are both true using a Switch node with a combined predicate.',
    tags: ['conditional', 'logic', 'and', 'switch'], has_subflows: false },
  { slug: 'use-conditionals-to-check-if-file-exists', cat: 'flow-control', category: 'Flow Control', name: 'Use Conditionals to Check if File Exists', level: 'Beginner',
    summary: 'Checks whether a given file is present on disk and routes the flow accordingly. A textbook conditional branching example.',
    tags: ['conditional', 'file', 'check', 'switch'], has_subflows: false },
  { slug: 'use-labels-to-check-if-file-exists', cat: 'flow-control', category: 'Flow Control', name: 'Use Labels to Check if File Exists', level: 'Advanced',
    summary: 'Uses Label and GoTo to structure a loop that rechecks file existence — a non-sequential flow pattern useful for polling.',
    tags: ['label', 'goto', 'conditional', 'file', 'loop'], has_subflows: false },
  { slug: 'use-or-operator-in-conditionals', cat: 'flow-control', category: 'Flow Control', name: 'Use the OR Operator in Conditionals', level: 'Intermediate',
    summary: 'Combines two conditions with a logical OR and branches the flow based on the result. Complements the AND-operator variant.',
    tags: ['conditional', 'logic', 'or', 'switch'], has_subflows: false },
  { slug: 'use-subflows-to-check-if-file-exists', cat: 'flow-control', category: 'Flow Control', name: 'Use Subflows to Check if File Exists', level: 'Intermediate',
    summary: 'Encapsulates a "does this file exist?" check inside a reusable subflow so the main flow stays linear and readable.',
    tags: ['subflow', 'conditional', 'file', 'reuse'], has_subflows: true },

  // pdf-automation
  { slug: 'create-pdf-from-selected-pages', cat: 'pdf-automation', category: 'PDF', name: 'Create PDF from Selected Pages', level: 'Beginner',
    summary: 'Pulls a chosen range of pages from a source PDF and writes them to a new document. Useful for trimming or sharing parts of a report.',
    tags: ['pdf', 'pages', 'extract', 'selection', 'subflow'], has_subflows: true },
  { slug: 'extract-tables-from-pdf', cat: 'pdf-automation', category: 'PDF', name: 'Extract Tables from PDF', level: 'Intermediate',
    summary: 'Locates tables inside a PDF and extracts their rows into structured data. A drop-in stage in any OCR-adjacent pipeline.',
    tags: ['pdf', 'table', 'extract', 'data', 'subflow'], has_subflows: true },
  { slug: 'get-images-from-pdf', cat: 'pdf-automation', category: 'PDF', name: 'Get Images from PDF', level: 'Beginner',
    summary: 'Extracts every embedded image from a PDF file into a target directory. Useful for downstream OCR or asset recovery.',
    tags: ['pdf', 'images', 'extract', 'subflow'], has_subflows: true },
  { slug: 'get-number-of-pages', cat: 'pdf-automation', category: 'PDF', name: 'Get Number of Pages in a PDF', level: 'Intermediate',
    summary: 'Reports the page count of a PDF file as a single number. A small utility that feeds splitters, paginators, and dashboards.',
    tags: ['pdf', 'metadata', 'pages', 'count', 'subflow'], has_subflows: true },
  { slug: 'merge-pdfs', cat: 'pdf-automation', category: 'PDF', name: 'Merge PDFs', level: 'Intermediate',
    summary: 'Combines every PDF in a folder into one consolidated document using a reusable merge subflow.',
    tags: ['pdf', 'merge', 'concatenate', 'subflow'], has_subflows: true },
  { slug: 'merge-two-pdfs', cat: 'pdf-automation', category: 'PDF', name: 'Merge Two PDFs', level: 'Beginner',
    summary: 'Joins two PDF files into a single output document — the minimal merge recipe.',
    tags: ['pdf', 'merge', 'concatenate', 'subflow'], has_subflows: true },
  { slug: 'split-pdf-by-half', cat: 'pdf-automation', category: 'PDF', name: 'Split PDF by Half', level: 'Advanced',
    summary: 'Calculates a midpoint and splits a PDF into two evenly-sized halves. Demonstrates arithmetic on page counts feeding a splitter.',
    tags: ['pdf', 'split', 'pages', 'subflow'], has_subflows: true },
  { slug: 'split-pdf-by-specified-page', cat: 'pdf-automation', category: 'PDF', name: 'Split PDF by Specified Page', level: 'Intermediate',
    summary: 'Splits a PDF into two files at a user-specified page number. Ideal when you know exactly where a document should be divided.',
    tags: ['pdf', 'split', 'pages', 'conditional', 'subflow'], has_subflows: true },
  { slug: 'split-pdf-into-parts', cat: 'pdf-automation', category: 'PDF', name: 'Split PDF into Parts', level: 'Advanced',
    summary: 'Divides a PDF into N equal-sized slices and writes each part out as its own file. A general-purpose chunker for large documents.',
    tags: ['pdf', 'split', 'pages', 'parts', 'subflow'], has_subflows: true },

  // scripting
  { slug: 'convert-excel-to-pdf-using-vbscript', cat: 'scripting', category: 'Scripting', name: 'Convert Excel to PDF Using VBScript', level: 'Advanced',
    summary: 'Runs an inline VBScript that drives Excel COM to export a workbook as PDF. Shows how to bridge Robomotion with Windows scripting.',
    tags: ['vbscript', 'excel', 'pdf', 'conversion', 'subflow'], has_subflows: true },
  { slug: 'display-javascript-output', cat: 'scripting', category: 'Scripting', name: 'Display JavaScript Output', level: 'Intermediate',
    summary: 'Executes an inline JavaScript snippet and surfaces its return value in a dialog. Demonstrates the JavaScript Run node.',
    tags: ['javascript', 'script', 'output', 'dialog'], has_subflows: false },
  { slug: 'display-powershell-output', cat: 'scripting', category: 'Scripting', name: 'Display PowerShell Output', level: 'Intermediate',
    summary: 'Runs a PowerShell script and displays the captured standard output in a dialog.',
    tags: ['powershell', 'script', 'output', 'dialog'], has_subflows: false },
  { slug: 'display-python-output', cat: 'scripting', category: 'Scripting', name: 'Display Python Output', level: 'Intermediate',
    summary: 'Runs an inline Python script and shows its output in a dialog. Demonstrates the Python Run node.',
    tags: ['python', 'script', 'output', 'dialog'], has_subflows: false },
  { slug: 'display-vbscript-output', cat: 'scripting', category: 'Scripting', name: 'Display VBScript Output', level: 'Intermediate',
    summary: 'Executes a VBScript snippet and displays its output. Useful when integrating with legacy Windows tooling.',
    tags: ['vbscript', 'script', 'output', 'subflow'], has_subflows: true },
  { slug: 'extract-text-from-word-document', cat: 'scripting', category: 'Scripting', name: 'Extract Text from Word Document', level: 'Advanced',
    summary: 'Uses a VBScript bridge to pull raw text out of a .docx file for downstream NLP or search indexing.',
    tags: ['word', 'vbscript', 'text', 'extract', 'subflow'], has_subflows: true },
  { slug: 'get-login-name-using-python', cat: 'scripting', category: 'Scripting', name: 'Get Login Name Using Python', level: 'Advanced',
    summary: 'Retrieves the current Windows login user via an inline Python script. Handy for audit trails or user-scoped paths.',
    tags: ['python', 'system', 'credential', 'script'], has_subflows: false },

  // text-manipulation
  { slug: 'concatenate-text-files', cat: 'text-manipulation', category: 'Text Manipulation', name: 'Concatenate Text Files', level: 'Intermediate',
    summary: 'Reads every .txt file in a directory and stitches their contents into a single output file. Useful for log rollups.',
    tags: ['text', 'concatenate', 'file', 'subflow'], has_subflows: true },
  { slug: 'count-lines-of-text-file', cat: 'text-manipulation', category: 'Text Manipulation', name: 'Count Lines of a Text File', level: 'Intermediate',
    summary: 'Opens a text file and reports the number of lines it contains. A tiny helper you can drop into larger analytics flows.',
    tags: ['text', 'count', 'lines', 'statistics', 'subflow'], has_subflows: true },
  { slug: 'extract-phone-numbers-and-emails', cat: 'text-manipulation', category: 'Text Manipulation', name: 'Extract Phone Numbers and Emails', level: 'Intermediate',
    summary: 'Scans free-form text with regular expressions and pulls out every phone number and email address. Foundation for contact-harvesting jobs.',
    tags: ['regex', 'text', 'extract', 'phone', 'email'], has_subflows: false },
  { slug: 'get-position-of-subtext', cat: 'text-manipulation', category: 'Text Manipulation', name: 'Get Position of Subtext', level: 'Beginner',
    summary: 'Finds the character index of a substring inside a larger string. A concise demo of the text-search primitives.',
    tags: ['text', 'search', 'position', 'string'], has_subflows: false },
  { slug: 'sort-lines-of-text-file', cat: 'text-manipulation', category: 'Text Manipulation', name: 'Sort Lines of a Text File', level: 'Intermediate',
    summary: 'Reads a text file, sorts its lines alphabetically, and writes the result back out. Reusable for cleaning up exports and datasets.',
    tags: ['text', 'sort', 'file', 'subflow'], has_subflows: true },

  // web-automation
  { slug: 'get-metadata-of-web-page', cat: 'web-automation', category: 'Web Automation', name: 'Get Metadata of a Web Page', level: 'Intermediate',
    summary: 'Navigates to a URL, reads its title and meta tags, and returns them as structured data. Useful for link previews or SEO audits.',
    tags: ['web', 'metadata', 'scrape', 'html', 'subflow'], has_subflows: true },
  { slug: 'open-a-web-page', cat: 'web-automation', category: 'Web Automation', name: 'Open a Web Page', level: 'Beginner',
    summary: 'Launches a browser and navigates to a provided URL — the minimum viable browser-automation template.',
    tags: ['web', 'browser', 'navigation'], has_subflows: false },
  { slug: 'take-screenshot-of-web-page', cat: 'web-automation', category: 'Web Automation', name: 'Take Screenshot of a Web Page', level: 'Beginner',
    summary: 'Opens a URL in a browser and saves a screenshot of the rendered page to disk.',
    tags: ['web', 'screenshot', 'capture', 'browser'], has_subflows: false },
];

// Rewrite `flow.create('main', 'Name', (f) => {` to
// `flow.create('<uuid>', 'Imported <Name>', (f) => {`.
// Supports original forms with any single-quoted id and name.
function rewriteMainTs(content, uuid, displayName) {
  const regex = /flow\.create\(\s*'[^']*'\s*,\s*'[^']*'/;
  if (!regex.test(content)) {
    throw new Error('flow.create(...) preamble not found');
  }
  return content.replace(regex, `flow.create('${uuid}', 'Imported ${displayName}'`);
}

function yamlList(arr) {
  return '[' + arr.map(s => s).join(', ') + ']';
}

function readPlan(planPath) {
  const raw = fs.readFileSync(planPath, 'utf-8');
  // Parse sections by H1/H2
  const sections = {};
  const lines = raw.split('\n');
  let current = '__pre';
  sections[current] = [];
  let title = '';
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    if (h1) { title = h1[1].trim(); current = '__pre'; sections[current] = []; continue; }
    if (h2) { current = h2[1].trim(); sections[current] = []; continue; }
    sections[current].push(line);
  }
  const get = (name) => (sections[name] || []).join('\n').trim();
  return {
    title,
    description: get('Description'),
    objective: get('Objective'),
    prerequisites: get('Prerequisites'),
    steps: get('Steps'),
    notes: get('Notes'),
    variables: get('Variables'),
  };
}

function writeReadme(entry, plan, readmePath) {
  const { name, summary } = entry;
  const description = plan.description || summary;
  const objective = plan.objective ? `\n${plan.objective}\n` : '';
  const steps = plan.steps || '';
  const notes = plan.notes || '';

  // Derive 3–5 bullets from steps' numbered list
  const bullets = [];
  for (const raw of steps.split('\n')) {
    const m = raw.match(/^\s*\d+\.\s+(.*)$/);
    if (m) {
      // Strip markdown emphasis/code from the leading keyword for readability
      let b = m[1].replace(/\*\*/g, '').trim();
      // Truncate overly long steps
      if (b.length > 140) b = b.slice(0, 137) + '…';
      bullets.push(`- ${b}`);
      if (bullets.length === 5) break;
    }
  }

  const behindLines = notes || plan.objective || summary;

  const content = `# ${name}

${description}

## What ${name} can do

${bullets.length ? bullets.join('\n') : `- ${summary}`}

## Behind the scenes

${behindLines}
`;
  fs.writeFileSync(readmePath, content);
}

function writeTemplateYaml(entry, uuid, ymlPath) {
  const lines = [
    `name: ${entry.name}`,
    `slug: ${entry.slug}`,
    `summary: >-`,
    ...entry.summary.match(/.{1,78}(\s|$)/g).map(s => `  ${s.trim()}`),
    `category: ${entry.category}`,
    `level: ${entry.level}`,
    `tags: ${yamlList(entry.tags)}`,
    `author: Robomotion`,
    `created: "2026-04-18"`,
    `updated: "2026-04-18"`,
    `screenshot: screenshot.png`,
    `has_subflows: ${entry.has_subflows}`,
    `flow_id: ${uuid}`,
    `schema_version: 1`,
    ``,
  ];
  fs.writeFileSync(ymlPath, lines.join('\n'));
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function copySubflows(srcDir, dstDir) {
  const items = fs.readdirSync(srcDir);
  ensureDir(dstDir);
  for (const it of items) {
    if (!it.endsWith('.ts')) continue;
    fs.copyFileSync(path.join(srcDir, it), path.join(dstDir, it));
  }
}

function portEntry(entry) {
  const srcRoot = path.join(IDEAS_ROOT, entry.cat, entry.slug);
  const dstRoot = path.join(OUT_ROOT, entry.slug);
  const mainSrc = path.join(srcRoot, 'main.ts');
  const planSrc = path.join(srcRoot, 'plan.md');
  const subSrc = path.join(srcRoot, 'subflows');

  if (!fs.existsSync(mainSrc)) throw new Error(`missing main.ts: ${mainSrc}`);
  if (!fs.existsSync(planSrc)) throw new Error(`missing plan.md: ${planSrc}`);

  ensureDir(dstRoot);

  const uuid = crypto.randomUUID();
  const mainContent = fs.readFileSync(mainSrc, 'utf-8');
  const rewritten = rewriteMainTs(mainContent, uuid, entry.name);
  fs.writeFileSync(path.join(dstRoot, 'main.ts'), rewritten);

  if (entry.has_subflows && fs.existsSync(subSrc)) {
    copySubflows(subSrc, path.join(dstRoot, 'subflows'));
  }

  const plan = readPlan(planSrc);
  writeTemplateYaml(entry, uuid, path.join(dstRoot, 'template.yaml'));
  writeReadme(entry, plan, path.join(dstRoot, 'README.md'));

  return { slug: entry.slug, uuid };
}

function main() {
  const outRows = [];
  let ok = 0, fail = 0;
  for (const entry of CATALOG) {
    try {
      const r = portEntry(entry);
      outRows.push(`${r.slug},${r.uuid}`);
      console.log(`  ${entry.slug} → ${r.uuid}`);
      ok++;
    } catch (err) {
      console.error(`  FAIL ${entry.slug}: ${err.message}`);
      fail++;
    }
  }
  // Persist the uuid map so we can reuse it for index.yaml without regenerating.
  fs.writeFileSync(path.join(__dirname, 'ported-uuids.csv'), outRows.join('\n') + '\n');
  console.log(`\nDone: ${ok} ok, ${fail} failed.`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
