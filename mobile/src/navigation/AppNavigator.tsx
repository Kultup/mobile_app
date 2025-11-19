import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {Text} from 'react-native';
import {Icon} from 'react-native-paper';
import {useAuth} from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/home/HomeScreen';
import TestScreen from '../screens/test/TestScreen';
import TestResultsScreen from '../screens/test/TestResultsScreen';
import KnowledgeBaseScreen from '../screens/knowledge-base/KnowledgeBaseScreen';
import ArticleViewScreen from '../screens/knowledge-base/ArticleViewScreen';
import RatingScreen from '../screens/rating/RatingScreen';
import StatisticsScreen from '../screens/statistics/StatisticsScreen';
import SurveysScreen from '../screens/feedback/SurveysScreen';
import SurveyScreen from '../screens/feedback/SurveyScreen';
import FeedbackScreen from '../screens/feedback/FeedbackScreen';
import AchievementsScreen from '../screens/achievements/AchievementsScreen';
import ShopScreen from '../screens/shop/ShopScreen';
import PurchasesScreen from '../screens/shop/PurchasesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Knowledge') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Rating') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Shop') {
            iconName = focused ? 'store' : 'store-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          } else {
            iconName = 'help';
          }

          return <Icon source={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Головна'}}
      />
      <Tab.Screen
        name="Knowledge"
        component={KnowledgeBaseScreen}
        options={{title: 'База знань'}}
      />
      <Tab.Screen
        name="Rating"
        component={RatingScreen}
        options={{title: 'Рейтинг'}}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{title: 'Магазин'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Профіль'}}
      />
    </Tab.Navigator>
  );
};


const AppNavigator = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    // Loading state
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Test"
            component={TestScreen}
            options={{gestureEnabled: false}}
          />
          <Stack.Screen
            name="TestResults"
            component={TestResultsScreen}
            options={{gestureEnabled: false}}
          />
          <Stack.Screen
            name="ArticleView"
            component={ArticleViewScreen}
          />
          <Stack.Screen
            name="Survey"
            component={SurveyScreen}
          />
          <Stack.Screen
            name="Feedback"
            component={FeedbackScreen}
          />
          <Stack.Screen
            name="Surveys"
            component={SurveysScreen}
          />
          <Stack.Screen
            name="Achievements"
            component={AchievementsScreen}
          />
          <Stack.Screen
            name="Purchases"
            component={PurchasesScreen}
          />
          <Stack.Screen
            name="Statistics"
            component={StatisticsScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;

