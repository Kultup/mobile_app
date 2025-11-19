import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text, Button, ProgressBar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {testsService} from '../services/tests.service';
import {rp, wp} from '../utils/responsive';
import type {DailyTest} from '../types';

interface DailyTestCardProps {
  onStartTest?: () => void;
}

const DailyTestCard: React.FC<DailyTestCardProps> = ({onStartTest}) => {
  const navigation = useNavigation();
  const {data: test, isLoading, error} = useQuery({
    queryKey: ['dailyTest'],
    queryFn: () => testsService.getDailyTest(),
    retry: 1,
  });

  const handleStartTest = () => {
    if (onStartTest) {
      onStartTest();
    } else {
      // Navigate to test screen
      (navigation as any).navigate('Test', {testId: test?._id});
    }
  };

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text>Завантаження...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (error || !test) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Щоденний тест
          </Text>
          <Text style={styles.errorText}>
            Тест ще не доступний або вже завершено
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const isCompleted = test.is_completed;
  const questionsCount = test.questions?.length || 0;
  const deadline = new Date(test.deadline);
  const now = new Date();
  const timeLeft = deadline.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Щоденний тест
          </Text>
          {!isCompleted && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Новий</Text>
            </View>
          )}
        </View>

        <Text variant="bodyMedium" style={styles.description}>
          {isCompleted
            ? 'Тест пройдено сьогодні'
            : `Пройдіть тест з ${questionsCount} питань`}
        </Text>

        {!isCompleted && timeLeft > 0 && (
          <View style={styles.timeContainer}>
            <Text variant="bodySmall" style={styles.timeText}>
              Залишилось: {hoursLeft} год {minutesLeft} хв
            </Text>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedContainer}>
            <Text variant="bodyMedium" style={styles.completedText}>
              ✓ Тест завершено
            </Text>
          </View>
        )}

        <Button
          mode={isCompleted ? 'outlined' : 'contained'}
          onPress={handleStartTest}
          disabled={isCompleted}
          style={styles.button}
          contentStyle={styles.buttonContent}>
          {isCompleted ? 'Переглянути результати' : 'Почати тест'}
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
    marginBottom: rp(8),
  },
  title: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  badge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: rp(8),
    paddingVertical: rp(4),
    borderRadius: rp(12),
  },
  badgeText: {
    color: '#fff',
    fontSize: rp(10),
    fontWeight: 'bold',
  },
  description: {
    marginBottom: rp(12),
    color: '#757575',
  },
  timeContainer: {
    marginBottom: rp(12),
    padding: rp(8),
    backgroundColor: '#fff3cd',
    borderRadius: rp(8),
  },
  timeText: {
    color: '#856404',
    fontWeight: '500',
  },
  completedContainer: {
    marginBottom: rp(12),
    padding: rp(8),
    backgroundColor: '#d4edda',
    borderRadius: rp(8),
  },
  completedText: {
    color: '#155724',
    fontWeight: '500',
  },
  button: {
    marginTop: rp(8),
  },
  buttonContent: {
    paddingVertical: rp(4),
  },
  errorText: {
    color: '#d32f2f',
    marginTop: rp(8),
  },
});

export default DailyTestCard;

