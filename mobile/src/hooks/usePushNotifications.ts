import {useEffect, useRef} from 'react';
import {Alert, AppState} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import pushService from '../services/push.service';
import {useAuth} from '../contexts/AuthContext';

export const usePushNotifications = () => {
  const navigation = useNavigation();
  const {isAuthenticated} = useAuth();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Initialize push notifications
    pushService.initialize();

    // Handle foreground notifications
    const unsubscribe = pushService.setupForegroundHandler((remoteMessage) => {
      const notification = remoteMessage.notification;
      if (notification) {
        Alert.alert(
          notification.title || 'Повідомлення',
          notification.body || '',
          [
            {
              text: 'Відкрити',
              onPress: () => handleNotificationPress(remoteMessage),
            },
            {text: 'Закрити', style: 'cancel'},
          ],
        );
      } else {
        handleNotificationPress(remoteMessage);
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Handle background/quit state notifications
    pushService.setupBackgroundHandler((remoteMessage) => {
      handleNotificationPress(remoteMessage);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isAuthenticated, navigation]);

  const handleNotificationPress = (remoteMessage: any) => {
    const data = pushService.getNotificationData(remoteMessage);
    if (!data) {
      return;
    }

    // Navigate based on notification type
    const {type, test_id, article_id, achievement_id} = data;

    try {
      switch (type) {
        case 'daily_test':
        case 'test_reminder':
          if (test_id) {
            (navigation as any).navigate('Test', {testId: test_id});
          } else {
            (navigation as any).navigate('Home');
          }
          break;

        case 'article':
        case 'knowledge_base':
          if (article_id) {
            (navigation as any).navigate('ArticleView', {
              articleId: article_id,
            });
          } else {
            (navigation as any).navigate('Knowledge');
          }
          break;

        case 'achievement':
          if (achievement_id) {
            // Navigate to achievements screen (if exists)
            (navigation as any).navigate('Home');
          }
          break;

        case 'rating_update':
          (navigation as any).navigate('Rating');
          break;

        default:
          (navigation as any).navigate('Home');
          break;
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  };
};

