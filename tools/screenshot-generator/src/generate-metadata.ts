#!/usr/bin/env tsx
/**
 * Generates template.yaml skeleton files for all templates.
 * Extracts metadata from main.ts files and creates YAML files.
 *
 * Usage:
 *   npx tsx src/generate-metadata.ts [--all | template-name ...]
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const TEMPLATES_ROOT = resolve(join(import.meta.dirname, '..', '..', '..'));

/** Map template slugs to categories */
const CATEGORY_MAP: Record<string, string> = {
  'ssl-watch': 'System Administration',
  'api-health-check': 'System Administration',
  'domain-inspector': 'System Administration',
  'duckduckgo-scraper': 'Web Scraping',
  'content-checker': 'Web Scraping',
  'screen-capture': 'Web Scraping',
  'web-element-to-pdf': 'Web Scraping',
  'merge-csv': 'Data Processing',
  'json-beautifier': 'Data Processing',
  'json-minifier': 'Data Processing',
  'convert-excel-document-to-csv-file': 'Data Processing',
  'bmi-calculator': 'Data Processing',
  'read-text-file': 'File Operations',
  'duplicate-file-remover': 'File Operations',
  'download-file-from-web': 'File Operations',
  'translator': 'AI & Agents',
  'rest-api': 'Networking',
  'send-get-request': 'Networking',
  'sqlite-quick-start': 'Databases',
  'password-generator': 'Security',
  'handle-errors': 'Error Handling',
  'fork-branch-with-memory-queue': 'Concurrency',
  'read-from-clipboard': 'System Utilities',
  'write-to-clipboard': 'System Utilities',
};

/** Map template slugs to tags */
const TAGS_MAP: Record<string, string[]> = {
  'ssl-watch': ['ssl', 'monitoring', 'google-sheets', 'automation'],
  'api-health-check': ['api', 'health-check', 'http', 'monitoring'],
  'domain-inspector': ['dns', 'ssl', 'ai', 'monitoring', 'chat'],
  'duckduckgo-scraper': ['scraping', 'search', 'duckduckgo', 'browser'],
  'content-checker': ['browser', 'scraping', 'content', 'monitoring'],
  'screen-capture': ['browser', 'screenshot', 'automation'],
  'web-element-to-pdf': ['browser', 'pdf', 'web'],
  'merge-csv': ['csv', 'merge', 'file-processing'],
  'json-beautifier': ['json', 'formatting', 'file-processing'],
  'json-minifier': ['json', 'formatting', 'file-processing'],
  'convert-excel-document-to-csv-file': ['excel', 'csv', 'conversion'],
  'bmi-calculator': ['calculator', 'dialog', 'example'],
  'read-text-file': ['file', 'read', 'text'],
  'duplicate-file-remover': ['file', 'hash', 'duplicate', 'cleanup'],
  'download-file-from-web': ['download', 'http', 'file'],
  'translator': ['translation', 'ai', 'llm', 'chat'],
  'rest-api': ['rest', 'api', 'http', 'server'],
  'send-get-request': ['http', 'get', 'request'],
  'sqlite-quick-start': ['sqlite', 'database', 'sql'],
  'password-generator': ['password', 'security', 'generator'],
  'handle-errors': ['error-handling', 'catch', 'example'],
  'fork-branch-with-memory-queue': ['parallel', 'fork', 'queue', 'browser'],
  'read-from-clipboard': ['clipboard', 'read', 'system'],
  'write-to-clipboard': ['clipboard', 'write', 'system'],
};

interface TemplateInfo {
  flowId: string;
  flowName: string;
  dependencies: { package: string; version: string }[];
  hasSubflows: boolean;
  commentText: string;
}

function extractTemplateInfo(templateDir: string): TemplateInfo | null {
  const mainTsPath = join(templateDir, 'main.ts');
  if (!existsSync(mainTsPath)) return null;

  const content = readFileSync(mainTsPath, 'utf-8');

  // Extract flow ID and name
  const flowMatch = content.match(/flow\.create\(\s*'([^']+)'\s*,\s*'([^']+)'/);
  const flowId = flowMatch?.[1] ?? '';
  const flowName = flowMatch?.[2] ?? '';

  // Extract dependencies
  const deps: { package: string; version: string }[] = [];
  const depRegex = /f\.addDependency\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;
  let match;
  while ((match = depRegex.exec(content)) !== null) {
    deps.push({ package: match[1], version: match[2] });
  }

  // Check for subflows
  const hasSubflows = existsSync(join(templateDir, 'subflows'));

  // Extract first comment text
  const commentMatch = content.match(/optText:\s*'((?:[^'\\]|\\.)*)'/s);
  let commentText = '';
  if (commentMatch) {
    commentText = commentMatch[1]
      .replace(/\\'/g, "'")
      .replace(/\\n/g, '\n')
      .replace(/^#+\s*/gm, '')  // Remove markdown headers
      .trim();
  }

  return { flowId, flowName, dependencies: deps, hasSubflows, commentText };
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function generateYaml(slug: string, info: TemplateInfo): string {
  const name = slugToTitle(slug);
  const category = CATEGORY_MAP[slug] ?? 'Uncategorized';
  const tags = TAGS_MAP[slug] ?? [slug];

  // Build summary from comment text — take the first meaningful paragraph
  const commentLines = info.commentText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('http') && !l.startsWith('```'));

  // Skip the title line (usually short) and take the first real paragraph
  let summary = '';
  if (commentLines.length > 1) {
    // Try to find first line that looks like a description (longer than a title)
    const descLine = commentLines.find((l, i) => i > 0 && l.length > 20);
    summary = descLine ?? commentLines.slice(0, 2).join(' ');
  } else if (commentLines.length === 1) {
    summary = commentLines[0];
  }

  if (!summary || summary.length < 10) {
    summary = `${name} template for Robomotion automation.`;
  }
  if (summary.length > 250) summary = summary.slice(0, 247) + '...';

  // Escape YAML special chars in summary
  summary = summary.replace(/"/g, '\\"');

  let yaml = `name: ${name}
slug: ${slug}
summary: >-
  ${summary}
category: ${category}
tags: [${tags.join(', ')}]
author: Robomotion
created: "2025-12-07"
updated: "2025-12-07"
screenshot: screenshot.png
`;

  if (info.dependencies.length > 0) {
    yaml += `dependencies:\n`;
    for (const dep of info.dependencies) {
      yaml += `  - package: ${dep.package}\n    version: "${dep.version}"\n`;
    }
  }

  yaml += `has_subflows: ${info.hasSubflows}
flow_id: ${info.flowId}
schema_version: 1
`;

  return yaml;
}

function discoverTemplates(): string[] {
  const entries = readdirSync(TEMPLATES_ROOT);
  return entries.filter(entry => {
    if (entry === 'tools' || entry.startsWith('.') || entry === 'README.md') return false;
    const dir = join(TEMPLATES_ROOT, entry);
    return statSync(dir).isDirectory() && existsSync(join(dir, 'main.ts'));
  }).sort();
}

function main() {
  const args = process.argv.slice(2);
  let templates: string[];

  if (args.includes('--all')) {
    templates = discoverTemplates();
  } else if (args.length > 0) {
    templates = args.filter(a => !a.startsWith('-'));
  } else {
    console.error('Usage: npx tsx src/generate-metadata.ts [--all | template-name ...]');
    process.exit(1);
  }

  console.log(`Generating template.yaml for ${templates.length} template(s)...\n`);

  let created = 0;
  let skipped = 0;

  for (const slug of templates) {
    const templateDir = join(TEMPLATES_ROOT, slug);
    const yamlPath = join(templateDir, 'template.yaml');

    // Skip if already exists
    if (existsSync(yamlPath)) {
      console.log(`  SKIP ${slug} — template.yaml already exists`);
      skipped++;
      continue;
    }

    const info = extractTemplateInfo(templateDir);
    if (!info) {
      console.log(`  SKIP ${slug} — no main.ts found`);
      skipped++;
      continue;
    }

    const yaml = generateYaml(slug, info);
    writeFileSync(yamlPath, yaml);
    console.log(`  ${slug} → template.yaml`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

main();
