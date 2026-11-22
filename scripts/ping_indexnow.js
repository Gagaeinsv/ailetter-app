import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'ailetter.pro';
const KEY = 'a8f4c2e9b1d7403a9e6f5c2b8d1a4e7f';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = resolve(__dirname, '../public/sitemap.xml');

/**
 * Extracts all canonical <loc> URLs from public/sitemap.xml.
 */
function loadSitemapUrls(filePath) {
  const xml = readFileSync(filePath, 'utf8');
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1].trim()).filter(Boolean);
}

/**
 * Verifies the live IndexNow key file is served by Vercel before submitting URLs.
 */
async function verifyKeyHosted() {
  const res = await fetch(KEY_LOCATION);
  const body = (await res.text()).trim();
  if (!res.ok || body !== KEY) {
    throw new Error(
      `Key file verification failed at ${KEY_LOCATION}: HTTP ${res.status}, body="${body.slice(0, 80)}"`
    );
  }
  console.log(`Verified IndexNow key file at ${KEY_LOCATION} (HTTP ${res.status}).`);
}

async function main() {
  const urlList = loadSitemapUrls(sitemapPath);
  if (urlList.length === 0) {
    throw new Error(`No <loc> URLs found in ${sitemapPath}`);
  }
  console.log(`Loaded ${urlList.length} URLs from sitemap.xml.`);

  await verifyKeyHosted();

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`IndexNow response: HTTP ${res.status}${text ? ` — ${text}` : ''}`);

  if (res.status !== 200 && res.status !== 202) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
