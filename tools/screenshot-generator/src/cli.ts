#!/usr/bin/env tsx
/**
 * CLI for generating flow screenshots from Robomotion template files.
 *
 * Usage:
 *   npx tsx src/cli.ts --all                    # All templates
 *   npx tsx src/cli.ts ssl-watch rest-api        # Specific templates
 *   npx tsx src/cli.ts --all --output ./out      # Custom output dir
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';
import { parseTemplate } from './parser.js';
import { ScreenshotSession } from './screenshot.js';

const TEMPLATES_ROOT = resolve(join(import.meta.dirname, '..', '..', '..'));

function discoverTemplates(): string[] {
  const entries = readdirSync(TEMPLATES_ROOT);
  return entries.filter(entry => {
    if (entry === 'tools' || entry.startsWith('.')) return false;
    const dir = join(TEMPLATES_ROOT, entry);
    return statSync(dir).isDirectory() && existsSync(join(dir, 'main.ts'));
  }).sort();
}

function parseArgs(): { templates: string[]; outputDir: string | null } {
  const args = process.argv.slice(2);
  let templates: string[] = [];
  let outputDir: string | null = null;
  let allMode = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') {
      allMode = true;
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputDir = args[++i];
    } else if (!args[i].startsWith('-')) {
      templates.push(args[i]);
    }
  }

  if (allMode) {
    templates = discoverTemplates();
  }

  if (templates.length === 0) {
    console.error('Usage: npx tsx src/cli.ts [--all | template-name ...] [--output dir]');
    console.error('\nAvailable templates:');
    for (const t of discoverTemplates()) {
      console.error(`  ${t}`);
    }
    process.exit(1);
  }

  return { templates, outputDir };
}

async function main() {
  const { templates, outputDir } = parseArgs();

  console.log(`Generating screenshots for ${templates.length} template(s)...\n`);

  const session = new ScreenshotSession();
  await session.init();

  let success = 0;
  let failed = 0;

  for (const templateName of templates) {
    const templateDir = join(TEMPLATES_ROOT, templateName);

    if (!existsSync(templateDir)) {
      console.error(`  SKIP ${templateName} — directory not found`);
      failed++;
      continue;
    }

    try {
      const flow = parseTemplate(templateDir);
      const outPath = outputDir
        ? join(resolve(outputDir), `${templateName}.png`)
        : join(templateDir, 'screenshot.png');

      console.log(`  ${templateName} — ${flow.nodes.length} nodes, ${flow.edges.length} edges`);

      await session.capture(flow, { outputPath: outPath });
      console.log(`    → ${outPath}`);
      success++;
    } catch (err) {
      console.error(`  FAIL ${templateName}: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  await session.close();

  console.log(`\nDone: ${success} succeeded, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
