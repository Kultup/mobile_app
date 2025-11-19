import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {rp} from '../utils/responsive';
import type {TestHistoryItem} from '../services/statistics.service';

interface TestHistoryItemProps {
  test: TestHistoryItem;
  onPress?: () => void;
}

const TestHistoryItemComponent: React.FC<TestHistoryItemProps> = ({
  test,
  onPress,
}) => {
  const percentage =
    test.questions_count > 0
      ? Math.round((test.correct_answers / test.questions_count) * 100)
      : 0;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  const date = new Date(test.test_date);
  const formattedDate = date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.container}>
            <View style={styles.dateContainer}>
              <Text variant="bodySmall" style={styles.date}>
                {formattedDate}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Правильних
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.statValue,
                    {color: getScoreColor(percentage)},
                  ]}>
                  {test.correct_answers}/{test.questions_count}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Відсоток
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.statValue,
                    {color: getScoreColor(percentage)},
                  ]}>
                  {percentage}%
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Бали
                </Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {test.score}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(4),
  },
  container: {
    paddingVertical: rp(4),
  },
  dateContainer: {
    marginBottom: rp(12),
  },
  date: {
    color: '#757575',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#757575',
    marginBottom: rp(4),
  },
  statValue: {
    fontWeight: 'bold',
    color: '#212121',
  },
});

export default TestHistoryItemComponent;

