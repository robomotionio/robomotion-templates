#!/usr/bin/env node
/**
 * Rebuilds index.yaml from every <slug>/template.yaml.
 *
 * The index entry shape is: name, slug, summary, category, level, tags,
 * author, created, updated, screenshot, [video_url], has_subflows.
 * We do not copy downloads/dependencies/flow_id into the index — those stay
 * in template.yaml only.
 */
const fs = require('fs');
const path = require('path');

const OUT_ROOT = '/home/faik/robomotion-src/robomotion-templates';
const INDEX_FIELDS = [
  'name', 'slug', 'summary', 'category', 'level', 'tags',
  'author', 'created', 'updated', 'screenshot', 'video_url', 'has_subflows',
];

function parseTemplateYaml(text) {
  // Very targeted YAML reader: extracts the fields we care about.
  const out = {};
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val === '>-') {
      // Folded block scalar — read subsequent indented lines
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

function formatSummary(summary) {
  // Preserve the folded-scalar style used in the existing index
  const lines = summary.split('\n');
  return '>-\n' + lines.map(l => '      ' + l).join('\n');
}

function renderEntry(t) {
  const lines = [];
  lines.push(`  - name: ${t.name}`);
  lines.push(`    slug: ${t.slug}`);
  lines.push(`    summary: ${formatSummary(t.summary)}`);
  lines.push(`    category: ${t.category}`);
  lines.push(`    level: ${t.level}`);
  lines.push(`    tags: ${t.tags}`);
  lines.push(`    author: ${t.author}`);
  lines.push(`    created: ${t.created}`);
  lines.push(`    updated: ${t.updated}`);
  lines.push(`    screenshot: ${t.screenshot}`);
  if (t.video_url) lines.push(`    video_url: ${t.video_url}`);
  lines.push(`    has_subflows: ${t.has_subflows}`);
  return lines.join('\n');
}

function main() {
  const slugs = fs.readdirSync(OUT_ROOT).filter(e => {
    const p = path.join(OUT_ROOT, e, 'template.yaml');
    return fs.statSync(path.join(OUT_ROOT, e)).isDirectory() && fs.existsSync(p);
  }).sort();

  const entries = [];
  for (const slug of slugs) {
    const ymlPath = path.join(OUT_ROOT, slug, 'template.yaml');
    const raw = fs.readFileSync(ymlPath, 'utf-8');
    const parsed = parseTemplateYaml(raw);
    // Guard: every template must declare level
    if (!parsed.level) {
      console.error(`  ERROR: ${slug} is missing level`);
      process.exit(2);
    }
    entries.push(parsed);
  }

  // Sort by name, matching existing index.yaml convention
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const header = 'schema_version: 1\ntemplates:\n';
  const body = entries.map(renderEntry).join('\n\n') + '\n';
  fs.writeFileSync(path.join(OUT_ROOT, 'index.yaml'), header + body);
  console.log(`Wrote index.yaml with ${entries.length} entries.`);
}

main();
