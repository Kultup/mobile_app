import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Helpers } from '../common/utils/helpers';

@Injectable()
export class FilesService {
  private uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_DEST') || './uploads';
    // Створити папку якщо не існує
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = this.configService.get<string>('ALLOWED_IMAGE_TYPES')?.split(',') || ['jpg', 'jpeg', 'png'];
    const ext = Helpers.getFileExtension(file.originalname);
    
    if (!allowedTypes.includes(ext)) {
      throw new BadRequestException(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(this.uploadPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      id: filename,
      url: `/api/v1/files/${filename}`,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadVideo(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = this.configService.get<string>('ALLOWED_VIDEO_TYPES')?.split(',') || ['mp4', 'mov'];
    const ext = Helpers.getFileExtension(file.originalname);
    
    if (!allowedTypes.includes(ext)) {
      throw new BadRequestException(`Video type not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException('Video size exceeds 50MB limit');
    }

    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(this.uploadPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    // TODO: Generate thumbnail for video

    return {
      id: filename,
      url: `/api/v1/files/video/${filename}`,
      thumbnail_url: `/api/v1/files/${filename}_thumb.jpg`, // TODO: Generate actual thumbnail
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async getFile(id: string) {
    const filepath = path.join(this.uploadPath, id);
    
    if (!fs.existsSync(filepath)) {
      throw new BadRequestException('File not found');
    }

    return {
      path: filepath,
      stream: fs.createReadStream(filepath),
    };
  }
}

