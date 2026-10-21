import type { Product } from '@/types';
import { medidasDe } from '@/lib/colores';
import SiluetaCartera from '@/components/ui/SiluetaCartera';

interface Detalle { title: string; subtitle: string }

function detallesDe(product: Product): Detalle[] {
  const crudos = Array.isArray(product.features) ? product.features : [];
  return crudos.filter((d): d is Detalle => !!d && typeof d === 'object' && 'title' in d && 'subtitle' in d);
}

/**
 * Medidas, material y características. Las medidas van también dibujadas con
 * sus cotas: un "40 × 20 cm" se entiende mejor al lado de un celular.
 */
export default function ProductDetalles({ product }: { product: Product }) {
  const medidas = medidasDe(product);
  const detalles = detallesDe(product);
  const filas: Detalle[] = [
    ...(medidas ? [{ title: 'Medidas', subtitle: medidas + ' (ancho × alto)' }] : []),
    ...(product.material ? [{ title: 'Material', subtitle: product.material }] : []),
    ...detalles,
  ];
  if (filas.length === 0) return null;

  return (
    <section className="border-t border-line pt-6">
      <h2 className="rotulo mb-4 !font-sans text-fg">Detalles</h2>
      <div className="flex items-end gap-6">
        <dl className="flex-1 divide-y divide-line text-sm">
          {filas.map((f) => (
            <div key={f.title} className="flex justify-between gap-4 py-2.5">
              <dt className="text-fg-muted">{f.title}</dt>
              <dd className="text-right text-fg">{f.subtitle}</dd>
            </div>
          ))}
        </dl>
        {product.dimensionWidth && product.dimensionHeight && (
          <div className="hidden shrink-0 sm:block" aria-hidden>
            <SiluetaCartera ancho={product.dimensionWidth} alto={product.dimensionHeight} escala={2.6} cotas />
          </div>
        )}
      </div>
    </section>
  );
}
