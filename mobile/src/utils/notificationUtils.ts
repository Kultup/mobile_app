import {Alert, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';

/**
 * Show local notification alert (for foreground)
 */
export const showNotificationAlert = (
  title: string,
  body: string,
  onPress?: () => void,
) => {
  Alert.alert(
    title,
    body,
    [
      {
        text: 'Відкрити',
        onPress: onPress,
      },
      {text: 'Закрити', style: 'cancel'},
    ],
    {cancelable: true},
  );
};

/**
 * Check if notifications are enabled
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
};

/**
 * Get notification channel ID for Android
 */
export const getNotificationChannelId = (): string => {
  return Platform.OS === 'android' ? 'kraina_mriy_default' : '';
};

