// Upload de imágenes para productos, banners, categorías, etc.
// POST /api/uploads/image  sube una imagen a Cloudinary y retorna { url: "https://res.cloudinary.com/..." }
// Requiere autenticación ADMIN
// El campo del form-data debe llamarse 'file'. Solo JPG, PNG, WebP o AVIF de hasta 10 MB
// (ver imagen-valida.ts); se guardan con el lado más largo en 2000 px como máximo.

import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UploadsService } from './uploads.service';
import { motivoDeRechazo, PESO_MAXIMO } from './imagen-valida';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @ApiConsumes('multipart/form-data')
  // El límite corta el archivo antes de cargarlo entero en memoria.
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: PESO_MAXIMO, files: 1 } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const motivo = motivoDeRechazo(file);
    if (motivo) throw new BadRequestException(motivo);
    const url = await this.uploadsService.uploadImage(file);
    return { url };
  }
}