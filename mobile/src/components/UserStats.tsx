import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {useAuth} from '../contexts/AuthContext';
import {rp} from '../utils/responsive';

const UserStats: React.FC = () => {
  const {user} = useAuth();

  if (!user) {
    return null;
  }

  const stats = [
    {
      label: 'Бали',
      value: user.total_score || 0,
      icon: '⭐',
    },
    {
      label: 'Монети',
      value: user.points_balance || 0,
      icon: '🪙',
    },
    {
      label: 'Серія',
      value: `${user.current_streak || 0} днів`,
      icon: '🔥',
    },
    {
      label: 'Тестів',
      value: user.tests_completed || 0,
      icon: '📝',
    },
  ];

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Ваша статистика
        </Text>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {stat.value}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  title: {
    fontWeight: 'bold',
    marginBottom: rp(16),
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: rp(16),
    minWidth: rp(80),
  },
  statIcon: {
    fontSize: rp(32),
    marginBottom: rp(4),
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: rp(4),
  },
  statLabel: {
    color: '#757575',
    textAlign: 'center',
  },
});

export default UserStats;

