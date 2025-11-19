import type {VideoQuality} from '../types';

/**
 * Detect network speed and return appropriate video quality
 * Note: NetInfo will be imported dynamically to avoid issues if not installed
 */
export const detectVideoQuality = async (): Promise<VideoQuality> => {
  try {
    // @ts-ignore - dynamic import to avoid issues if NetInfo is not installed
    const NetInfo = require('@react-native-community/netinfo').default;
    const netInfo = await NetInfo.fetch();
    
    if (!netInfo.isConnected) {
      // Offline - use lowest quality if cached
      return '360p';
    }

    // Check connection type
    const connectionType = netInfo.type;
    
    if (connectionType === 'wifi') {
      // WiFi - can handle higher quality
      return '720p';
    } else if (connectionType === 'cellular') {
      // Cellular - use lower quality to save data
      return '480p';
    }
  } catch (error) {
    console.warn('NetInfo not available, using default quality:', error);
  }

  // Default to medium quality
  return '480p';
};

/**
 * Get video URL with quality parameter
 */
export const getVideoUrl = (
  videoId: string,
  quality: VideoQuality = '480p',
  baseUrl?: string,
): string => {
  if (!videoId) return '';
  
  // Extract file ID from URL if it's a full URL
  const fileId = videoId.includes('/') 
    ? videoId.split('/').pop()?.split('?')[0] || videoId
    : videoId;

  const apiBase = baseUrl || '';
  if (!apiBase) {
    // If no base URL provided, assume it's already a full URL
    return videoId.includes('http') ? videoId : '';
  }
  return `${apiBase}/files/video/${fileId}?quality=${quality}`;
};

/**
 * Get image URL
 */
export const getImageUrl = (imageId: string, baseUrl?: string): string => {
  if (!imageId) return '';
  
  // If already a full URL, return as is
  if (imageId.includes('http')) {
    return imageId;
  }
  
  const fileId = imageId.includes('/') 
    ? imageId.split('/').pop()?.split('?')[0] || imageId
    : imageId;

  const apiBase = baseUrl || '';
  if (!apiBase) {
    return imageId;
  }
  return `${apiBase}/files/${fileId}`;
};

