/**
 * El producto de Schmidt usa material y medidas; los campos de pádel (forma,
 * nivel, género, rendimiento, comparador) ya no se pueden escribir. Las
 * columnas siguen en la base, pero el ValidationPipe global
 * (`forbidNonWhitelisted`) rechaza la petición si alguien las manda.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';

const BASE = { name: 'Astra', price: 60000, sku: 'AST', stock: 30 };

async function errores(body: Record<string, unknown>) {
  const dto = plainToInstance(CreateProductDto, body);
  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
}

describe('CreateProductDto', () => {
  it('acepta material y medidas', async () => {
    const e = await errores({ ...BASE, material: 'Eco cuero', dimensionWidth: 40, dimensionHeight: 20, dimensionUnit: 'cm' });
    expect(e).toHaveLength(0);
  });

  it.each(['shape', 'gender', 'level', 'performanceStats', 'compareData', 'showPerformance', 'showCompare'])(
    'rechaza el campo de pádel %s',
    async (campo) => {
      const e = await errores({ ...BASE, [campo]: campo.startsWith('show') ? true : 'x' });
      expect(e.map((x) => x.property)).toContain(campo);
    },
  );
});
