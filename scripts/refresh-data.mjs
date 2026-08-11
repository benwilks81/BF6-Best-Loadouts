/**
 * DEPRECATED — use scripts/refresh_data.py (via refresh-data.sh).
 * This Node path skips ETag caching, schema validation, host-limited redirects, and atomic writes.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'data');
mkdirSync(outDir, { recursive: true });

const files = [
  'weapons.json',
  'attachments.json',
  'balance_tables.json',
  'ammo.json',
  'ballistics.json',
  'recoil_decay.json',
];

const base = 'https://raw.githubusercontent.com/raymdl/BF6-Weapon-Analyzer/main/data/';

for (const file of files) {
  const res = await fetch(base + file);
  if (!res.ok) throw new Error(`Failed ${file}: ${res.status}`);
  const text = await res.text();
  writeFileSync(join(outDir, file), text);
  console.log(`updated data/${file} (${text.length} bytes)`);
}

const embed = spawnSync(process.execPath, [join(root, 'scripts', 'embed-data.mjs')], {
  stdio: 'inherit',
});
if (embed.status !== 0) process.exit(embed.status ?? 1);
