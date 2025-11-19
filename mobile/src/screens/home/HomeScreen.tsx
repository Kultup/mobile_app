import React, {useEffect} from 'react';
import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {Text} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import SafeAreaView from '../../components/SafeAreaView';
import DailyTestCard from '../../components/DailyTestCard';
import UserStats from '../../components/UserStats';
import FeedbackMenu from '../../components/FeedbackMenu';
import AchievementsPreview from '../../components/AchievementsPreview';
import ShopMenu from '../../components/ShopMenu';
import {userService} from '../../services/user.service';
import {useAuth} from '../../contexts/AuthContext';
import {rp} from '../../utils/responsive';

const HomeScreen: React.FC = () => {
  const {user, refreshUser} = useAuth();
  const {data: profile, refetch, isRefetching} = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      refreshUser();
    }
  }, [profile, refreshUser]);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <SafeAreaView>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }>
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Вітаємо,</Text>
            <Text style={styles.userName}>
              {user?.full_name || 'Користувач'}!
            </Text>
          </View>
        </View>

        <DailyTestCard />

        <UserStats />

        <AchievementsPreview />

        <ShopMenu />

        <FeedbackMenu />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Продовжуйте навчання щодня для кращих результатів!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: rp(16),
  },
  header: {
    padding: rp(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    marginTop: rp(8),
  },
  greetingText: {
    fontSize: rp(16),
    color: '#757575',
  },
  userName: {
    fontSize: rp(24),
    fontWeight: 'bold',
    color: '#212121',
    marginTop: rp(4),
  },
  footer: {
    padding: rp(16),
    alignItems: 'center',
  },
  footerText: {
    fontSize: rp(14),
    color: '#757575',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;

