import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Text, Card, Button, TextInput, RadioButton, Checkbox} from 'react-native-paper';
import {useQuery, useMutation} from '@tanstack/react-query';
import {useNavigation, useRoute} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import {useToastContext} from '../../components/ToastProvider';
import {feedbackService} from '../../services/feedback.service';
import {rp} from '../../utils/responsive';
import type {Survey} from '../../types';

interface SurveyScreenParams {
  surveyId: string;
}

const SurveyScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToastContext();
  const params = (route.params as SurveyScreenParams) || {};
  const {surveyId} = params;

  const [rating, setRating] = useState<number | undefined>();
  const [responseText, setResponseText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const {data: surveysData, isLoading} = useQuery({
    queryKey: ['surveys'],
    queryFn: () => feedbackService.getSurveys(),
  });

  const survey = surveysData?.data?.find(s => s._id === surveyId);

  const respondMutation = useMutation({
    mutationFn: (data: {
      rating?: number;
      response_text?: string;
      selected_options?: string[];
    }) => feedbackService.respondToSurvey(surveyId, data),
    onSuccess: (response) => {
      toast.showSuccess(response.message);
      setTimeout(() => navigation.goBack(), 500);
    },
    onError: (error: any) => {
      toast.showError(
        error.response?.data?.message || 'Не вдалося відправити відповідь',
      );
    },
  });

  const handleSubmit = () => {
    if (survey?.survey_type === 'rating' && !rating) {
      Alert.alert('Помилка', 'Будь ласка, оберіть оцінку');
      return;
    }

    if (survey?.survey_type === 'text' && !responseText.trim()) {
      Alert.alert('Помилка', 'Будь ласка, введіть відповідь');
      return;
    }

    if (
      survey?.survey_type === 'multiple_choice' &&
      selectedOptions.length === 0
    ) {
      Alert.alert('Помилка', 'Будь ласка, оберіть хоча б один варіант');
      return;
    }

    const data: any = {};
    if (rating !== undefined) data.rating = rating;
    if (responseText) data.response_text = responseText;
    if (selectedOptions.length > 0) data.selected_options = selectedOptions;

    respondMutation.mutate(data);
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Завантаження опитування...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!survey) {
    return (
      <SafeAreaView>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Опитування не знайдено</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Назад
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (survey.is_completed) {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={styles.title}>
                {survey.title}
              </Text>
              <View style={styles.completedContainer}>
                <Text style={styles.completedText}>
                  ✓ Ви вже пройшли це опитування
                </Text>
              </View>
              <Button mode="outlined" onPress={() => navigation.goBack()}>
                Назад
              </Button>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              {survey.title}
            </Text>
            {survey.description && (
              <Text variant="bodyMedium" style={styles.description}>
                {survey.description}
              </Text>
            )}

            <View style={styles.formContainer}>
              {survey.survey_type === 'rating' && (
                <View style={styles.ratingContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    Оберіть оцінку:
                  </Text>
                  <View style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map(value => (
                      <Button
                        key={value}
                        mode={rating === value ? 'contained' : 'outlined'}
                        onPress={() => setRating(value)}
                        style={styles.ratingButton}>
                        {value}
                      </Button>
                    ))}
                  </View>
                </View>
              )}

              {survey.survey_type === 'text' && (
                <View style={styles.textContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    Ваша відповідь:
                  </Text>
                  <TextInput
                    mode="outlined"
                    multiline
                    numberOfLines={6}
                    value={responseText}
                    onChangeText={setResponseText}
                    placeholder="Введіть вашу відповідь..."
                    style={styles.textInput}
                  />
                </View>
              )}

              {survey.survey_type === 'multiple_choice' &&
                survey.options && (
                  <View style={styles.optionsContainer}>
                    <Text variant="bodyLarge" style={styles.label}>
                      Оберіть варіанти:
                    </Text>
                    {survey.options.map((option, index) => (
                      <View key={index} style={styles.optionItem}>
                        <Checkbox
                          status={
                            selectedOptions.includes(option)
                              ? 'checked'
                              : 'unchecked'
                          }
                          onPress={() => handleOptionToggle(option)}
                        />
                        <Text
                          style={styles.optionText}
                          onPress={() => handleOptionToggle(option)}>
                          {option}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={respondMutation.isPending}
              disabled={respondMutation.isPending}
              style={styles.submitButton}>
              Відправити відповідь
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
    padding: rp(32),
  },
  errorText: {
    fontSize: rp(16),
    color: '#d32f2f',
    marginBottom: rp(24),
    textAlign: 'center',
  },
  card: {
    marginBottom: rp(16),
  },
  title: {
    fontWeight: 'bold',
    marginBottom: rp(16),
    color: '#212121',
  },
  description: {
    color: '#757575',
    marginBottom: rp(24),
  },
  completedContainer: {
    padding: rp(16),
    backgroundColor: '#d4edda',
    borderRadius: rp(8),
    marginBottom: rp(16),
  },
  completedText: {
    color: '#155724',
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: rp(24),
  },
  ratingContainer: {
    marginBottom: rp(16),
  },
  label: {
    fontWeight: '500',
    marginBottom: rp(12),
    color: '#212121',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: rp(8),
  },
  ratingButton: {
    minWidth: rp(50),
  },
  textContainer: {
    marginBottom: rp(16),
  },
  textInput: {
    marginTop: rp(8),
  },
  optionsContainer: {
    marginBottom: rp(16),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rp(12),
    paddingVertical: rp(4),
  },
  optionText: {
    flex: 1,
    marginLeft: rp(8),
    fontSize: rp(16),
    color: '#212121',
  },
  submitButton: {
    marginTop: rp(8),
  },
});

export default SurveyScreen;

