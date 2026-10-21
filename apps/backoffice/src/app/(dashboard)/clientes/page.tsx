'use client';

import { useCallback, useState } from 'react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { Drawer } from '@/components/ui/Drawer';
import { useToast } from '@/components/ui/Toast';
import type { Filtros } from './tipos';
import { CrmFiltros } from './CrmFiltros';
import { CrmResumen } from './CrmResumen';
import { CrmTabla } from './CrmTabla';
import { CrmFicha } from './CrmFicha';
import { descargarCsv } from './exportar';
import { FILTROS_INICIALES, motivoDelError, useContactos, useFicha } from './useCrm';

/**
 * Clientes: una fila por persona (mail), armada con sus cuentas, pedidos,
 * carritos abandonados y suscripción. Desde acá se hace seguimiento.
 */
export default function ClientesPage() {
  const { toast } = useToast();
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const { datos, cargando, error, recargar, traerTodas } = useContactos(filtros);
  const ficha = useFicha(abierto, recargar);

  const cambiar = useCallback((cambios: Partial<Filtros>) => setFiltros((f) => ({ ...f, pagina: 1, ...cambios })), []);
  const exportar = async () => {
    setExportando(true);
    try { descargarCsv(await traerTodas()); } catch (err) { toast(motivoDelError(err, 'No se pudo exportar'), 'error'); }
    setExportando(false);
  };

  if (!datos) return error ? <p className="p-6 text-sm text-rose-600">{error}</p> : <PageLoader />;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500">Cada persona una sola vez, con todo lo que hizo en la tienda.</p>
      </div>
      <CrmResumen resumen={datos.resumen} etapa={filtros.etapa} onEtapa={(etapa) => cambiar({ etapa })} />
      <CrmFiltros filtros={filtros} etiquetas={datos.etiquetas} exportando={exportando} onCambiar={cambiar} onExportar={exportar} />
      <div className={cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        {datos.contactos.length ? <CrmTabla contactos={datos.contactos} onAbrir={setAbierto} />
          : <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">No hay personas con esos filtros.</p>}
      </div>
      <Pagination currentPage={datos.pagina} totalPages={datos.paginas} onPageChange={(pagina) => setFiltros((f) => ({ ...f, pagina }))} />
      <Drawer abierto={!!abierto} onCerrar={() => setAbierto(null)} titulo="Ficha del cliente">
        <CrmFicha detalle={ficha.detalle} cargando={ficha.cargando} error={ficha.error}
          onGuardar={ficha.guardarFicha} onAgregarNota={ficha.agregarNota} onBorrarNota={ficha.borrarNota} />
      </Drawer>
    </div>
  );
}
