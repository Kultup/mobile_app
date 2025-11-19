import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, Button, ProgressBar} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import {rp} from '../../utils/responsive';

interface TestResultsScreenParams {
  testId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

const TestResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as TestResultsScreenParams) || {};
  const {score, correctAnswers, totalQuestions} = params;

  const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const getResultMessage = () => {
    if (percentage >= 80) {
      return {
        title: 'Відмінно! 🎉',
        message: 'Ви показали чудові результати!',
        color: '#4caf50',
      };
    } else if (percentage >= 60) {
      return {
        title: 'Добре! 👍',
        message: 'Непоганий результат, продовжуйте!',
        color: '#ff9800',
      };
    } else {
      return {
        title: 'Треба ще попрацювати 💪',
        message: 'Не здавайтеся, продовжуйте навчання!',
        color: '#f44336',
      };
    }
  };

  const result = getResultMessage();

  return (
    <SafeAreaView>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.header}>
              <Text variant="headlineMedium" style={styles.title}>
                Результати тесту
              </Text>
            </View>

            <View style={styles.scoreContainer}>
              <Text variant="displaySmall" style={[styles.score, {color: result.color}]}>
                {correctAnswers}/{totalQuestions}
              </Text>
              <Text variant="titleLarge" style={[styles.resultTitle, {color: result.color}]}>
                {result.title}
              </Text>
              <Text variant="bodyLarge" style={styles.resultMessage}>
                {result.message}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <Text variant="bodyMedium" style={styles.progressLabel}>
                Правильних відповідей: {percentage.toFixed(0)}%
              </Text>
              <ProgressBar
                progress={percentage / 100}
                color={result.color}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {score}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Балів нараховано
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {correctAnswers}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Правильних
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {totalQuestions - correctAnswers}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Помилок
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={() => navigation.navigate('Home' as never)}
              style={styles.button}
              contentStyle={styles.buttonContent}>
              На головну
            </Button>
          </Card.Content>
        </Card>
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
    padding: rp(16),
  },
  card: {
    marginBottom: rp(16),
  },
  header: {
    alignItems: 'center',
    marginBottom: rp(24),
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: rp(24),
  },
  score: {
    fontWeight: 'bold',
    marginBottom: rp(8),
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: rp(8),
    textAlign: 'center',
  },
  resultMessage: {
    textAlign: 'center',
    color: '#757575',
    marginTop: rp(8),
  },
  progressContainer: {
    marginBottom: rp(24),
  },
  progressLabel: {
    marginBottom: rp(8),
    color: '#757575',
  },
  progressBar: {
    height: rp(8),
    borderRadius: rp(4),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: rp(24),
    paddingTop: rp(24),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    textAlign: 'center',
  },
  button: {
    marginTop: rp(8),
  },
  buttonContent: {
    paddingVertical: rp(4),
  },
});

export default TestResultsScreen;

