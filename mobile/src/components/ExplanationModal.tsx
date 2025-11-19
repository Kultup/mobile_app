import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Modal, Portal, Card, Text, Button, Divider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {rp} from '../utils/responsive';

interface ExplanationModalProps {
  visible: boolean;
  onDismiss: () => void;
  onContinue: () => void;
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  knowledgeBaseArticleId?: string;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({
  visible,
  onDismiss,
  onContinue,
  isCorrect,
  correctAnswer,
  explanation,
  knowledgeBaseArticleId,
}) => {
  const navigation = useNavigation();

  const handleReadMore = () => {
    if (knowledgeBaseArticleId) {
      onDismiss();
      (navigation as any).navigate('ArticleView', {
        articleId: knowledgeBaseArticleId,
      });
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.header}>
              <Text
                variant="headlineSmall"
                style={[
                  styles.title,
                  {color: isCorrect ? '#4caf50' : '#f44336'},
                ]}>
                {isCorrect ? '✓ Правильно!' : '✕ Неправильно'}
              </Text>
            </View>

            {!isCorrect && correctAnswer && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Правильна відповідь:
                </Text>
                <Text variant="bodyLarge" style={styles.correctAnswer}>
                  {correctAnswer}
                </Text>
              </View>
            )}

            {explanation && (
              <View style={styles.section}>
                {!isCorrect && correctAnswer && <Divider style={styles.divider} />}
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Пояснення:
                </Text>
                <ScrollView style={styles.explanationContainer}>
                  <Text variant="bodyMedium" style={styles.explanation}>
                    {explanation}
                  </Text>
                </ScrollView>
              </View>
            )}

            <View style={styles.buttonsContainer}>
              {knowledgeBaseArticleId && (
                <Button
                  mode="outlined"
                  onPress={handleReadMore}
                  style={styles.button}
                  icon="book-open-page-variant">
                  Докладніше
                </Button>
              )}
              <Button
                mode="contained"
                onPress={onContinue}
                style={[styles.button, styles.continueButton]}>
                Продовжити
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: rp(16),
  },
  card: {
    maxHeight: '80%',
  },
  header: {
    marginBottom: rp(16),
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: rp(16),
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: rp(8),
    color: '#212121',
  },
  correctAnswer: {
    color: '#4caf50',
    fontWeight: '500',
    padding: rp(12),
    backgroundColor: '#f1f8f4',
    borderRadius: rp(8),
  },
  divider: {
    marginVertical: rp(16),
  },
  explanationContainer: {
    maxHeight: rp(150),
  },
  explanation: {
    color: '#757575',
    lineHeight: rp(22),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: rp(8),
    paddingTop: rp(16),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    marginHorizontal: rp(4),
  },
  continueButton: {
    marginLeft: 'auto',
  },
});

export default ExplanationModal;

