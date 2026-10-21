'use client';

import { Search, SlidersHorizontal, ListRestart } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAdvancedSearch: () => void;
  hasAdvancedFilters: boolean;
  onClearFilters: () => void;
}

export default function ProductSearchBar({ value, onChange, onAdvancedSearch, hasAdvancedFilters, onClearFilters }: Props) {
  return (
    <div className="flex w-full">
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, SKU, marca o categoría..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-[#B3855C]/50 rounded-l-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B3855C]/40 focus:border-[#B3855C] transition-all"
        />
      </div>
      {hasAdvancedFilters ? (
        <button onClick={onClearFilters} className="flex items-center gap-1 px-3 py-2 bg-[#B3855C] text-[#1A1A1A] rounded-r-lg text-sm font-medium hover:bg-[#9E7149] transition-colors border border-[#B3855C] shrink-0">
          <ListRestart className="w-4 h-4" />Limpiar
        </button>
      ) : (
        <button onClick={onAdvancedSearch} className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-r-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200 border-l-0 shrink-0" title="Busqueda avanzada">
          <SlidersHorizontal className="w-4 h-4" />Avanzada
        </button>
      )}
    </div>
  );
}
