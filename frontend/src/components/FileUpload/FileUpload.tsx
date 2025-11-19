import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { filesService } from '../../services/files.service';

interface FileUploadProps {
  type: 'image' | 'video' | 'pdf';
  value?: string;
  onChange: (url: string) => void;
  onThumbnailChange?: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  folderType?: 'questions' | 'articles'; // Тип папки для групування файлів
}

const FileUpload: React.FC<FileUploadProps> = ({
  type,
  value,
  onChange,
  onThumbnailChange,
  accept,
  maxSize = type === 'image' ? 10 : type === 'pdf' ? 50 : 50,
  label,
  folderType = 'articles',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Оновлюємо preview при зміні value (особливо для PDF та при редагуванні)
  useEffect(() => {
    // Скидаємо помилку завантаження при зміні value
    setImageLoadError(false);
    
    // Перевіряємо, чи value не порожній рядок
    if (value && value.trim() !== '') {
      let previewUrl = value.trim();
      
      // Якщо це вже повний URL (http/https/blob), перевіряємо на подвоєння /api/v1
      if (previewUrl.startsWith('http://') || previewUrl.startsWith('https://')) {
        // Виправляємо подвоєння /api/v1 в повному URL
        previewUrl = previewUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
        setPreview(previewUrl);
        return;
      }
      
      if (previewUrl.startsWith('blob:')) {
        setPreview(previewUrl);
        return;
      }
      
      // Якщо це відносний шлях, конвертуємо в повний URL
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';
      
      // Нормалізуємо baseUrl (видаляємо trailing slash)
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      // Видаляємо подвоєння /api/v1 з previewUrl
      // Якщо previewUrl починається з /api/v1/, а baseUrl вже містить /api/v1
      if (previewUrl.startsWith('/api/v1/')) {
        // Видаляємо /api/v1 з початку previewUrl
        previewUrl = previewUrl.replace(/^\/api\/v1/, '');
      }
      
      // Додаємо baseUrl до відносного шляху
      // previewUrl тепер має починатися з / (або не мати / на початку)
      if (previewUrl.startsWith('/')) {
        previewUrl = `${normalizedBaseUrl}${previewUrl}`;
      } else {
        previewUrl = `${normalizedBaseUrl}/${previewUrl}`;
      }
      
      // Фінальна перевірка на подвоєння /api/v1 (на всяк випадок)
      previewUrl = previewUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
      
      // Логування для діагностики (тільки в розробці)
      if ((import.meta as any).env?.DEV && type === 'image') {
        console.log('[FileUpload] Image preview URL:', {
          original: value,
          converted: previewUrl,
          baseUrl: normalizedBaseUrl,
          type,
        });
      }
      
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
  }, [value, type]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`Розмір файлу перевищує ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept && !accept.split(',').some((type) => file.type.includes(type.replace('*', '')))) {
      setError('Невірний тип файлу');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      let response;
      if (type === 'image') {
        response = await filesService.uploadImage(file, folderType);
      } else if (type === 'pdf') {
        response = await filesService.uploadPdf(file, folderType);
      } else {
        response = await filesService.uploadVideo(file);
      }

      // Update form values
      // Backend returns url as /api/v1/files/images/filename.png
      // Зберігаємо відносний шлях для збереження в базі даних
      // Але для preview використовуємо повний URL
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      // Якщо response.url вже повний URL, використовуємо його
      let fileUrl = response.url;
      if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://') && !fileUrl.startsWith('blob:')) {
        // Якщо це відносний шлях, перевіряємо чи він починається з /api/v1
        if (fileUrl.startsWith('/api/v1/')) {
          // Видаляємо /api/v1 якщо baseUrl вже містить його
          if (normalizedBaseUrl.includes('/api/v1')) {
            fileUrl = fileUrl.replace(/^\/api\/v1/, '');
          }
        }
        
        // Формуємо повний URL для preview
        if (fileUrl.startsWith('/')) {
          fileUrl = `${normalizedBaseUrl}${fileUrl}`;
        } else {
          fileUrl = `${normalizedBaseUrl}/${fileUrl}`;
        }
        
        // Виправляємо подвоєння /api/v1
        fileUrl = fileUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
      }
      
      // Для preview використовуємо blob URL для швидкого відображення (для зображень)
      // Для відео використовуємо повний URL, оскільки blob URL може не працювати для великих файлів
      if (type === 'pdf') {
        setPreview(fileUrl);
      } else if (type === 'video') {
        // Для відео використовуємо повний URL для preview
        setPreview(fileUrl);
      } else {
        // Для зображень створюємо blob URL для миттєвого preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      }
      
      // Зберігаємо відносний шлях в формі (без baseUrl)
      // Backend очікує відносний шлях типу /api/v1/files/images/filename.png
      const relativeUrl = response.url.startsWith('http') 
        ? response.url.replace(/^https?:\/\/[^\/]+/, '')
        : response.url;
      
      onChange(relativeUrl);
      
      // Логування для діагностики
      if ((import.meta as any).env?.DEV) {
        console.log('[FileUpload] File uploaded:', {
          type,
          relativeUrl,
          fileUrl,
          preview: type === 'video' ? fileUrl : (type === 'pdf' ? fileUrl : 'blob URL'),
        });
      }
      if (onThumbnailChange && 'thumbnail_url' in response && (response as any).thumbnail_url) {
        const thumbnailUrl = (response as any).thumbnail_url?.startsWith('http')
          ? (response as any).thumbnail_url
          : `${baseUrl}${(response as any).thumbnail_url}`;
        onThumbnailChange(thumbnailUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка завантаження файлу');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (onThumbnailChange) {
      onThumbnailChange('');
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const defaultAccept = type === 'image' 
    ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp' 
    : type === 'pdf'
    ? 'application/pdf'
    : 'video/mp4,video/mov,video/quicktime';

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || defaultAccept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {preview ? (
        <Paper
          sx={{
            p: 2,
            position: 'relative',
            display: 'inline-block',
            maxWidth: '100%',
          }}
        >
          {type === 'image' ? (
            imageLoadError ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  border: '1px dashed',
                  borderColor: 'error.main',
                  borderRadius: 1,
                  minHeight: 200,
                  justifyContent: 'center',
                }}
              >
                <ImageIcon sx={{ fontSize: 48, color: 'error.main' }} />
                <Typography variant="body2" color="error">
                  Помилка завантаження зображення
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  URL: {preview}
                </Typography>
              </Box>
            ) : (
              <Box
                component="img"
                src={preview}
                alt="Preview"
                onError={(e) => {
                  console.error('[FileUpload] Image load error:', {
                    url: preview,
                    error: e,
                    timestamp: new Date().toISOString(),
                  });
                  setImageLoadError(true);
                }}
                onLoad={() => {
                  setImageLoadError(false);
                  if ((import.meta as any).env?.DEV) {
                    console.log('[FileUpload] Image loaded successfully:', preview);
                  }
                }}
                crossOrigin="anonymous"
                sx={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  display: 'block',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            )
          ) : type === 'pdf' ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                p: 2,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
              <Typography variant="body2" color="text.secondary">
                PDF файл завантажено
              </Typography>
              <Button
                variant="outlined"
                size="small"
                href={preview || value || '#'}
                target="_blank"
                rel="noopener noreferrer"
                component="a"
              >
                Відкрити PDF
              </Button>
            </Box>
          ) : (
            <Box
              component="video"
              src={preview}
              controls
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                display: 'block',
                borderRadius: 1,
              }}
            />
          )}
          <IconButton
            onClick={handleRemove}
            color="error"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      ) : (
        <Button
          variant="outlined"
          component="span"
          onClick={handleClick}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : type === 'image' ? <ImageIcon /> : type === 'pdf' ? <PictureAsPdfIcon /> : <VideoLibraryIcon />}
          sx={{
            py: 2,
            px: 3,
            width: '100%',
            borderStyle: 'dashed',
          }}
        >
          {uploading ? 'Завантаження...' : label || `Завантажити ${type === 'image' ? 'зображення' : type === 'pdf' ? 'PDF' : 'відео'}`}
        </Button>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {!preview && !uploading && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Максимальний розмір: {maxSize}MB
          {type === 'image' && ' (JPG, PNG, GIF, WEBP)'}
          {type === 'pdf' && ' (PDF)'}
          {type === 'video' && ' (MP4, MOV)'}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;

