import { Controller, Post, Get, Param, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }

  @Post('upload-video')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadVideo(file);
  }

  @Get(':id')
  @Public()
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.getFile(id);
    res.setHeader('Content-Type', 'application/octet-stream');
    file.stream.pipe(res);
  }
}

