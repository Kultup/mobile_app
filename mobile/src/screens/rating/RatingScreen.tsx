import React, {useState} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {Text, SegmentedButtons} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import SafeAreaView from '../../components/SafeAreaView';
import RatingListItem from '../../components/RatingListItem';
import {SkeletonListItem} from '../../components/SkeletonLoader';
import {ratingService} from '../../services/rating.service';
import {useAuth} from '../../contexts/AuthContext';
import {rp} from '../../utils/responsive';
import type {RatingUser} from '../../types';

type RatingTab = 'global' | 'city' | 'position';

const RatingScreen: React.FC = () => {
  const {user} = useAuth();
  const [activeTab, setActiveTab] = useState<RatingTab>('global');
  const [page, setPage] = useState(1);

  // Get rating based on active tab
  const {
    data: ratingData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['rating', activeTab, user?.city, user?.position, page],
    queryFn: async () => {
      switch (activeTab) {
        case 'city':
          if (!user?.city) {
            throw new Error('City not available');
          }
          const cityId = typeof user.city === 'string' ? user.city : (user.city as any)?._id || user.city;
          return ratingService.getByCity(cityId, {page, limit: 50});
        case 'position':
          if (!user?.position) {
            throw new Error('Position not available');
          }
          const positionId = typeof user.position === 'string' ? user.position : (user.position as any)?._id || user.position;
          return ratingService.getByPosition(positionId, {page, limit: 50});
        default:
          return ratingService.getGlobal({page, limit: 50});
      }
    },
    enabled: !!user,
  });

  const users = ratingData?.data || [];
  const currentUserPosition = ratingData?.current_user_position;
  const hasMore = ratingData?.meta
    ? page < ratingData.meta.total_pages
    : false;

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as RatingTab);
    setPage(1);
  };

  const isCurrentUser = (userId: string) => {
    return user?._id === userId;
  };

  const renderUser = ({item}: {item: RatingUser}) => {
    const userId =
      typeof item.user.id === 'string' ? item.user.id : item.user.id;
    return (
      <RatingListItem
        user={item}
        isCurrentUser={isCurrentUser(userId)}
      />
    );
  };

  const renderHeader = () => {
    if (!user) return null;

    return (
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Рейтинг
        </Text>
        {currentUserPosition !== undefined && (
          <View style={styles.userPositionContainer}>
            <Text variant="bodyMedium" style={styles.userPositionText}>
              Ваша позиція: <Text style={styles.userPositionValue}>#{currentUserPosition}</Text>
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6200ee" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Рейтинг порожній</Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.tabsContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={handleTabChange}
            buttons={[
              {
                value: 'global',
                label: 'Загальний',
              },
              {
                value: 'city',
                label: 'Місто',
                disabled: !user?.city,
              },
              {
                value: 'position',
                label: 'Посада',
                disabled: !user?.position,
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => {
            const userId =
              typeof item.user.id === 'string' ? item.user.id : item.user.id;
            return userId;
          }}
          contentContainerStyle={
            users.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isLoading}
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
  headerTitle: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: rp(8),
  },
  userPositionContainer: {
    marginTop: rp(8),
    padding: rp(12),
    backgroundColor: '#f3e5f5',
    borderRadius: rp(8),
  },
  userPositionText: {
    color: '#212121',
    textAlign: 'center',
  },
  userPositionValue: {
    fontWeight: 'bold',
    color: '#6200ee',
    fontSize: rp(18),
  },
  tabsContainer: {
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
  skeletonContainer: {
    padding: rp(8),
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

export default RatingScreen;

