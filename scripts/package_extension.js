import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const extDir = resolve(rootDir, 'chrome-extension');
const outDir = resolve(rootDir, 'dist-extension');
const outZip = resolve(outDir, 'ailetter-chrome-extension-v1.0.0.zip');

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}
if (existsSync(outZip)) {
  rmSync(outZip);
}

const files = [
  'manifest.json',
  'extractor.js',
  'content.js',
  'content.css',
  'popup.html',
  'popup.css',
  'popup.js',
  'icons',
].map((f) => `'${resolve(extDir, f)}'`);

const psCmd = `$ProgressPreference = 'SilentlyContinue'; Compress-Archive -Path ${files.join(',')} -DestinationPath '${outZip}' -Force`;
execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'inherit' });
console.log(`Packaged Chrome extension -> ${outZip}`);
