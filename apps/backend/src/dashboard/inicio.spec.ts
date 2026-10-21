import { comparar, pasosPuestaEnMarcha, tareasDelDia, variacion } from './inicio';

describe('Inicio del backoffice', () => {
  it('"para hacer hoy" muestra solo lo que tiene pendientes, con el plural correcto', () => {
    const tareas = tareasDelDia({ porCobrar: 1, paraPreparar: 3, carritosParaContactar: 0, stockBajo: 0, linksSinPagar: 0, solicitudesAbiertas: 0 });
    expect(tareas.map((t) => t.clave)).toEqual(['paraPreparar', 'porCobrar']);
    expect(tareas[0].titulo).toBe('pedidos para preparar');
    expect(tareas[1].titulo).toBe('pedido por cobrar');
    expect(tareas[0].href).toBe('/pedidos?etapa=enviar');
  });

  it('sin pendientes no hay tareas', () => {
    expect(tareasDelDia({ porCobrar: 0, paraPreparar: 0, carritosParaContactar: 0, stockBajo: 0, linksSinPagar: 0, solicitudesAbiertas: 0 })).toEqual([]);
  });

  it('la variación no se inventa cuando el período anterior fue cero', () => {
    expect(variacion(150, 100)).toBe(50);
    expect(variacion(50, 100)).toBe(-50);
    expect(variacion(100, 0)).toBeNull();
  });

  it('compara ventas, pedidos y ticket promedio', () => {
    const r = comparar({ ventas: 200000, pedidos: 4 }, { ventas: 100000, pedidos: 4 });
    expect(r.ventas).toEqual({ valor: 200000, variacion: 100 });
    expect(r.pedidos.variacion).toBe(0);
    expect(r.ticket).toEqual({ valor: 50000, variacion: 100 });
  });

  it('la puesta en marcha marca cada paso según su estado', () => {
    const pasos = pasosPuestaEnMarcha({
      pagos: true, mails: false, imagenes: true, dominio: false, datosMarca: false, fotosReales: false, legalesRevisados: false, meta: false,
    });
    expect(pasos.find((p) => p.clave === 'pagos')?.listo).toBe(true);
    expect(pasos.find((p) => p.clave === 'mails')?.listo).toBe(false);
    expect(pasos.every((p) => p.href.startsWith('/'))).toBe(true);
  });
});
