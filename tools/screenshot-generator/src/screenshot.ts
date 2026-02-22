/**
 * Playwright-based screenshot orchestration.
 * Bundles the React Flow app with esbuild, generates self-contained HTML
 * with flow data injected, and captures screenshots via headless Chromium.
 */

import { chromium, type Browser } from 'playwright';
import { buildSync } from 'esbuild';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import type { ParsedFlow, FlowNode, FlowEdge } from './parser.js';

const VIEWPORT_WIDTH = 1600;
const VIEWPORT_HEIGHT = 900;
const DEVICE_SCALE_FACTOR = 2;

let cachedBundle: { js: string; reactFlowCss: string; customCss: string } | null = null;

/**
 * Bundle the React Flow renderer once. Returns JS and CSS strings.
 */
function bundleRenderer(): { js: string; reactFlowCss: string; customCss: string } {
  if (cachedBundle) return cachedBundle;

  const rendererDir = join(dirname(new URL(import.meta.url).pathname), 'renderer');
  const toolRoot = join(dirname(new URL(import.meta.url).pathname), '..');

  // Bundle React app JS only (no CSS imports)
  const result = buildSync({
    entryPoints: [join(rendererDir, 'entry.tsx')],
    bundle: true,
    write: false,
    outdir: 'out',
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    jsxImportSource: 'react',
    minify: true,
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  let js = '';
  for (const file of result.outputFiles) {
    if (file.path.endsWith('.js')) js = file.text;
  }

  // Read React Flow CSS directly from node_modules
  const reactFlowCssPath = join(toolRoot, 'node_modules', '@xyflow', 'react', 'dist', 'style.css');
  const reactFlowCss = readFileSync(reactFlowCssPath, 'utf-8');
  const customCss = readFileSync(join(rendererDir, 'styles.css'), 'utf-8');

  cachedBundle = { js, reactFlowCss, customCss };
  return cachedBundle;
}

/**
 * Convert parsed flow data into React Flow node/edge format.
 */
function toReactFlowData(flow: ParsedFlow): { nodes: unknown[]; edges: unknown[] } {
  const nodes = flow.nodes.map((n: FlowNode) => ({
    id: n.id,
    type: n.nodeType,
    position: n.position,
    data: {
      label: n.name,
      subtitle: n.subtitle,
      color: n.color,
      inputs: n.inputs,
      outputs: n.outputs,
      icon: n.icon,
      commentText: n.commentText ?? '',
      width: n.dimensions.width,
      height: n.dimensions.height,
    },
    style: {
      width: n.dimensions.width,
      height: n.dimensions.height,
    },
  }));

  const edges = flow.edges.map((e: FlowEdge) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    type: 'default',
    style: { stroke: '#666', strokeWidth: 2 },
  }));

  return { nodes, edges };
}

/**
 * Generate a complete self-contained HTML string with flow data embedded.
 */
function generateHtml(flowData: { nodes: unknown[]; edges: unknown[] }): string {
  const { js, reactFlowCss, customCss } = bundleRenderer();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: hsl(240, 6%, 14%);
}
</style>
<style>${reactFlowCss}</style>
<style>${customCss}</style>
</head>
<body>
<div id="root"></div>
<script>
window.__FLOW_DATA__ = ${JSON.stringify(flowData)};
window.__FLOW_READY__ = false;
</script>
<script>${js}</script>
</body>
</html>`;
}

export interface ScreenshotOptions {
  outputPath: string;
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
}

/**
 * Screenshot session — reuses browser across multiple screenshots.
 */
export class ScreenshotSession {
  private browser: Browser | null = null;

  async init(): Promise<void> {
    // Pre-bundle renderer
    bundleRenderer();

    this.browser = await chromium.launch({
      headless: true,
    });
  }

  async capture(flow: ParsedFlow, options: ScreenshotOptions): Promise<void> {
    if (!this.browser) {
      throw new Error('Session not initialized. Call init() first.');
    }

    const width = options.width ?? VIEWPORT_WIDTH;
    const height = options.height ?? VIEWPORT_HEIGHT;
    const scale = options.deviceScaleFactor ?? DEVICE_SCALE_FACTOR;

    const context = await this.browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: scale,
    });

    const page = await context.newPage();

    // Log browser console for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`    [browser] ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      console.error(`    [browser error] ${err.message}`);
    });

    try {
      const reactFlowData = toReactFlowData(flow);
      const html = generateHtml(reactFlowData);

      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      // Wait for React Flow to render and fitView to complete
      await page.waitForFunction(() => window.__FLOW_READY__ === true, { timeout: 15000 });

      // Extra delay for edge rendering
      await page.waitForTimeout(500);

      // Take screenshot
      const outputDir = dirname(options.outputPath);
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

      await page.screenshot({
        path: options.outputPath,
        type: 'png',
      });
    } finally {
      await page.close();
      await context.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
