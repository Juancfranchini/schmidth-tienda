import { motivoDeRechazo, PESO_MAXIMO, tipoDeImagen } from './imagen-valida';

const con = (inicio: number[] | string, largo = 64) => {
  const b = Buffer.alloc(largo);
  (typeof inicio === 'string' ? Buffer.from(inicio, 'latin1') : Buffer.from(inicio)).copy(b);
  return b;
};

describe('tipoDeImagen', () => {
  it('reconoce las fotos por su contenido', () => {
    expect(tipoDeImagen(con([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpg');
    expect(tipoDeImagen(con([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]))).toBe('png');
    expect(tipoDeImagen(con('RIFF\0\0\0\0WEBPVP8 '))).toBe('webp');
    expect(tipoDeImagen(con('\0\0\0\x1cftypavif'))).toBe('avif');
  });

  it('rechaza SVG, GIF, PDF y texto aunque digan ser imagen', () => {
    expect(tipoDeImagen(con('<svg xmlns="http://www.w3.org/2000/svg"><script>'))).toBeNull();
    expect(tipoDeImagen(con('GIF89a'))).toBeNull();
    expect(tipoDeImagen(con('%PDF-1.7'))).toBeNull();
    expect(tipoDeImagen(Buffer.from('hola'))).toBeNull();
  });
});

describe('motivoDeRechazo', () => {
  it('deja pasar una foto normal', () => {
    expect(motivoDeRechazo({ buffer: con([0xff, 0xd8, 0xff]), size: 500_000 })).toBeNull();
  });

  it('explica por qué rechaza', () => {
    expect(motivoDeRechazo(undefined)).toMatch(/ningún archivo/);
    expect(motivoDeRechazo({ buffer: con([0xff, 0xd8, 0xff]), size: PESO_MAXIMO + 1 })).toMatch(/10 MB/);
    expect(motivoDeRechazo({ buffer: con('<svg>'), size: 100 })).toMatch(/no es una imagen/);
  });
});
