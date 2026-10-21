import { Modal } from '@/components/ui/Modal';

interface Product {
  id: string; name: string; videoUrl?: string;
  highlightsTitle?: string; highlightsDescription?: string;
  highlights?: string[];
  specs?: { icon: string; title: string; value: string }[];
  relatedVideos?: { title: string; url: string }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Product | null;
}

export default function DetalleModal({ isOpen, onClose, item }: Props) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Detalle: ' + item.name} size="lg">
      <div className="space-y-4 text-sm">
        <div><p className="text-xs text-gray-400">Video Principal</p><p className="text-gray-900">{item.videoUrl || '-'}</p></div>
        <div><p className="text-xs text-gray-400">Videos Relacionados ({(item.relatedVideos || []).length})</p>{(item.relatedVideos || []).map((v, i) => <p key={i} className="text-gray-600"> {v.title}</p>)}</div>
        <div><p className="text-xs text-gray-400">Título Highlights</p><p className="text-gray-900">{item.highlightsTitle || '-'}</p></div>
        <div><p className="text-xs text-gray-400">Descripción Highlights</p><p className="text-gray-900">{item.highlightsDescription || '-'}</p></div>
        <div><p className="text-xs text-gray-400">Especificaciones</p>{(item.specs || []).map((s, i) => <p key={i} className="text-gray-600"> {s.title}: {s.value}</p>)}</div>
        <div><p className="text-xs text-gray-400">Highlights</p>{(item.highlights || []).map((h, i) => <p key={i} className="text-gray-600"> {h}</p>)}</div>
      </div>
    </Modal>
  );
}
