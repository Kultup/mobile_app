import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import {Text, Portal} from 'react-native-paper';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigation, useRoute} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import QuestionCard from '../../components/QuestionCard';
import ExplanationModal from '../../components/ExplanationModal';
import {testsService} from '../../services/tests.service';
import {rp} from '../../utils/responsive';
import type {DailyTest, Question} from '../../types';

interface TestScreenParams {
  testId?: string;
}

const TestScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const params = (route.params as TestScreenParams) || {};
  const testId = params.testId;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isStarting, setIsStarting] = useState(false);
  const [explanationModalVisible, setExplanationModalVisible] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<{
    is_correct: boolean;
    correct_answer?: string;
    explanation?: string;
    knowledge_base_article_id?: string;
  } | null>(null);

  // Get daily test
  const {data: testData, isLoading: isLoadingTest} = useQuery({
    queryKey: ['dailyTest'],
    queryFn: () => testsService.getDailyTest(),
    enabled: !testId,
  });

  // Start test mutation
  const startTestMutation = useMutation({
    mutationFn: (id: string) => testsService.startTest(id),
    onSuccess: () => {
      setIsStarting(false);
    },
    onError: (error: any) => {
      setIsStarting(false);
      Alert.alert('Помилка', 'Не вдалося розпочати тест');
      console.error('Start test error:', error);
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({
      questionId,
      selectedAnswerIds,
      textAnswer,
    }: {
      questionId: string;
      selectedAnswerIds: string[];
      textAnswer?: string;
    }) => {
      if (!testIdToUse) throw new Error('Test ID is required');
      return testsService.submitAnswer(
        testIdToUse,
        questionId,
        selectedAnswerIds,
        textAnswer,
      );
    },
  });

  // Complete test mutation
  const completeTestMutation = useMutation({
    mutationFn: (id: string) => testsService.completeTest(id),
    onSuccess: (result, id) => {
      queryClient.invalidateQueries({queryKey: ['dailyTest']});
      queryClient.invalidateQueries({queryKey: ['userProfile']});
      (navigation as any).navigate('TestResults', {
        testId: id,
        score: result.score,
        correctAnswers: result.correct_answers,
        totalQuestions: result.total_questions,
      });
    },
    onError: (error: any) => {
      Alert.alert('Помилка', 'Не вдалося завершити тест');
      console.error('Complete test error:', error);
    },
  });

  const test = testId ? null : testData;
  const testIdToUse = testId || test?._id;

  useEffect(() => {
    if (testIdToUse && !isStarting) {
      setIsStarting(true);
      startTestMutation.mutate(testIdToUse);
    }
  }, [testIdToUse]);

  const handleAnswerChange = (questionId: string, answerIds: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIds,
    }));
  };

  const handleNext = async () => {
    const currentQuestion = test?.questions[currentQuestionIndex];
    if (!currentQuestion || !testIdToUse) return;

    const selectedAnswerIds = answers[currentQuestion._id] || [];
    
    // Submit answer if not text type (text answers are submitted on complete)
    if (currentQuestion.question_type !== 'text' && selectedAnswerIds.length > 0) {
      try {
        const feedback = await submitAnswerMutation.mutateAsync({
          questionId: currentQuestion._id,
          selectedAnswerIds,
        });
        
        // Show explanation modal if answer is incorrect or if there's an explanation
        if (!feedback.is_correct || feedback.explanation) {
          setAnswerFeedback(feedback);
          setExplanationModalVisible(true);
          return; // Don't proceed to next question yet
        }
      } catch (error) {
        console.error('Submit answer error:', error);
      }
    }

    // Proceed to next question or complete test
    proceedToNext();
  };

  const proceedToNext = () => {
    if (currentQuestionIndex < test!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question - complete test
      handleComplete();
    }
  };

  const handleExplanationContinue = () => {
    setExplanationModalVisible(false);
    setAnswerFeedback(null);
    proceedToNext();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!testIdToUse) return;

    const currentQuestion = test?.questions[currentQuestionIndex];
    if (currentQuestion?.question_type === 'text') {
      const textAnswer = answers[currentQuestion._id]?.[0] || '';
      if (textAnswer) {
        try {
          await submitAnswerMutation.mutateAsync({
            questionId: currentQuestion._id,
            selectedAnswerIds: [],
            textAnswer,
          });
        } catch (error) {
          console.error('Submit text answer error:', error);
        }
      }
    }

    completeTestMutation.mutate(testIdToUse);
  };

  if (isLoadingTest || isStarting) {
    return (
      <SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Завантаження тесту...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <SafeAreaView>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Тест не знайдено або вже завершено
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const selectedAnswers = answers[currentQuestion._id] || [];

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={test.questions.length}
          selectedAnswers={selectedAnswers}
          onAnswerChange={(answerIds) =>
            handleAnswerChange(currentQuestion._id, answerIds)
          }
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLast={currentQuestionIndex === test.questions.length - 1}
          isFirst={currentQuestionIndex === 0}
        />
      </View>
      <Portal>
        <ExplanationModal
          visible={explanationModalVisible}
          onDismiss={() => {
            setExplanationModalVisible(false);
            setAnswerFeedback(null);
          }}
          onContinue={handleExplanationContinue}
          isCorrect={answerFeedback?.is_correct ?? false}
          correctAnswer={answerFeedback?.correct_answer}
          explanation={answerFeedback?.explanation}
          knowledgeBaseArticleId={answerFeedback?.knowledge_base_article_id}
        />
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rp(16),
  },
  errorText: {
    fontSize: rp(16),
    color: '#d32f2f',
    textAlign: 'center',
  },
});

export default TestScreen;

