import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { filesService } from '../../services/files.service';

interface FileUploadProps {
  type: 'image' | 'video';
  value?: string;
  onChange: (url: string) => void;
  onThumbnailChange?: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  type,
  value,
  onChange,
  onThumbnailChange,
  accept,
  maxSize = type === 'image' ? 10 : 50,
  label,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        response = await filesService.uploadImage(file);
      } else {
        response = await filesService.uploadVideo(file);
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Update form values
      // Backend returns url as /api/v1/files/{id}, need to construct full URL
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
      const fileUrl = response.url?.startsWith('http') 
        ? response.url 
        : `${baseUrl}${response.url}`;
      onChange(fileUrl);
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
    ? 'image/jpeg,image/jpg,image/png' 
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
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                display: 'block',
                borderRadius: 1,
              }}
            />
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
          startIcon={uploading ? <CircularProgress size={20} /> : type === 'image' ? <ImageIcon /> : <VideoLibraryIcon />}
          sx={{
            py: 2,
            px: 3,
            width: '100%',
            borderStyle: 'dashed',
          }}
        >
          {uploading ? 'Завантаження...' : label || `Завантажити ${type === 'image' ? 'зображення' : 'відео'}`}
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
          {type === 'image' && ' (JPG, PNG)'}
          {type === 'video' && ' (MP4, MOV)'}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;

