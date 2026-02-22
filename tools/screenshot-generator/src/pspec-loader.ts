/**
 * Downloads and caches external .pspec files from packages.robomotion.io.
 * Extracts node color, inputs, and outputs for accurate screenshot rendering.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';

const PACKAGES_BASE = 'https://packages.robomotion.io/stable';
const CACHE_DIR = join(dirname(new URL(import.meta.url).pathname), '..', '.pspec-cache');

export interface PspecNodeData {
  color: string;
  inputs: number;
  outputs: number;
}

export interface Dependency {
  namespace: string;
  version: string;
}

/** Ensure cache directory exists */
function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/** Get cache file path for a dependency */
function cacheFilePath(namespace: string, version: string): string {
  return join(CACHE_DIR, `${namespace}-${version}.json`);
}

/** Fetch the package index to get the path for a namespace */
async function fetchPackageIndex(): Promise<Record<string, { path: string }>> {
  const indexCachePath = join(CACHE_DIR, '_index.json');

  // Cache the index for 24 hours
  if (existsSync(indexCachePath)) {
    const stat = statSync(indexCachePath);
    const ageMs = Date.now() - stat.mtimeMs;
    if (ageMs < 24 * 60 * 60 * 1000) {
      return JSON.parse(readFileSync(indexCachePath, 'utf-8'));
    }
  }

  const resp = await fetch(`${PACKAGES_BASE}/index.json`);
  if (!resp.ok) throw new Error(`Failed to fetch package index: ${resp.status}`);
  const raw = await resp.json() as { packages?: Record<string, { path: string; namespace: string }> } & Record<string, { path: string; namespace: string }>;

  // The index wraps packages under a "packages" key
  const data = raw.packages ?? raw;

  // Build a namespace → path lookup
  const lookup: Record<string, { path: string }> = {};
  for (const [, entry] of Object.entries(data)) {
    if (entry && typeof entry === 'object' && entry.namespace && entry.path) {
      lookup[entry.namespace] = { path: entry.path };
    }
  }

  ensureCacheDir();
  writeFileSync(indexCachePath, JSON.stringify(lookup, null, 2));
  return lookup;
}

/** Build the pspec download URL */
function buildPspecUrl(path: string, namespace: string, version: string): string {
  // Robomotion.GoogleSheets → googlesheets
  const parts = namespace.split('.');
  const nsLower = parts.slice(1).join('.').toLowerCase();
  return `${PACKAGES_BASE}/${path}/robomotion-${nsLower}-${version}.pspec`;
}

/** Download and parse a single pspec file, returning node data map */
async function downloadPspec(
  namespace: string,
  version: string,
  packagePath: string
): Promise<Map<string, PspecNodeData>> {
  const cachePath = cacheFilePath(namespace, version);

  // Check cache first
  if (existsSync(cachePath)) {
    const cached = JSON.parse(readFileSync(cachePath, 'utf-8')) as Record<string, PspecNodeData>;
    return new Map(Object.entries(cached));
  }

  const url = buildPspecUrl(packagePath, namespace, version);
  const resp = await fetch(url);
  if (!resp.ok) {
    console.warn(`    [pspec] Failed to download ${url}: ${resp.status}`);
    return new Map();
  }

  const pspec = await resp.json() as { nodes?: Array<{ id: string; color: string; inputs: number; outputs: number }> };
  const nodes = new Map<string, PspecNodeData>();

  if (pspec.nodes && Array.isArray(pspec.nodes)) {
    for (const node of pspec.nodes) {
      if (node.id && node.color != null) {
        nodes.set(node.id, {
          color: node.color,
          inputs: node.inputs ?? 1,
          outputs: node.outputs ?? 1,
        });
      }
    }
  }

  // Cache the results
  ensureCacheDir();
  const cacheData: Record<string, PspecNodeData> = {};
  for (const [id, data] of nodes) {
    cacheData[id] = data;
  }
  writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));

  return nodes;
}

/**
 * Load pspec data for all dependencies.
 * Returns a map of namespace (node id) → { color, inputs, outputs }.
 */
export async function loadPspecsForDependencies(
  deps: Dependency[]
): Promise<Map<string, PspecNodeData>> {
  if (deps.length === 0) return new Map();

  ensureCacheDir();
  const index = await fetchPackageIndex();
  const allNodes = new Map<string, PspecNodeData>();

  // Build case-insensitive lookup for the index
  const indexLower = new Map<string, { namespace: string; path: string }>();
  for (const [ns, val] of Object.entries(index)) {
    indexLower.set(ns.toLowerCase(), { namespace: ns, path: val.path });
  }

  for (const dep of deps) {
    // Try exact match first, then case-insensitive
    let entry = index[dep.namespace];
    let resolvedNamespace = dep.namespace;
    if (!entry) {
      const lower = indexLower.get(dep.namespace.toLowerCase());
      if (lower) {
        entry = { path: lower.path };
        resolvedNamespace = lower.namespace;
      }
    }
    if (!entry) {
      console.warn(`    [pspec] Unknown package: ${dep.namespace}`);
      continue;
    }

    const nodes = await downloadPspec(resolvedNamespace, dep.version, entry.path);
    for (const [id, data] of nodes) {
      allNodes.set(id, data);
    }
  }

  return allNodes;
}
