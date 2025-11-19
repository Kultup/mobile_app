// @ts-ignore - __DEV__ is a global variable in React Native
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

export const API_BASE_URL = isDev
  ? 'http://localhost:3000/api/v1' // Change to your backend URL
  : 'https://api.kraina-mriy.com/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
} as const;

export const VIDEO_QUALITIES = ['1080p', '720p', '480p', '360p'] as const;

export type VideoQuality = typeof VIDEO_QUALITIES[number];

