import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsEmail, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ETAPAS } from '../crm.contactos';

const vacioANull = ({ value }: { value: unknown }) => (typeof value === 'string' && value.trim() === '' ? null : value);

export class FiltroContactosDto {
  @IsOptional() @IsString() @MaxLength(100)
  q?: string;

  @IsOptional() @IsIn(ETAPAS)
  etapa?: (typeof ETAPAS)[number];

  @IsOptional() @IsString() @MaxLength(30)
  etiqueta?: string;

  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean()
  conAccionVencida?: boolean;

  @IsOptional() @IsIn(['reciente', 'gastado', 'pedidos', 'nombre'])
  orden?: 'reciente' | 'gastado' | 'pedidos' | 'nombre';

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  pagina?: number;

  /** Hasta 1000: es lo que usa la exportación a Excel. */
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000)
  limite?: number;
}

export class EmailDto {
  @IsEmail() @MaxLength(254)
  email: string;
}

export class ActualizarFichaDto extends EmailDto {
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(30, { each: true })
  etiquetas?: string[];

  @IsOptional() @Transform(vacioANull) @IsString() @MaxLength(200)
  proximaAccion?: string | null;

  @IsOptional() @Transform(vacioANull) @IsDateString()
  proximaAccionFecha?: string | null;

  @IsOptional() @Transform(vacioANull) @IsDateString()
  ultimoContacto?: string | null;
}

export class NuevaNotaDto extends EmailDto {
  @IsString() @MinLength(1) @MaxLength(2000)
  texto: string;
}
