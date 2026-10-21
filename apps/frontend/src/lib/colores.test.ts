import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coloresDe, medidasDe } from './colores.ts';

const variante = (color: string | null, stock: number, extra: Record<string, unknown> = {}) => ({
  id: String(color) + stock, sku: 'X', size: '', color, colorHex: '#000000', imageUrl: 'foto-' + color, stock, active: true, ...extra,
});

test('los colores salen de las variantes activas, sin la variante base', () => {
  const colores = coloresDe({
    variants: [
      variante(null, 30, { isDefault: true }),
      variante('Negro', 10),
      variante('Camel', 0),
      variante('Bordó', 5, { active: false }),
    ],
  });
  assert.deepEqual(colores.map((c) => c.nombre), ['Negro', 'Camel']);
  assert.equal(colores[1].stock, 0);
  assert.equal(colores[0].imagen, 'foto-Negro');
});

test('un color repetido en dos variantes aparece una vez y suma el stock', () => {
  const colores = coloresDe({ variants: [variante('Negro', 2), variante('Negro', 3)] });
  assert.equal(colores.length, 1);
  assert.equal(colores[0].stock, 5);
});

test('sin variantes no hay colores', () => {
  assert.deepEqual(coloresDe({}), []);
});

test('medidas: ancho × alto con unidad, o null si falta una', () => {
  assert.equal(medidasDe({ dimensionWidth: 40, dimensionHeight: 20, dimensionUnit: 'cm' }), '40 × 20 cm');
  assert.equal(medidasDe({ dimensionWidth: 25, dimensionHeight: 35 }), '25 × 35 cm');
  assert.equal(medidasDe({ dimensionWidth: 40, dimensionHeight: null }), null);
});
