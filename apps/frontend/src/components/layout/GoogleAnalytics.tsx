'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { codigoDePruebaMeta, esSitioDeProduccion } from '@/lib/metaNavegador';
import { modoPruebaActivo } from '@/lib/modoPrueba';

/**
 * ID de medición de Google Analytics 4 (NEXT_PUBLIC_GA_MEASUREMENT_ID). No es
 * un secreto: va en el HTML. Sin ID cargado no se instala: el que venía por
 * defecto era la propiedad de HomePadel.
 */
const ID_MEDICION = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim();

/**
 * Google Analytics 4. Mismas reglas que el Pixel de Meta: solo en la tienda de producción, y
 * nunca en modo prueba ni probando eventos de Meta, para que las visitas
 * propias y las pruebas no ensucien los números. El cambio de página dentro
 * del sitio lo registra la propia etiqueta (medición mejorada).
 */
export default function GoogleAnalytics() {
  // Se decide después de montar: el servidor no sabe en qué sitio ni en qué modo está el navegador.
  const [activo, setActivo] = useState(false);
  useEffect(() => {
    setActivo(Boolean(ID_MEDICION) && esSitioDeProduccion() && !modoPruebaActivo() && !codigoDePruebaMeta());
  }, []);

  if (!activo) return null;
  return (
    <>
      <Script src={'https://www.googletagmanager.com/gtag/js?id=' + ID_MEDICION} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ID_MEDICION}');`}
      </Script>
    </>
  );
}
