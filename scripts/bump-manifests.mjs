import { readFileSync, writeFileSync } from 'node:fs';

const version = process.env.npm_package_version;

for (const path of ['manifest.chrome.json', 'manifest.firefox.json']) {
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  manifest.version = version;
  writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
}
