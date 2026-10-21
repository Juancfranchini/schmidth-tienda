// Copia packages/marca/marca.json a src/config/marca.ts de cada app.
//
// Las tres apps se construyen por separado (Railway arma el backend con
// apps/backend como contexto de Docker, Vercel cada app Next desde su
// carpeta), así que ninguna puede importar un archivo de afuera. El JSON es
// la única fuente; el archivo generado se commitea.
//
//   node scripts/sync-marca.mjs          → regenera
//   node scripts/sync-marca.mjs --check  → falla si alguno quedó desactualizado (CI)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const APPS = ['backend', 'frontend', 'backoffice'];

const marca = JSON.parse(readFileSync(join(raiz, 'packages/marca/marca.json'), 'utf8'));
const contenido =
  '// Generado por scripts/sync-marca.mjs desde packages/marca/marca.json.\n' +
  '// No editar a mano: cambiar el JSON y volver a correr el script.\n\n' +
  'export const MARCA = ' + JSON.stringify(marca, null, 2) + ' as const;\n';

const soloChequear = process.argv.includes('--check');
const desactualizadas = [];

for (const app of APPS) {
  const destino = join(raiz, 'apps', app, 'src/config/marca.ts');
  const actual = existsSync(destino) ? readFileSync(destino, 'utf8') : '';
  if (actual === contenido) continue;
  if (soloChequear) {
    desactualizadas.push(app);
    continue;
  }
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, contenido);
  console.log('marca actualizada en apps/' + app);
}

if (desactualizadas.length > 0) {
  console.error('src/config/marca.ts desactualizado en: ' + desactualizadas.join(', ') + '. Correr: node scripts/sync-marca.mjs');
  process.exit(1);
}
