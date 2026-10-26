'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { PestanasSeccion } from '@/components/layout/PestanasSeccion';
import { BarraInferior } from '@/components/layout/BarraInferior';
import { ToastProvider } from '@/components/ui/Toast';
import { esRutaOculta } from '@/components/layout/navegacion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const oculta = esRutaOculta(pathname);

  // Módulo apagado en la configuración de marca: se vuelve al inicio.
  useEffect(() => { if (oculta) router.replace('/'); }, [oculta, router]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#F6F6F4]">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <DashboardHeader
            onMenuClick={() => setMobileOpen(true)}
            onCollapseToggle={() => setCollapsed(!collapsed)}
            collapsed={collapsed}
          />
          <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6">
            <div className="mx-auto w-full max-w-[1400px]">
              {oculta ? null : (
                <>
                  <PestanasSeccion />
                  {children}
                </>
              )}
            </div>
          </main>
          <BarraInferior onMenuClick={() => setMobileOpen(true)} />
        </div>
      </div>
    </ToastProvider>
  );
}
