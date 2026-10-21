'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSiteSection } from '@/lib/api';
import ReturnPolicyHero from './ReturnPolicyHero';
import { ReturnPolicyBenefits, ReturnPolicyConditionsOk, ReturnPolicySteps, ReturnPolicyConditionsNo, ReturnPolicyHelp } from './ReturnPolicySections';
import { MARCA } from '@/config/marca';

export default function PoliticaDevoluciónPage() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSiteSection('politica_devolución');
        setData(res?.data || {});
      } catch {}
    };
    load();
  }, []);

  const hero = {
    chip: data.chip || MARCA.textos.devoluciones.chip,
    title: data.title || MARCA.textos.devoluciones.title,
    description: data.description || MARCA.textos.devoluciones.description,
  };

  const benefits = data.benefits?.length > 0 ? data.benefits : MARCA.textos.devoluciones.benefits;

  const conditionsOk = data.conditionsOk?.length > 0 ? data.conditionsOk : MARCA.textos.devoluciones.conditionsOk;

  const conditionsNo = data.conditionsNo?.length > 0 ? data.conditionsNo : MARCA.textos.devoluciones.conditionsNo;

  const steps = data.steps?.length > 0 ? data.steps : MARCA.textos.devoluciones.steps;

  const help = {
    title: data.helpTitle || MARCA.textos.devoluciones.helpTitle,
    description: data.helpDescription || MARCA.textos.devoluciones.helpDescription,
    schedule: data.helpSchedule || MARCA.textos.horario,
    whatsapp: data.helpWhatsapp || MARCA.whatsapp,
    email: data.helpEmail || MARCA.email.contacto,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-panel to-page text-fg">
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-fg-muted">
          <Link href="/" className="hover:text-fg transition-colors">Inicio</Link><span>/</span>
          <span className="text-fg">Politica de Devolución</span>
        </div>
      </div>

      <ReturnPolicyHero hero={hero} />
      <ReturnPolicyBenefits benefits={benefits} />
      <ReturnPolicyConditionsOk conditions={conditionsOk} />
      <ReturnPolicySteps steps={steps} />
      <ReturnPolicyConditionsNo conditions={conditionsNo} />
      <ReturnPolicyHelp help={help} />
    </div>
  );
}
