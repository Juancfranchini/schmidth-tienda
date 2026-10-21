import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitud, TipoSolicitud } from '@prisma/client';

const recortar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/** Solicitud cargada a mano desde el panel (por ejemplo, un cambio pedido por WhatsApp). */
export class CrearSolicitudDto {
  @ApiProperty({ enum: TipoSolicitud }) @IsEnum(TipoSolicitud) tipo: TipoSolicitud;
  @ApiProperty() @Transform(recortar) @IsString() @IsNotEmpty() @MaxLength(120) nombre: string;
  @ApiProperty() @Transform(recortar) @IsEmail() @MaxLength(160) email: string;
  @ApiPropertyOptional() @Transform(recortar) @IsOptional() @IsString() @MaxLength(40) telefono?: string;
  @ApiProperty() @Transform(recortar) @IsString() @IsNotEmpty() @MaxLength(60) pedidoNumero: string;
  @ApiPropertyOptional() @Transform(recortar) @IsOptional() @IsString() @MaxLength(2000) motivo?: string;
}

export class ActualizarSolicitudDto {
  @ApiPropertyOptional({ enum: EstadoSolicitud }) @IsOptional() @IsEnum(EstadoSolicitud) estado?: EstadoSolicitud;
  @ApiPropertyOptional() @Transform(recortar) @IsOptional() @IsString() @MaxLength(4000) notas?: string;
}

export class ListarSolicitudesDto {
  @ApiPropertyOptional({ enum: EstadoSolicitud }) @IsOptional() @IsEnum(EstadoSolicitud) estado?: EstadoSolicitud;
}
