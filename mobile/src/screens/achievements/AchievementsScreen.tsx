import React, {useState} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {Text, SegmentedButtons, Card} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import SafeAreaView from '../../components/SafeAreaView';
import AchievementCard from '../../components/AchievementCard';
import {achievementsService} from '../../services/achievements.service';
import {rp} from '../../utils/responsive';
import type {Achievement} from '../../types';

type FilterType = 'all' | 'completed' | 'in_progress' | 'locked';

const AchievementsScreen: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');

  const {data: achievementsData, isLoading, refetch} = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementsService.getAllAchievements(),
  });

  const filterAchievements = (achievements: Achievement[]): Achievement[] => {
    switch (filter) {
      case 'completed':
        return achievements.filter(a => a.is_completed);
      case 'in_progress':
        return achievements.filter(a => !a.is_completed && a.progress > 0);
      case 'locked':
        return achievements.filter(a => !a.is_completed && a.progress === 0);
      default:
        return achievements;
    }
  };

  const achievements = achievementsData
    ? filterAchievements(achievementsData.achievements)
    : [];

  const renderStatsCard = () => {
    if (!achievementsData) return null;

    return (
      <Card style={styles.statsCard} mode="elevated">
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {achievementsData.total_achievements}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Всього
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statValue, styles.completedValue]}>
                {achievementsData.completed}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Отримано
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statValue, styles.progressValue]}>
                {achievementsData.in_progress}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                В процесі
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statValue, styles.lockedValue]}>
                {achievementsData.locked}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Заблоковано
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderAchievement = ({item}: {item: Achievement}) => (
    <AchievementCard achievement={item} />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.emptyText}>Завантаження ачівок...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {filter === 'all'
            ? 'Немає доступних ачівок'
            : `Немає ачівок у категорії "${filter === 'completed' ? 'Отримано' : filter === 'in_progress' ? 'В процесі' : 'Заблоковано'}"`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Ачівки
          </Text>
        </View>

        {renderStatsCard()}

        <View style={styles.filtersContainer}>
          <SegmentedButtons
            value={filter}
            onValueChange={value => setFilter(value as FilterType)}
            buttons={[
              {value: 'all', label: 'Всі'},
              {value: 'completed', label: 'Отримано'},
              {value: 'in_progress', label: 'В процесі'},
              {value: 'locked', label: 'Заблоковано'},
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <FlatList
          data={achievements}
          renderItem={renderAchievement}
          keyExtractor={item => item.id}
          contentContainerStyle={
            achievements.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmpty}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: rp(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
  },
  statsCard: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: rp(4),
  },
  completedValue: {
    color: '#4caf50',
  },
  progressValue: {
    color: '#ff9800',
  },
  lockedValue: {
    color: '#9e9e9e',
  },
  statLabel: {
    color: '#757575',
    textAlign: 'center',
  },
  filtersContainer: {
    padding: rp(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  segmentedButtons: {
    backgroundColor: '#f5f5f5',
  },
  list: {
    paddingVertical: rp(8),
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rp(32),
  },
  emptyText: {
    fontSize: rp(16),
    color: '#757575',
    textAlign: 'center',
    marginTop: rp(16),
  },
});

export default AchievementsScreen;

