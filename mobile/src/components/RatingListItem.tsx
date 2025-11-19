import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, Avatar} from 'react-native-paper';
import {rp} from '../utils/responsive';
import type {RatingUser} from '../types';
import {useAuth} from '../contexts/AuthContext';

interface RatingListItemProps {
  user: RatingUser;
  isCurrentUser?: boolean;
}

const RatingListItem: React.FC<RatingListItemProps> = ({
  user,
  isCurrentUser = false,
}) => {
  const getMedalIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return null;
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return '#FFD700';
    if (position === 2) return '#C0C0C0';
    if (position === 3) return '#CD7F32';
    return '#6200ee';
  };

  const cityName =
    typeof user.user.city === 'string'
      ? user.user.city
      : user.user.city?.name || '';
  const positionName =
    typeof user.user.position === 'string'
      ? user.user.position
      : user.user.position?.name || '';

  const medal = getMedalIcon(user.position);
  const positionColor = getPositionColor(user.position);

  return (
    <Card
      style={[styles.card, isCurrentUser && styles.currentUserCard]}
      mode="elevated">
      <Card.Content>
        <View style={styles.container}>
          <View style={styles.positionContainer}>
            {medal ? (
              <Text style={styles.medal}>{medal}</Text>
            ) : (
              <View
                style={[
                  styles.positionBadge,
                  {backgroundColor: positionColor},
                ]}>
                <Text style={styles.positionText}>{user.position}</Text>
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text
                variant="titleMedium"
                style={[styles.name, isCurrentUser && styles.currentUserName]}>
                {user.user.full_name}
                {isCurrentUser && ' (Ви)'}
              </Text>
            </View>
            {(cityName || positionName) && (
              <Text variant="bodySmall" style={styles.meta}>
                {cityName}
                {cityName && positionName ? ' • ' : ''}
                {positionName}
              </Text>
            )}
            <View style={styles.statsRow}>
              <Text variant="bodySmall" style={styles.stat}>
                📊 {user.total_score} балів
              </Text>
              <Text variant="bodySmall" style={styles.stat}>
                📝 {user.tests_completed} тестів
              </Text>
              <Text variant="bodySmall" style={styles.stat}>
                🔥 {user.current_streak} днів
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(4),
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionContainer: {
    width: rp(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadge: {
    width: rp(36),
    height: rp(36),
    borderRadius: rp(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: rp(14),
  },
  medal: {
    fontSize: rp(32),
  },
  userInfo: {
    flex: 1,
    marginLeft: rp(12),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rp(4),
  },
  name: {
    fontWeight: '600',
    color: '#212121',
  },
  currentUserName: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  meta: {
    color: '#757575',
    marginBottom: rp(4),
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: rp(4),
  },
  stat: {
    color: '#757575',
    marginRight: rp(12),
  },
});

export default RatingListItem;

