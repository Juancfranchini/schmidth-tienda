'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

/**
 * Aviso para las páginas legales que todavía tienen el texto base (sección con
 * `aRevisar: true`, ver backend src/site-sections/textos-base.ts). Al guardar
 * desde el editor la marca se pierde, porque el formulario no la manda.
 */
export default function AvisoRevision({ seccion }: { seccion: string }) {
  const [pendiente, setPendiente] = useState(false);

  useEffect(() => {
    api.get('/site-sections/' + encodeURIComponent(seccion))
      .then((res) => setPendiente((res.data?.data ?? res.data)?.aRevisar === true))
      .catch(() => setPendiente(false));
  }, [seccion]);

  if (!pendiente) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" role="status">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong>Texto base, a revisar.</strong> Es un borrador escrito para {''}
        la tienda: revisalo con un profesional antes de publicar y completá los datos de la empresa. Al guardar, deja de figurar como pendiente.
      </p>
    </div>
  );
}
