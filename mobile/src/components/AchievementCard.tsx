import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Card, Text, ProgressBar} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import {getImageUrl} from '../utils/videoQuality';
import {API_BASE_URL} from '../constants/config';
import {rp} from '../utils/responsive';
import {fadeIn, scaleIn, bounce} from '../utils/animations';
import type {Achievement} from '../types';

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({achievement}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in and scale in on mount
    Animated.parallel([
      fadeIn(fadeAnim, 400),
      scaleIn(scaleAnim, 400),
    ]).start();

    // Bounce animation if achievement is just completed
    if (achievement.is_completed && achievement.completed_at) {
      const completedDate = new Date(achievement.completed_at);
      const now = new Date();
      // If completed within last 5 seconds, show bounce
      if (now.getTime() - completedDate.getTime() < 5000) {
        bounce(bounceAnim, 600).start();
      }
    }
  }, [achievement.is_completed, achievement.completed_at]);

  const progressPercentage =
    achievement.condition_value > 0
      ? Math.min((achievement.progress / achievement.condition_value) * 100, 100)
      : 0;

  const iconUrl = achievement.icon_url
    ? getImageUrl(achievement.icon_url, API_BASE_URL)
    : null;

  const getStatusColor = () => {
    if (achievement.is_completed) return '#4caf50';
    if (achievement.progress > 0) return '#ff9800';
    return '#9e9e9e';
  };

  const getStatusText = () => {
    if (achievement.is_completed) return '✓ Отримано';
    if (achievement.progress > 0) return 'В процесі';
    return 'Заблоковано';
  };

  // Combine scale animations - use bounceAnim if achievement is completed, otherwise use scaleAnim
  const scaleValue = achievement.is_completed ? bounceAnim : scaleAnim;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{scale: scaleValue}],
      }}>
      <Card
        style={[
          styles.card,
          achievement.is_completed && styles.completedCard,
          !achievement.is_completed && achievement.progress === 0 && styles.lockedCard,
        ]}
        mode="elevated">
        <Card.Content>
          <View style={styles.container}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{scale: achievement.is_completed ? bounceAnim : 1}],
                },
              ]}>
              {iconUrl ? (
                <FastImage
                  source={{
                    uri: iconUrl,
                    priority: FastImage.priority.normal,
                  }}
                  style={styles.icon}
                  resizeMode={FastImage.resizeMode.contain}
                />
              ) : (
                <View style={[styles.iconPlaceholder, {backgroundColor: getStatusColor()}]}>
                  <Text style={styles.iconText}>🏆</Text>
                </View>
              )}
            </Animated.View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text
                variant="titleMedium"
                style={[
                  styles.name,
                  !achievement.is_completed &&
                    achievement.progress === 0 &&
                    styles.lockedText,
                ]}>
                {achievement.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusColor()},
                ]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>

            <Text
              variant="bodyMedium"
              style={[
                styles.description,
                !achievement.is_completed &&
                  achievement.progress === 0 &&
                  styles.lockedText,
              ]}>
              {achievement.description}
            </Text>

            {!achievement.is_completed && (
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text variant="bodySmall" style={styles.progressText}>
                    Прогрес: {achievement.progress} / {achievement.condition_value}
                  </Text>
                  <Text variant="bodySmall" style={styles.progressPercentage}>
                    {progressPercentage.toFixed(0)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={progressPercentage / 100}
                  color={getStatusColor()}
                  style={styles.progressBar}
                />
              </View>
            )}

            {achievement.is_completed && achievement.completed_at && (
              <Text variant="bodySmall" style={styles.completedDate}>
                Отримано: {new Date(achievement.completed_at).toLocaleDateString('uk-UA')}
              </Text>
            )}

            {achievement.reward_points > 0 && (
              <View style={styles.rewardContainer}>
                <Text variant="bodySmall" style={styles.rewardText}>
                  🪙 Нагорода: {achievement.reward_points} монет
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  completedCard: {
    borderWidth: 2,
    borderColor: '#4caf50',
    backgroundColor: '#f1f8f4',
  },
  lockedCard: {
    opacity: 0.6,
  },
  container: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: rp(60),
    height: rp(60),
    marginRight: rp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: rp(60),
    height: rp(60),
    borderRadius: rp(30),
  },
  iconPlaceholder: {
    width: rp(60),
    height: rp(60),
    borderRadius: rp(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: rp(32),
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rp(8),
  },
  name: {
    flex: 1,
    fontWeight: 'bold',
    color: '#212121',
    marginRight: rp(8),
  },
  lockedText: {
    color: '#9e9e9e',
  },
  statusBadge: {
    paddingHorizontal: rp(8),
    paddingVertical: rp(4),
    borderRadius: rp(12),
  },
  statusText: {
    color: '#fff',
    fontSize: rp(10),
    fontWeight: 'bold',
  },
  description: {
    color: '#757575',
    marginBottom: rp(12),
  },
  progressContainer: {
    marginTop: rp(8),
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: rp(4),
  },
  progressText: {
    color: '#757575',
  },
  progressPercentage: {
    color: '#757575',
    fontWeight: '500',
  },
  progressBar: {
    height: rp(8),
    borderRadius: rp(4),
  },
  completedDate: {
    color: '#4caf50',
    marginTop: rp(4),
    fontStyle: 'italic',
  },
  rewardContainer: {
    marginTop: rp(8),
    padding: rp(8),
    backgroundColor: '#fff3cd',
    borderRadius: rp(8),
  },
  rewardText: {
    color: '#856404',
    fontWeight: '500',
  },
});

export default AchievementCard;

