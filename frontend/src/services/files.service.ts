import api from './api';

export interface UploadFileResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface UploadVideoResponse extends UploadFileResponse {
  thumbnail_url?: string;
}

export const filesService = {
  uploadImage: async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  uploadVideo: async (file: File): Promise<UploadVideoResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/files/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  uploadFile: async (file: File, type: 'image' | 'video'): Promise<UploadFileResponse | UploadVideoResponse> => {
    if (type === 'image') {
      return filesService.uploadImage(file);
    } else {
      return filesService.uploadVideo(file);
    }
  },
};
