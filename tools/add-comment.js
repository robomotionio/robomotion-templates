#!/usr/bin/env node
/**
 * One-shot: prepends a Core.Flow.Comment node to every new template's main.ts.
 * Uses the name+summary from template.yaml to build the markdown text.
 * Safe to re-run: skips files that already have a Core.Flow.Comment.
 */

const fs = require('fs');
const path = require('path');

const OUT_ROOT = '/home/faik/robomotion-src/robomotion-templates';
const SLUGS = fs.readFileSync(path.join(OUT_ROOT, 'tools', 'ported-uuids.csv'), 'utf-8')
  .trim().split('\n').map(l => l.split(',')[0]);

function parseTemplateYaml(text) {
  const out = {};
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val === '>-') {
      const parts = [];
      for (let j = i + 1; j < lines.length; j++) {
        if (/^\s{2}/.test(lines[j])) { parts.push(lines[j].replace(/^\s{2}/, '')); i = j; } else break;
      }
      out[key] = parts.join(' ').replace(/\s+/g, ' ').trim();
      continue;
    }
    out[key] = val;
  }
  return out;
}

function escapeSingle(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function buildCommentText(name, summary) {
  // `### Title` + blank line + summary. Kept under ~400 chars so the default
  // 339×214 comment box stays legible; long summaries wrap comfortably.
  return `### ${name}\n\n${summary}`;
}

function addComment(slug) {
  const dir = path.join(OUT_ROOT, slug);
  const mainPath = path.join(dir, 'main.ts');
  const ymlPath = path.join(dir, 'template.yaml');
  const content = fs.readFileSync(mainPath, 'utf-8');

  if (content.includes("'Core.Flow.Comment'")) {
    return { slug, status: 'skip' };
  }

  const meta = parseTemplateYaml(fs.readFileSync(ymlPath, 'utf-8'));
  const text = buildCommentText(meta.name, meta.summary);
  const commentLine =
    `  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '${escapeSingle(text)}' });`;

  // Insert after the flow.create(...) opening and any f.addDependency lines.
  // Anchor: the first `f.node(` call that isn't the comment we're inserting.
  const lines = content.split('\n');
  let insertAt = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*f\.node\(\s*'a1\d{4}'/.test(lines[i]) || /^\s*f\.node\(\s*'/.test(lines[i])) {
      insertAt = i;
      break;
    }
  }
  if (insertAt < 0) throw new Error(`no f.node() anchor found in ${mainPath}`);

  lines.splice(insertAt, 0, commentLine, '');
  fs.writeFileSync(mainPath, lines.join('\n'));
  return { slug, status: 'added' };
}

function main() {
  let added = 0, skipped = 0;
  for (const slug of SLUGS) {
    try {
      const r = addComment(slug);
      if (r.status === 'added') { console.log(`  + ${slug}`); added++; }
      else { skipped++; }
    } catch (err) {
      console.error(`  FAIL ${slug}: ${err.message}`);
    }
  }
  console.log(`\nAdded: ${added}, skipped: ${skipped}.`);
}

main();
