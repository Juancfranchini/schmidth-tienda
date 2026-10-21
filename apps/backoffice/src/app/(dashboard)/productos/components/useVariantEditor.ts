import { useState } from 'react';
import { FORMATOS_ACEPTADOS, mensajeDeSubida, subirImagen } from '@/lib/subirImagen';
import { VariantData } from './VariantEditor';

export function useVariantEditor(variants: VariantData[], onChange: (variants: VariantData[]) => void) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addVariant = () => {
    onChange([...variants, { sku: '', size: '', color: '', dimensions: '', dimensionUnit: 'cm', weightUnit: 'kg', imageUrl: '', images: [], stock: 0 }]);
  };

  const updateVariant = (index: number, field: keyof VariantData, value: any) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    onChange(newVariants);
  };

  const removeVariant = (index: number) => onChange(variants.filter((_, i) => i !== index));

  const addImage = (index: number) => {
    const newVariants = [...variants];
    newVariants[index].images = [...(newVariants[index].images || []), ''];
    onChange(newVariants);
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images = (newVariants[variantIndex].images || []).filter((_, i) => i !== imageIndex);
    onChange(newVariants);
  };

  const updateImage = (variantIndex: number, imageIndex: number, value: string) => {
    const newVariants = [...variants];
    const imgs = [...(newVariants[variantIndex].images || [])];
    imgs[imageIndex] = value;
    newVariants[variantIndex].images = imgs;
    onChange(newVariants);
  };

  const handleUpload = async (variantIndex: number, field: 'imageUrl' | 'images', imageIndex?: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = FORMATOS_ACEPTADOS;
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingIndex(variantIndex);
      try {
        const { url, aviso } = await subirImagen(file, 'producto');
        if (aviso) alert(aviso);
        if (field === 'imageUrl') updateVariant(variantIndex, 'imageUrl', url);
        else if (imageIndex !== undefined) updateImage(variantIndex, imageIndex, url);
      } catch (err) {
        alert(mensajeDeSubida(err));
      } finally {
        setUploadingIndex(null);
      }
    };
    input.click();
  };

  return { uploadingIndex, addVariant, updateVariant, removeVariant, addImage, removeImage, updateImage, handleUpload };
}
