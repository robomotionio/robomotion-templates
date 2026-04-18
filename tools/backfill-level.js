#!/usr/bin/env node
/**
 * One-shot: add `level:` to every existing template.yaml that lacks it.
 * Inserted after the `category:` line to match the decided-schema order.
 */
const fs = require('fs');
const path = require('path');

const OUT_ROOT = '/home/faik/robomotion-src/robomotion-templates';

const LEVELS = {
  'bmi-calculator': 'Beginner',
  'handle-errors': 'Beginner',
  'json-minifier': 'Beginner',
  'password-generator': 'Beginner',
  'read-from-clipboard': 'Beginner',
  'read-text-file': 'Beginner',
  'send-get-request': 'Beginner',
  'write-to-clipboard': 'Beginner',
  'download-file-from-web': 'Beginner',
  'screen-capture': 'Beginner',
  'api-health-check': 'Beginner',
  'content-checker': 'Intermediate',
  'duckduckgo-scraper': 'Intermediate',
  'duplicate-file-remover': 'Intermediate',
  'json-beautifier': 'Intermediate',
  'merge-csv': 'Intermediate',
  'rest-api': 'Intermediate',
  'sqlite-quick-start': 'Intermediate',
  'translator': 'Intermediate',
  'web-element-to-pdf': 'Intermediate',
  'convert-excel-document-to-csv-file': 'Intermediate',
  'calorie-coach-agent': 'Advanced',
  'generic-chat-assistant': 'Advanced',
  'domain-inspector': 'Advanced',
  'ssl-watch': 'Advanced',
  'fork-branch-with-memory-queue': 'Advanced',
};

for (const [slug, level] of Object.entries(LEVELS)) {
  const ymlPath = path.join(OUT_ROOT, slug, 'template.yaml');
  if (!fs.existsSync(ymlPath)) {
    console.error(`  MISSING ${slug}: ${ymlPath}`);
    continue;
  }
  const content = fs.readFileSync(ymlPath, 'utf-8');
  if (/^level:/m.test(content)) {
    console.log(`  SKIP ${slug} (already has level)`);
    continue;
  }
  // Insert after the category: line
  const replaced = content.replace(/^(category:.*)$/m, `$1\nlevel: ${level}`);
  if (replaced === content) {
    console.error(`  FAIL ${slug}: no category: line found`);
    continue;
  }
  fs.writeFileSync(ymlPath, replaced);
  console.log(`  ${slug} ← ${level}`);
}
