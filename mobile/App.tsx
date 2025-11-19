import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PaperProvider} from 'react-native-paper';
import messaging from '@react-native-firebase/messaging';
import {AuthProvider} from './src/contexts/AuthContext';
import {ToastProvider} from './src/components/ToastProvider';
import AppNavigator from './src/navigation/AppNavigator';
import PushNotificationHandler from './src/components/PushNotificationHandler';

// Background message handler (must be outside component)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background message received:', remoteMessage);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <ToastProvider>
            <AuthProvider>
              <NavigationContainer>
                <AppNavigator />
                <PushNotificationHandler />
              </NavigationContainer>
            </AuthProvider>
          </ToastProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;

