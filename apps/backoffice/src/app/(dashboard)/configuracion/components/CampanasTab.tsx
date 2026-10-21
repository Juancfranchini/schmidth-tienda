'use client';

import { Users, Plus, Send } from 'lucide-react';
import CampaignModal from './CampaignModal';

interface CampanasTabProps {
  campaigns: any[];
  templates: any[];
  recipients: string[];
  campaignModal: boolean;
  setCampaignModal: (open: boolean) => void;
  onCreate: (data: any) => void;
  onSend: (id: string) => void;
  onLoadRecipients: (source: 'all' | 'customers' | 'newsletter') => void;
}

export default function CampanasTab({ campaigns, templates, recipients, campaignModal, setCampaignModal, onCreate, onSend, onLoadRecipients }: CampanasTabProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Users className="w-4 h-4 text-gray-500" />Campañas</h2>
        <button onClick={() => setCampaignModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#B3855C] text-[#1A1A1A] hover:bg-[#9E7149] rounded-lg font-semibold text-sm hover:bg-[#9E7149]">
          <Plus className="w-4 h-4" />Nueva campaña
        </button>
      </div>
      <div className="space-y-2">
        {campaigns.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No hay campañas creadas</p>
        ) : (
          campaigns.map((camp) => (
            <div key={camp.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{camp.name}</p>
                <p className="text-xs text-gray-400">{camp.recipients?.length || 0} destinatarios</p>
                <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + (camp.status === 'SENT' ? 'bg-green-100 text-green-700' : camp.status === 'SENDING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600')}>
                  {camp.status === 'SENT' ? 'Enviada' : camp.status === 'SENDING' ? 'Enviando...' : 'Borrador'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {camp.status !== 'SENT' && (
                  <button onClick={() => onSend(camp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-lg text-xs font-medium hover:bg-[#2A2A2A]">
                    <Send className="w-3 h-3" />Enviar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {campaignModal && (
        <CampaignModal
          templates={templates}
          recipients={recipients}
          onClose={() => setCampaignModal(false)}
          onLoadRecipients={onLoadRecipients}
          onCreate={onCreate}
        />
      )}
    </div>
  );
}