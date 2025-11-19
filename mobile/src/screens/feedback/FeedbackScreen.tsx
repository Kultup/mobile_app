import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {Text, Card, Button, TextInput, SegmentedButtons} from 'react-native-paper';
import {useMutation} from '@tanstack/react-query';
import SafeAreaView from '../../components/SafeAreaView';
import {feedbackService} from '../../services/feedback.service';
import {rp} from '../../utils/responsive';

type FeedbackType = 'question' | 'error';

const FeedbackScreen: React.FC = () => {
  const toast = useToastContext();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('question');
  const [questionText, setQuestionText] = useState('');
  const [suggestedAnswers, setSuggestedAnswers] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [comment, setComment] = useState('');
  const [errorDescription, setErrorDescription] = useState('');
  const [questionId, setQuestionId] = useState('');

  const suggestQuestionMutation = useMutation({
    mutationFn: () =>
      feedbackService.suggestQuestion({
        question_text: questionText,
        suggested_answers: suggestedAnswers
          ? suggestedAnswers.split(',').map(s => s.trim())
          : undefined,
        category_id: categoryId || undefined,
        comment: comment || undefined,
      }),
    onSuccess: (response) => {
      toast.showSuccess(response.message);
      setQuestionText('');
      setSuggestedAnswers('');
      setCategoryId('');
      setComment('');
    },
    onError: (error: any) => {
      toast.showError(
        error.response?.data?.message || 'Не вдалося відправити пропозицію',
      );
    },
  });

  const reportErrorMutation = useMutation({
    mutationFn: () =>
      feedbackService.reportError({
        question_id: questionId || undefined,
        description: errorDescription,
      }),
    onSuccess: (response) => {
      toast.showSuccess(response.message);
      setErrorDescription('');
      setQuestionId('');
    },
    onError: (error: any) => {
      toast.showError(
        error.response?.data?.message || 'Не вдалося відправити повідомлення',
      );
    },
  });

  const handleSubmit = () => {
    if (feedbackType === 'question') {
      if (!questionText.trim()) {
        Alert.alert('Помилка', 'Будь ласка, введіть текст питання');
        return;
      }
      suggestQuestionMutation.mutate();
    } else {
      if (!errorDescription.trim()) {
        Alert.alert('Помилка', 'Будь ласка, опишіть помилку');
        return;
      }
      reportErrorMutation.mutate();
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Зворотний зв'язок
          </Text>
        </View>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <SegmentedButtons
              value={feedbackType}
              onValueChange={value => setFeedbackType(value as FeedbackType)}
              buttons={[
                {value: 'question', label: 'Запропонувати питання'},
                {value: 'error', label: 'Повідомити про помилку'},
              ]}
              style={styles.segmentedButtons}
            />

            {feedbackType === 'question' ? (
              <View style={styles.formContainer}>
                <Text variant="bodyLarge" style={styles.label}>
                  Текст питання *
                </Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  value={questionText}
                  onChangeText={setQuestionText}
                  placeholder="Введіть текст питання..."
                  style={styles.input}
                />

                <Text variant="bodyMedium" style={styles.label}>
                  Варіанти відповідей (через кому, опційно)
                </Text>
                <TextInput
                  mode="outlined"
                  value={suggestedAnswers}
                  onChangeText={setSuggestedAnswers}
                  placeholder="Варіант 1, Варіант 2, Варіант 3..."
                  style={styles.input}
                />

                <Text variant="bodyMedium" style={styles.label}>
                  ID категорії (опційно)
                </Text>
                <TextInput
                  mode="outlined"
                  value={categoryId}
                  onChangeText={setCategoryId}
                  placeholder="ID категорії"
                  style={styles.input}
                />

                <Text variant="bodyMedium" style={styles.label}>
                  Коментар (опційно)
                </Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Додаткові коментарі..."
                  style={styles.input}
                />
              </View>
            ) : (
              <View style={styles.formContainer}>
                <Text variant="bodyLarge" style={styles.label}>
                  Опис помилки *
                </Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={6}
                  value={errorDescription}
                  onChangeText={setErrorDescription}
                  placeholder="Детально опишіть помилку..."
                  style={styles.input}
                />

                <Text variant="bodyMedium" style={styles.label}>
                  ID питання (якщо помилка пов'язана з питанням, опційно)
                </Text>
                <TextInput
                  mode="outlined"
                  value={questionId}
                  onChangeText={setQuestionId}
                  placeholder="ID питання"
                  style={styles.input}
                />
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={
                suggestQuestionMutation.isPending ||
                reportErrorMutation.isPending
              }
              disabled={
                suggestQuestionMutation.isPending ||
                reportErrorMutation.isPending
              }
              style={styles.submitButton}>
              Відправити
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
  header: {
    padding: rp(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#212121',
  },
  card: {
    marginTop: rp(8),
  },
  segmentedButtons: {
    marginBottom: rp(24),
  },
  formContainer: {
    marginBottom: rp(16),
  },
  label: {
    fontWeight: '500',
    marginBottom: rp(8),
    marginTop: rp(8),
    color: '#212121',
  },
  input: {
    marginBottom: rp(16),
  },
  submitButton: {
    marginTop: rp(8),
  },
});

export default FeedbackScreen;

