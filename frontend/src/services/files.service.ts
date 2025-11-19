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
  uploadImage: async (file: File, folderType: 'questions' | 'articles' = 'articles'): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderType', folderType);

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

  uploadPdf: async (file: File, folderType: 'questions' | 'articles' = 'articles'): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderType', folderType);

    const { data } = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  uploadFile: async (file: File, type: 'image' | 'video' | 'pdf', folderType: 'questions' | 'articles' = 'articles'): Promise<UploadFileResponse | UploadVideoResponse> => {
    if (type === 'image') {
      return filesService.uploadImage(file, folderType);
    } else if (type === 'pdf') {
      return filesService.uploadPdf(file, folderType);
    } else {
      return filesService.uploadVideo(file);
    }
  },
};
