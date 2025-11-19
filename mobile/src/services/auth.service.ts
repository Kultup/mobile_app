import api from './api';
import {storage} from '../utils/storage';
import {STORAGE_KEYS} from '../constants/config';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '../types';

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const {access_token, refresh_token, user} = response.data;

    // Save tokens
    await storage.setAccessToken(access_token);
    if (refresh_token) {
      await storage.setRefreshToken(refresh_token);
    }

    // Save user data
    await storage.setItem(STORAGE_KEYS.USER_DATA, user);

    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const {access_token, refresh_token, user} = response.data;

    // Save tokens
    await storage.setAccessToken(access_token);
    if (refresh_token) {
      await storage.setRefreshToken(refresh_token);
    }

    // Save user data
    await storage.setItem(STORAGE_KEYS.USER_DATA, user);

    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user data
      await storage.clearTokens();
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<User>('/user/profile');
      await storage.setItem(STORAGE_KEYS.USER_DATA, response.data);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getAccessToken();
    return !!token;
  },

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<User | null> {
    return storage.getItem<User>(STORAGE_KEYS.USER_DATA);
  },
};


