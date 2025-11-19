import React, {useState} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import SafeAreaView from '../../components/SafeAreaView';
import ProgressChart from '../../components/ProgressChart';
import TestHistoryItem from '../../components/TestHistoryItem';
import {statisticsService} from '../../services/statistics.service';
import {rp} from '../../utils/responsive';

const StatisticsScreen: React.FC = () => {
  const [page, setPage] = useState(1);

  // Get statistics
  const {data: statistics, isLoading: isLoadingStats} = useQuery({
    queryKey: ['userStatistics'],
    queryFn: () => statisticsService.getStatistics(),
  });

  // Get test history
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['testHistory', page],
    queryFn: () => statisticsService.getTestHistory(page, 20),
  });

  const history = historyData?.data || [];
  const hasMore = historyData?.meta
    ? page < historyData.meta.total_pages
    : false;

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const renderStatsCard = () => {
    if (!statistics) return null;

    const stats = [
      {
        label: 'Всього тестів',
        value: statistics.total_tests,
        icon: '📝',
      },
      {
        label: 'Загальні бали',
        value: statistics.total_score,
        icon: '⭐',
      },
      {
        label: 'Правильність',
        value: `${statistics.correct_answers_percentage.toFixed(1)}%`,
        icon: '✅',
      },
      {
        label: 'За місяць',
        value: `${statistics.correct_answers_percentage_month.toFixed(1)}%`,
        icon: '📊',
      },
      {
        label: 'Поточна серія',
        value: `${statistics.current_streak} днів`,
        icon: '🔥',
      },
      {
        label: 'Найдовша серія',
        value: `${statistics.longest_streak} днів`,
        icon: '🏆',
      },
    ];

    return (
      <Card style={styles.statsCard} mode="elevated">
        <Card.Content>
          <Text variant="titleLarge" style={styles.statsTitle}>
            Загальна статистика
          </Text>
          <View style={styles.statsGrid}>
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

  const renderHistoryItem = ({item}: {item: any}) => (
    <TestHistoryItem test={item} />
  );

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6200ee" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoadingHistory) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.emptyText}>Завантаження історії...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Історія тестів порожня</Text>
      </View>
    );
  };

  if (isLoadingStats) {
    return (
      <SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Завантаження статистики...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Статистика
          </Text>
        </View>

        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={item => item._id}
          ListHeaderComponent={
            <>
              {renderStatsCard()}
              {statistics?.progress_chart && (
                <ProgressChart data={statistics.progress_chart} />
              )}
              <View style={styles.historyHeader}>
                <Text variant="titleMedium" style={styles.historyTitle}>
                  Історія тестів
                </Text>
              </View>
            </>
          }
          contentContainerStyle={
            history.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isLoadingHistory}
          onRefresh={() => {
            setPage(1);
            refetch();
          }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: rp(16),
    fontSize: rp(16),
    color: '#757575',
  },
  statsCard: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: rp(16),
    color: '#212121',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: rp(16),
    padding: rp(8),
    backgroundColor: '#f5f5f5',
    borderRadius: rp(8),
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
  historyHeader: {
    paddingHorizontal: rp(16),
    paddingVertical: rp(8),
    marginTop: rp(8),
  },
  historyTitle: {
    fontWeight: 'bold',
    color: '#212121',
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
  footerLoader: {
    paddingVertical: rp(16),
    alignItems: 'center',
  },
});

export default StatisticsScreen;

