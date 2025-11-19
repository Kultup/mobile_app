import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text, Button} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {achievementsService} from '../services/achievements.service';
import {rp} from '../utils/responsive';

const AchievementsPreview: React.FC = () => {
  const navigation = useNavigation();

  const {data: achievementsData} = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementsService.getAllAchievements(),
  });

  if (!achievementsData || achievementsData.total_achievements === 0) {
    return null;
  }

  const completionPercentage =
    achievementsData.total_achievements > 0
      ? Math.round(
          (achievementsData.completed / achievementsData.total_achievements) *
            100,
        )
      : 0;

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            Ачівки
          </Text>
          <Text variant="bodySmall" style={styles.percentage}>
            {completionPercentage}%
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={styles.statValue}>
              {achievementsData.completed}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Отримано
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={styles.statValue}>
              {achievementsData.in_progress}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              В процесі
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={styles.statValue}>
              {achievementsData.total_achievements}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Всього
            </Text>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={() => (navigation as any).navigate('Achievements')}
          style={styles.button}
          icon="trophy">
          Переглянути всі
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rp(16),
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
  },
  percentage: {
    color: '#6200ee',
    fontWeight: 'bold',
    fontSize: rp(16),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: rp(16),
    paddingBottom: rp(16),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: rp(4),
  },
  statLabel: {
    color: '#757575',
  },
  button: {
    marginTop: rp(8),
  },
});

export default AchievementsPreview;

