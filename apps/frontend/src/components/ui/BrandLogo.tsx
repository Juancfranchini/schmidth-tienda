import { MARCA } from '@/config/marca';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Logo del branding: el nombre en Playfair Display (la serif de títulos), en mayúsculas espaciadas,
// como en el catálogo de la marca. Toma el color del texto (currentColor), así
// sirve sobre fondo claro y oscuro. Reemplazar por el archivo real cuando exista.
const TAMANIO: Record<NonNullable<BrandLogoProps['size']>, string> = {
  xs: 'text-lg',
  sm: 'text-2xl',
  md: 'text-[1.6rem] lg:text-[2rem]',
  lg: 'text-5xl',
  xl: 'text-6xl',
};

export default function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  return (
    <span className={'block select-none font-display font-normal leading-none tracking-[0.06em] ' + TAMANIO[size] + ' ' + className}>
      {MARCA.nombreLogo}
    </span>
  );
}
