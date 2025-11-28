import { mkdirSync, copyFileSync } from 'node:fs';

const target = process.argv[2] ?? 'firefox'; // firefox | chrome

mkdirSync('public', { recursive: true });
copyFileSync(`manifest.${target}.json`, 'public/manifest.json');

console.log(`✔ public/manifest.json <- manifest.${target}.json`);
