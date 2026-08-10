import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const FALLBACK_CANDIDATES = [
  'server/data/site-content.json',
  'src/data/site-content.mock.json',
  'server/data/site-content.example.json',
];

/**
 * Minimal shape check — mirrors src/lib/content.js isValidSiteContent.
 */
export function isValidSiteContent(data) {
  return (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    Array.isArray(data.cases) &&
    data.siteSettings &&
    typeof data.siteSettings === 'object' &&
    data.siteSettings.siteName &&
    typeof data.siteSettings.siteName === 'object'
  );
}

function readJsonFile(absolutePath) {
  const raw = fs.readFileSync(absolutePath, 'utf8');
  const data = JSON.parse(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Content root must be a JSON object');
  }
  return data;
}

/**
 * Load content from local fallback files (server JSON → mock → example).
 * @returns {{ content: object, sourcePath: string } | null}
 */
export function loadFallbackContent() {
  for (const rel of FALLBACK_CANDIDATES) {
    const absolutePath = path.join(ROOT, rel);
    if (!fs.existsSync(absolutePath)) continue;
    try {
      const content = readJsonFile(absolutePath);
      if (!isValidSiteContent(content)) continue;
      return { content, sourcePath: rel };
    } catch {
      continue;
    }
  }
  return null;
}
