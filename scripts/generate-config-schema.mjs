import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { build } from 'esbuild';
import { z } from 'zod';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(rootDir, 'src');
const outFile = path.join(rootDir, 'config.schema.json');

/**
 * `configSchema` живёт в TS и использует `#*` алиасы, поэтому бандлим его во временный js
 * и уже оттуда импортируем. Временная папка лежит внутри проекта, чтобы разрешался `zod`.
 */
const bundleSchema = async () => {
  const tmpDir = mkdtempSync(path.join(rootDir, 'node_modules', '.schema-'));
  const bundlePath = path.join(tmpDir, 'configSchema.mjs');

  await build({
    entryPoints: [path.join(srcDir, 'schema/configSchema.ts')],
    outfile: bundlePath,
    bundle: true,
    format: 'esm',
    platform: 'node',
    packages: 'external',
    alias: Object.fromEntries(
      ['api', 'components', 'data', 'hooks', 'schema', 'store', 'types', 'ui', 'utils'].map(
        (dir) => [`#${dir}`, path.join(srcDir, dir)],
      ),
    ),
  });

  try {
    return await import(pathToFileURL(bundlePath).href);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
};

/**
 * В yaml пустая секция (`google:` с одними комментариями внутри) парсится в `null`.
 * Перед валидацией конфиг прогоняется через `removeNullObjectValues`, поэтому такой `null`
 * равнозначен отсутствующему полю. Повторяем это правило в json-схеме: любому необязательному
 * полю объекта разрешаем `null`.
 */
const allowNull = (node) => {
  if (Array.isArray(node.anyOf)) {
    if (!node.anyOf.some((variant) => variant.type === 'null')) node.anyOf.push({ type: 'null' });
    return;
  }

  if (Array.isArray(node.enum) && !node.enum.includes(null)) node.enum.push(null);

  if (typeof node.type === 'string') {
    node.type = [node.type, 'null'];
  } else if (Array.isArray(node.type) && !node.type.includes('null')) {
    node.type.push('null');
  }
};

const allowNullForOptionalFields = (node) => {
  if (!node || typeof node !== 'object') return node;

  if (node.properties) {
    const required = node.required ?? [];
    Object.entries(node.properties).forEach(([key, child]) => {
      allowNullForOptionalFields(child);
      if (!required.includes(key)) allowNull(child);
    });
  }

  if (node.items) allowNullForOptionalFields(node.items);
  if (Array.isArray(node.anyOf)) node.anyOf.forEach(allowNullForOptionalFields);

  return node;
};

const { configSchema } = await bundleSchema();

const jsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://raw.githubusercontent.com/idefant/nerd-startpage/main/config.schema.json',
  title: 'Nerd Startpage config',
  ...allowNullForOptionalFields(z.toJSONSchema(configSchema, { target: 'draft-7', io: 'input' })),
};

writeFileSync(outFile, `${JSON.stringify(jsonSchema, null, 2)}\n`);

console.log(`JSON schema: ${path.relative(rootDir, outFile)}`);
