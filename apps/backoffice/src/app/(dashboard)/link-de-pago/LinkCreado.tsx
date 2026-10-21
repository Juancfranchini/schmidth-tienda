'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { MARCA } from '@/config/marca';
import type { DatosDelLink } from './useLinkDePago';

/** wa.me exige solo dígitos con código de país: 11 1234-5678 → 5491112345678. Sin teléfono, WhatsApp pide elegir el chat. */
export function enlaceWhatsapp(url: string, datos: DatosDelLink): string {
  const saludo = 'Hola' + (datos.nombre ? ' ' + datos.nombre.split(' ')[0] : '') + '!';
  const texto = saludo + ' Te paso el link para completar tu compra en ' + MARCA.nombre + ': ' + url;
  const digitos = (datos.telefono || '').replace(/\D/g, '').replace(/^0+/, '');
  const numero = digitos.length >= 8 ? (digitos.startsWith('54') ? digitos : '549' + digitos) : '';
  return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
}

/** El link recién creado, listo para copiar o mandar. Vence a los 7 días. */
export default function LinkCreado({ url, datos }: { url: string; datos: DatosDelLink }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { setCopiado(false); }
  };
  const boton = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors';
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
      <p className="text-sm font-semibold text-green-900">Link creado. Vence en 7 días.</p>
      <p className="mt-1 break-all rounded bg-white px-2 py-1.5 font-mono text-xs text-gray-700">{url}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={enlaceWhatsapp(url, datos)} target="_blank" rel="noopener noreferrer" className={boton + ' bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'}>
          <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
        </a>
        <button type="button" onClick={copiar} className={boton + ' border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}>
          {copiado ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}{copiado ? 'Copiado' : 'Copiar'}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className={boton + ' border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}>
          <ExternalLink className="h-4 w-4" /> Ver como clienta
        </a>
      </div>
    </div>
  );
}
