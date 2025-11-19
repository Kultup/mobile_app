import { Controller, Post, Get, Param, Query, Body, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderType') folderType?: 'questions' | 'articles',
  ) {
    return this.filesService.uploadFile(file, folderType || 'articles');
  }

  @Post('upload-video')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadVideo(file);
  }

  @Get('video/:id(*)')
  @Public()
  async getVideo(@Param('id') id: string, @Res() res: Response, @Query('quality') quality?: string) {
    try {
      const file = await this.filesService.getVideo(id, quality);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      file.stream.pipe(res);
    } catch (error) {
      console.error('[FilesController] Error serving video:', id, error);
      res.status(404).json({ message: 'Video not found' });
    }
  }

  @Get('*')
  @Public()
  async getFile(@Param('0') filePath: string, @Res() res: Response) {
    try {
      // Видаляємо початковий слеш, якщо є
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      
      // Перевіряємо, чи це не video endpoint
      if (cleanPath.startsWith('video/')) {
        // Це обробляється окремим endpoint
        res.status(404).json({ message: 'Use /files/video/:id endpoint' });
        return;
      }
      
      const file = await this.filesService.getFile(cleanPath);
      
      // Визначаємо MIME тип на основі розширення
      // Беремо останню частину після останнього слеша для отримання імені файлу
      const filename = cleanPath.split('/').pop() || cleanPath;
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === 'jpg' || ext === 'jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === 'png') {
        contentType = 'image/png';
      } else if (ext === 'gif') {
        contentType = 'image/gif';
      } else if (ext === 'webp') {
        contentType = 'image/webp';
      } else if (ext === 'pdf') {
        contentType = 'application/pdf';
      } else if (ext === 'mp4') {
        contentType = 'video/mp4';
      } else if (ext === 'mov') {
        contentType = 'video/quicktime';
      }
      
      // Додаємо CORS заголовки для статичних файлів
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      file.stream.pipe(res);
    } catch (error) {
      console.error('[FilesController] Error serving file:', filePath, error);
      res.status(404).json({ message: 'File not found' });
    }
  }
}

