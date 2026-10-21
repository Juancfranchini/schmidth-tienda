'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
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
      <div className="flex min-h-screen bg-gray-50">
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
          <main className="flex-1 p-6 overflow-auto">{oculta ? null : children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
