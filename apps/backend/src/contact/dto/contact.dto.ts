import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const recortar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/** Formulario de contacto de la tienda. Antes el body llegaba sin validar. */
export class ContactDto {
  @ApiProperty() @Transform(recortar) @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @ApiProperty() @Transform(recortar) @IsEmail() @MaxLength(160) email: string;
  @ApiPropertyOptional() @Transform(recortar) @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiPropertyOptional() @Transform(recortar) @IsOptional() @IsString() @MaxLength(160) subject?: string;
  @ApiProperty() @Transform(recortar) @IsString() @IsNotEmpty() @MaxLength(4000) message: string;
}

/** Botón de arrepentimiento (Res. 424/2020): datos mínimos para identificar la compra. */
export class ArrepentimientoDto {
  @ApiProperty() @Transform(recortar) @IsString() @IsNotEmpty() @MaxLength(120) nombre: string;
  @ApiProperty() @Transform(recortar) @IsEmail() @MaxLength(160) email: string;
  @ApiPropertyOptional() @Transform(recortar) @IsOptional() @IsString() @MaxLength(40) telefono?: string;
  @ApiProperty({ description: 'Número de pedido' }) @Transform(recortar) @IsString() @IsNotEmpty() @MaxLength(60) pedido: string;
  @ApiPropertyOptional() @Transform(recortar) @IsOptional() @IsString() @MaxLength(2000) motivo?: string;
}
