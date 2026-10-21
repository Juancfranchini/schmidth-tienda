'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, ImageIcon, X, Loader2 } from 'lucide-react';
import { ayudaDe, FORMATOS_ACEPTADOS, mensajeDeSubida, subirImagen, type DestinoImagen } from '@/lib/subirImagen';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

export function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  width?: number | string;
  height?: number;
  suggestion?: string;
  /** Dónde se usa la foto: define la medida recomendada y el aviso si queda chica. */
  destino?: DestinoImagen;
}

function ImagePreviewBox({ uploading, previewUrl, onClear }: { uploading: boolean; previewUrl: string | null; onClear: () => void }) {
  if (uploading) {
    return (
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#B3855C]" />
        <span className="text-xs">Subiendo...</span>
      </div>
    );
  }
  if (previewUrl) {
    return (
      <>
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-contain p-2"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
        >
          <X className="w-3 h-3" />
        </button>
      </>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1 text-gray-400">
      <ImageIcon className="w-10 h-10" />
      <span className="text-xs text-center px-2">Arrastra una imagen<br />o haz clic aqui</span>
    </div>
  );
}

function useImageUpload(onChange: (url: string) => void, destino: DestinoImagen) {
  const [uploading, setUploading] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setMensaje(null);
    try {
      const { url, aviso } = await subirImagen(file, destino);
      onChange(url);
      if (aviso) setMensaje({ texto: aviso, error: false });
    } catch (err) {
      setMensaje({ texto: mensajeDeSubida(err), error: true });
    } finally {
      setUploading(false);
    }
  }, [onChange, destino]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  return {
    uploading, dragOver, inputRef, handleDrop, mensaje,
    handleDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); },
    handleDragLeave: (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); },
    handleClick: () => inputRef.current?.click(),
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) uploadFile(file); },
  };
}

export default function ImageUpload({ value, onChange, placeholder = 'URL de imagen', width = 200, height = 200, suggestion, destino = 'general' }: Props) {
  const { uploading, dragOver, inputRef, handleDrop, handleDragOver, handleDragLeave, handleClick, handleFileChange, mensaje } = useImageUpload(onChange, destino);
  const ayuda = suggestion ?? ayudaDe(destino);
  const previewUrl = getImageUrl(value);

  return (
    <div className="flex-shrink-0 flex flex-col gap-3" style={{ width }}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={'relative rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all ' +
          (dragOver
            ? 'border-[#B3855C] bg-[#B3855C]/10'
            : previewUrl
              ? 'border-gray-200 bg-gray-100'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100')}
        style={{ width: '100%', height }}
      >
        <ImagePreviewBox uploading={uploading} previewUrl={previewUrl} onClear={() => onChange('')} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B3855C]/40 focus:border-[#B3855C]"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#B3855C]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <Upload className="w-3 h-3" />{uploading ? '...' : 'Subir'}
        </button>
      </div>
      <p className="text-[10px] text-gray-400 leading-tight">{ayuda}</p>
      {mensaje && (
        <p role={mensaje.error ? 'alert' : 'status'} className={'text-[11px] leading-tight ' + (mensaje.error ? 'text-red-600' : 'text-amber-700')}>{mensaje.texto}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={FORMATOS_ACEPTADOS}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
