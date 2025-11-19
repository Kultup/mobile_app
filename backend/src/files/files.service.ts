import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Helpers } from '../common/utils/helpers';
import ffmpeg from 'fluent-ffmpeg';

interface VideoQuality {
  name: string;
  resolution: string;
  bitrate: string;
  suffix: string;
}

const VIDEO_QUALITIES: VideoQuality[] = [
  { name: '1080p', resolution: '1920x1080', bitrate: '5000k', suffix: '_1080p' },
  { name: '720p', resolution: '1280x720', bitrate: '2500k', suffix: '_720p' },
  { name: '480p', resolution: '854x480', bitrate: '1000k', suffix: '_480p' },
  { name: '360p', resolution: '640x360', bitrate: '500k', suffix: '_360p' },
];

@Injectable()
export class FilesService {
  private uploadPath: string;
  private readonly logger = new Logger(FilesService.name);

  // Папки для групування файлів
  private readonly folders = {
    questions: 'questions',
    articles: 'articles',
    videos: 'videos',
    images: 'images',
    pdfs: 'pdfs',
  };

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_DEST') || './uploads';
    // Створити основну папку якщо не існує
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
    // Створити підпапки для групування
    Object.values(this.folders).forEach((folder) => {
      const folderPath = path.join(this.uploadPath, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    });
  }

  /**
   * Отримує шлях до папки на основі типу файлу
   */
  private getFolderPath(folderType: 'questions' | 'articles' | 'videos' | 'images' | 'pdfs'): string {
    return path.join(this.uploadPath, this.folders[folderType]);
  }

  private async generateVideoThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:01'], // Беремо кадр на 1 секунді
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '640x360', // Розмір thumbnail
        })
        .on('end', () => {
          this.logger.log(`Video thumbnail generated: ${thumbnailPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`Error generating video thumbnail: ${err.message}`);
          reject(err);
        });
    });
  }

  private async convertVideoToQuality(
    inputPath: string,
    outputPath: string,
    quality: VideoQuality,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(quality.resolution)
        .videoBitrate(quality.bitrate)
        .format('mp4')
        .outputOptions([
          '-preset medium',
          '-crf 23',
          '-movflags +faststart', // Для швидшого початку відтворення
        ])
        .on('start', (commandLine) => {
          this.logger.log(`Converting video to ${quality.name}: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            this.logger.debug(`Conversion progress: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          this.logger.log(`Video converted to ${quality.name}: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`Error converting video to ${quality.name}: ${err.message}`);
          reject(err);
        })
        .save(outputPath);
    });
  }

  private async getVideoInfo(videoPath: string): Promise<{ width: number; height: number; duration: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          duration: metadata.format.duration || 0,
        });
      });
    });
  }

  async uploadFile(file: Express.Multer.File, folderType: 'questions' | 'articles' = 'articles') {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const ext = Helpers.getFileExtension(file.originalname);
    
    // Перевіряємо, чи це зображення
    const allowedImageTypes = this.configService.get<string>('ALLOWED_IMAGE_TYPES')?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const isImage = allowedImageTypes.includes(ext);
    
    // Перевіряємо, чи це PDF
    const isPdf = ext === 'pdf';
    
    if (!isImage && !isPdf) {
      throw new BadRequestException(`File type not allowed. Allowed: ${allowedImageTypes.join(', ')}, pdf`);
    }

    // Для PDF більший ліміт розміру
    const maxSize = isPdf ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB для PDF, 10MB для зображень
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${isPdf ? '50' : '10'}MB limit`);
    }

    // Визначаємо папку для збереження
    const targetFolder = isPdf ? 'pdfs' : (isImage ? 'images' : folderType);
    const folderPath = this.getFolderPath(targetFolder as any);
    
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(folderPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    // Повертаємо URL з урахуванням папки
    const relativePath = path.join(this.folders[targetFolder as keyof typeof this.folders], filename).replace(/\\/g, '/');
    
    return {
      id: filename,
      url: `/api/v1/files/${relativePath}`,
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

    // Зберігаємо відео в папці videos
    const videosFolder = this.getFolderPath('videos');
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(videosFolder, filename);

    fs.writeFileSync(filepath, file.buffer);

    // Отримуємо інформацію про відео
    let videoInfo: { width: number; height: number; duration: number } | null = null;
    try {
      videoInfo = await this.getVideoInfo(filepath);
    } catch (error) {
      this.logger.warn(`Failed to get video info: ${error.message}`);
    }

    // Генерація thumbnail для відео (зберігаємо в папці images)
    let thumbnailUrl: string | null = null;
    try {
      const imagesFolder = this.getFolderPath('images');
      const thumbnailFilename = `${filename}_thumb.jpg`;
      const thumbnailPath = path.join(imagesFolder, thumbnailFilename);
      await this.generateVideoThumbnail(filepath, thumbnailPath);
      const thumbnailRelativePath = path.join(this.folders.images, thumbnailFilename).replace(/\\/g, '/');
      thumbnailUrl = `/api/v1/files/${thumbnailRelativePath}`;
    } catch (error) {
      this.logger.warn(`Failed to generate video thumbnail: ${error.message}`);
    }

    // Конвертація відео в різні якості (асинхронно, не блокує відповідь)
    const baseFilename = path.parse(filename).name;
    
    // Визначаємо які якості потрібно створити на основі оригінального розміру
    const originalHeight = videoInfo?.height || 1080;
    const qualitiesToGenerate = VIDEO_QUALITIES.filter((q) => {
      const targetHeight = parseInt(q.resolution.split('x')[1]);
      return targetHeight <= originalHeight;
    });

    // Формуємо інформацію про доступні якості (будуть доступні після конвертації)
    const availableQualities: Record<string, string> = {};
      qualitiesToGenerate.forEach((quality) => {
        const outputFilename = `${baseFilename}${quality.suffix}.mp4`;
        const videoRelativePath = path.join(this.folders.videos, outputFilename).replace(/\\/g, '/');
        availableQualities[quality.name] = `/api/v1/files/${videoRelativePath}?quality=${quality.name}`;
      });

    // Конвертуємо в різні якості (асинхронно, не блокує відповідь)
    Promise.all(
      qualitiesToGenerate.map(async (quality) => {
        try {
          const outputFilename = `${baseFilename}${quality.suffix}.mp4`;
          const outputPath = path.join(videosFolder, outputFilename);
          await this.convertVideoToQuality(filepath, outputPath, quality);
          this.logger.log(`Video quality ${quality.name} is now available: ${outputFilename}`);
        } catch (error) {
          this.logger.warn(`Failed to convert video to ${quality.name}: ${error.message}`);
        }
      }),
    ).catch((error) => {
      this.logger.error(`Error during video conversion: ${error.message}`);
    });

    // Повертаємо URL з урахуванням папки
    const videoRelativePath = path.join(this.folders.videos, filename).replace(/\\/g, '/');
    
    // Повертаємо оригінальне відео та інформацію про доступні якості
    return {
      id: filename,
      url: `/api/v1/files/${videoRelativePath}`,
      thumbnail_url: thumbnailUrl,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      qualities: availableQualities, // URL для різних якостей (будуть доступні після конвертації)
      original_quality: originalHeight ? `${originalHeight}p` : null,
      conversion_status: 'processing', // Статус конвертації
    };
  }

  async getFile(id: string) {
    // id може бути просто filename або path з папкою (наприклад, "images/filename.jpg" або "videos/filename.mp4")
    // Підтримуємо обидва формати для зворотної сумісності
    let filepath: string;
    
    if (id.includes('/')) {
      // Якщо є папка в шляху, використовуємо повний шлях
      filepath = path.join(this.uploadPath, id);
    } else {
      // Для зворотної сумісності: спочатку шукаємо в основній папці, потім в підпапках
      filepath = path.join(this.uploadPath, id);
      
      if (!fs.existsSync(filepath)) {
        // Шукаємо в підпапках
        let found = false;
        for (const folder of Object.values(this.folders)) {
          const testPath = path.join(this.uploadPath, folder, id);
          if (fs.existsSync(testPath)) {
            filepath = testPath;
            found = true;
            break;
          }
        }
        
        if (!found) {
          throw new BadRequestException('File not found');
        }
      }
    }
    
    if (!fs.existsSync(filepath)) {
      throw new BadRequestException('File not found');
    }

    return {
      path: filepath,
      stream: fs.createReadStream(filepath),
    };
  }

  /**
   * Видаляє файл з файлової системи
   * @param fileUrl - URL файлу (може бути повним URL або відносним шляхом)
   * @returns true якщо файл видалено, false якщо файл не знайдено
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    if (!fileUrl || fileUrl.trim() === '') {
      return false;
    }

    try {
      // Витягуємо шлях до файлу з URL
      // Може бути: /api/v1/files/filename.jpg або /api/v1/files/images/filename.jpg
      // або http://localhost:3000/api/v1/files/images/filename.jpg
      let filePath = fileUrl.trim();
      
      // Видаляємо префікси URL
      if (filePath.includes('/files/')) {
        filePath = filePath.split('/files/')[1];
      } else if (filePath.startsWith('/')) {
        // Якщо це просто відносний шлях, видаляємо початковий /
        filePath = filePath.replace(/^\/+/, '');
      }

      // Видаляємо query параметри якщо є
      if (filePath.includes('?')) {
        filePath = filePath.split('?')[0];
      }

      if (!filePath) {
        this.logger.warn(`Cannot extract file path from URL: ${fileUrl}`);
        return false;
      }

      // Формуємо повний шлях до файлу
      const fullPath = path.join(this.uploadPath, filePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`File deleted: ${fullPath}`);
        return true;
      } else {
        // Для зворотної сумісності: якщо файл не знайдено за повним шляхом,
        // шукаємо в основній папці та підпапках
        const filename = path.basename(filePath);
        let found = false;
        
        // Спочатку перевіряємо основну папку
        const mainPath = path.join(this.uploadPath, filename);
        if (fs.existsSync(mainPath)) {
          fs.unlinkSync(mainPath);
          this.logger.log(`File deleted (legacy path): ${mainPath}`);
          return true;
        }
        
        // Потім шукаємо в підпапках
        for (const folder of Object.values(this.folders)) {
          const testPath = path.join(this.uploadPath, folder, filename);
          if (fs.existsSync(testPath)) {
            fs.unlinkSync(testPath);
            this.logger.log(`File deleted (found in ${folder}): ${testPath}`);
            found = true;
            break;
          }
        }
        
        if (!found) {
          this.logger.warn(`File not found: ${fullPath}`);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      this.logger.error(`Error deleting file ${fileUrl}:`, error);
      return false;
    }
  }

  async getVideo(id: string, quality?: string) {
    // id може бути просто filename або path з папкою (наприклад, "videos/filename.mp4")
    const videosFolder = this.getFolderPath('videos');
    
    // Якщо вказана якість, шукаємо відповідний файл
    if (quality) {
      const qualityConfig = VIDEO_QUALITIES.find((q) => q.name === quality);
      if (qualityConfig) {
        // Витягуємо базове ім'я файлу (без папки та розширення)
        const baseFilename = path.parse(id.includes('/') ? path.basename(id) : id).name;
        const qualityFilename = `${baseFilename}${qualityConfig.suffix}.mp4`;
        const qualityPath = path.join(videosFolder, qualityFilename);
        
        if (fs.existsSync(qualityPath)) {
          return {
            path: qualityPath,
            stream: fs.createReadStream(qualityPath),
          };
        } else {
          // Якщо файл якості ще не готовий, повертаємо оригінал
          this.logger.warn(`Video quality ${quality} not yet available for ${id}, returning original`);
        }
      }
    }

    // Якщо якість не вказана або файл не знайдено, повертаємо оригінал
    return this.getFile(id);
  }
}

