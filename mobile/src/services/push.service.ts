import api from './api';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

export interface PushNotificationData {
  type?: string;
  test_id?: string;
  article_id?: string;
  achievement_id?: string;
  [key: string]: any;
}

class PushService {
  private isInitialized = false;

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Push notification permission granted');
      } else {
        console.log('Push notification permission denied');
      }

      return enabled;
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register token with backend
   */
  async registerToken(token: string): Promise<void> {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      await api.post('/push-tokens', {
        token,
        platform,
      });
      console.log('FCM token registered successfully');
    } catch (error: any) {
      console.error('Error registering FCM token:', error);
      throw error;
    }
  }

  /**
   * Remove token from backend
   */
  async removeToken(token: string): Promise<void> {
    try {
      await api.delete(`/push-tokens/${token}`);
      console.log('FCM token removed successfully');
    } catch (error: any) {
      console.error('Error removing FCM token:', error);
    }
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Push notifications not authorized');
        return;
      }

      // Get and register token
      const token = await this.getToken();
      if (token) {
        await this.registerToken(token);
      }

      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        console.log('FCM token refreshed:', newToken);
        await this.registerToken(newToken);
      });

      this.isInitialized = true;
      console.log('Push notifications initialized');
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Handle notification when app is in foreground
   */
  setupForegroundHandler(
    onNotification: (remoteMessage: any) => void,
  ): () => void {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);
      onNotification(remoteMessage);
    });
  }

  /**
   * Handle notification when app is opened from background
   */
  setupBackgroundHandler(
    onNotification: (remoteMessage: any) => void,
  ): void {
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      onNotification(remoteMessage);
    });

    // Check if app was opened from a quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          // Delay to ensure navigation is ready
          setTimeout(() => {
            onNotification(remoteMessage);
          }, 1000);
        }
      });
  }

  /**
   * Get notification data
   */
  getNotificationData(remoteMessage: any): PushNotificationData | null {
    return remoteMessage?.data || null;
  }
}

export default new PushService();

