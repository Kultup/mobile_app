import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Card, Text, RadioButton, Checkbox, TextInput, Button} from 'react-native-paper';
import QuestionMedia from './QuestionMedia';
import {rp} from '../utils/responsive';
import type {Question, Answer} from '../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswers: string[];
  onAnswerChange: (answerIds: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLast: boolean;
  isFirst: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswers,
  onAnswerChange,
  onNext,
  onPrevious,
  isLast,
  isFirst,
}) => {
  const [textAnswer, setTextAnswer] = useState('');

  const handleAnswerSelect = (answerId: string) => {
    if (question.question_type === 'single_choice') {
      onAnswerChange([answerId]);
    } else if (question.question_type === 'multiple_choice') {
      const newAnswers = selectedAnswers.includes(answerId)
        ? selectedAnswers.filter(id => id !== answerId)
        : [...selectedAnswers, answerId];
      onAnswerChange(newAnswers);
    }
  };

  const handleTextAnswerChange = (text: string) => {
    setTextAnswer(text);
    // For text answers, we'll send the text when submitting
  };

  const handleNext = () => {
    if (question.question_type === 'text') {
      // Store text answer
      onAnswerChange([textAnswer]);
    }
    onNext();
  };

  return (
    <Card style={styles.card} mode="elevated">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="titleSmall" style={styles.questionNumber}>
            Питання {questionNumber} з {totalQuestions}
          </Text>
        </View>

        <Text variant="titleMedium" style={styles.questionText}>
          {question.question_text}
        </Text>

        <QuestionMedia
          mediaType={question.media_type}
          imageUrl={question.image_url}
          videoUrl={question.video_url}
          videoThumbnailUrl={question.video_thumbnail_url}
        />

        <View style={styles.answersContainer}>
          {question.question_type === 'single_choice' && (
            <RadioButton.Group
              onValueChange={handleAnswerSelect}
              value={selectedAnswers[0] || ''}>
              {question.answers.map((answer: Answer, index: number) => (
                <View key={index} style={styles.answerItem}>
                  <RadioButton value={index.toString()} />
                  <Text
                    style={styles.answerText}
                    onPress={() => handleAnswerSelect(index.toString())}>
                    {answer.answer_text}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          )}

          {question.question_type === 'multiple_choice' && (
            <View>
              {question.answers.map((answer: Answer, index: number) => (
                <View key={index} style={styles.answerItem}>
                  <Checkbox
                    status={
                      selectedAnswers.includes(index.toString())
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() => handleAnswerSelect(index.toString())}
                  />
                  <Text
                    style={styles.answerText}
                    onPress={() => handleAnswerSelect(index.toString())}>
                    {answer.answer_text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {question.question_type === 'text' && (
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={4}
              value={textAnswer}
              onChangeText={handleTextAnswerChange}
              placeholder="Введіть відповідь"
              style={styles.textInput}
            />
          )}
        </View>

        <View style={styles.buttonsContainer}>
          {!isFirst && (
            <Button
              mode="outlined"
              onPress={onPrevious}
              style={styles.button}>
              Назад
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={
              question.question_type !== 'text' &&
              selectedAnswers.length === 0
            }
            style={[styles.button, styles.nextButton]}>
            {isLast ? 'Завершити тест' : 'Далі'}
          </Button>
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: rp(16),
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: rp(16),
  },
  header: {
    marginBottom: rp(16),
  },
  questionNumber: {
    color: '#757575',
    fontWeight: '500',
  },
  questionText: {
    marginBottom: rp(16),
    fontWeight: '600',
    color: '#212121',
  },
  answersContainer: {
    marginTop: rp(8),
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rp(12),
    paddingVertical: rp(4),
  },
  answerText: {
    flex: 1,
    marginLeft: rp(8),
    fontSize: rp(16),
    color: '#212121',
  },
  textInput: {
    marginTop: rp(8),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: rp(24),
    paddingTop: rp(16),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    marginHorizontal: rp(4),
  },
  nextButton: {
    marginLeft: 'auto',
  },
});

export default QuestionCard;

