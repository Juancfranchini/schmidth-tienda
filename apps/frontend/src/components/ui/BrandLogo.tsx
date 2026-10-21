import Image from 'next/image';
import { MARCA } from '@/config/marca';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

// Logo de la marca (MARCA.logo.archivo, SVG): el ancho/alto de cada tamaño
// respeta su proporción (5:1) para que next/image no la deforme.
const SIZE_MAP: Record<string, [number, number]> = {
  xs: [80, 16],
  sm: [110, 22],
  md: [150, 30],
  lg: [190, 38],
  xl: [240, 48],
};

export default function BrandLogo({ size = 'md', className = '', priority = false }: BrandLogoProps) {
  const [width, height] = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <Image
      src={MARCA.logo.archivo}
      alt={MARCA.nombre}
      width={width}
      height={height}
      priority={priority}
      // Las letras del logo son blancas: sobre el tema claro una sombra suave las despega del fondo.
      className={`object-contain select-none light:drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.45)] ${className}`}
    />
  );
}
