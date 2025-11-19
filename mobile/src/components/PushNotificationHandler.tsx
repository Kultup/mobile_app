import React from 'react';
import {usePushNotifications} from '../hooks/usePushNotifications';

/**
 * Component to handle push notifications
 * Should be placed inside NavigationContainer
 */
const PushNotificationHandler: React.FC = () => {
  usePushNotifications();
  return null;
};

export default PushNotificationHandler;

