import React from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {Text, Card, Button} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import {feedbackService} from '../../services/feedback.service';
import {rp} from '../../utils/responsive';
import type {Survey} from '../../types';

const SurveysScreen: React.FC = () => {
  const navigation = useNavigation();

  const {data: surveysData, isLoading, refetch} = useQuery({
    queryKey: ['surveys'],
    queryFn: () => feedbackService.getSurveys(),
  });

  const surveys = surveysData?.data || [];

  const handleSurveyPress = (survey: Survey) => {
    (navigation as any).navigate('Survey', {surveyId: survey._id});
  };

  const renderSurvey = ({item}: {item: Survey}) => {
    const getTypeLabel = () => {
      switch (item.survey_type) {
        case 'rating':
          return 'Оцінка';
        case 'text':
          return 'Текстова відповідь';
        case 'multiple_choice':
          return 'Вибір варіантів';
        default:
          return 'Опитування';
      }
    };

    return (
      <Card
        style={styles.card}
        mode="elevated"
        onPress={() => handleSurveyPress(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.title}>
              {item.title}
            </Text>
            {item.is_completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Завершено</Text>
              </View>
            )}
          </View>

          {item.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {item.description}
            </Text>
          )}

          <View style={styles.footer}>
            <Text variant="bodySmall" style={styles.typeLabel}>
              {getTypeLabel()}
            </Text>
            <Button
              mode={item.is_completed ? 'outlined' : 'contained'}
              onPress={() => handleSurveyPress(item)}
              disabled={item.is_completed}
              compact>
              {item.is_completed ? 'Переглянути' : 'Пройти'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.emptyText}>Завантаження опитувань...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Немає доступних опитувань</Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Опитування
          </Text>
        </View>

        <FlatList
          data={surveys}
          renderItem={renderSurvey}
          keyExtractor={item => item._id}
          contentContainerStyle={
            surveys.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmpty}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  list: {
    paddingVertical: rp(8),
  },
  emptyList: {
    flex: 1,
  },
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rp(8),
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    color: '#212121',
    marginRight: rp(8),
  },
  completedBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: rp(8),
    paddingVertical: rp(4),
    borderRadius: rp(12),
  },
  completedText: {
    color: '#fff',
    fontSize: rp(10),
    fontWeight: 'bold',
  },
  description: {
    color: '#757575',
    marginBottom: rp(12),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: rp(8),
    paddingTop: rp(8),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  typeLabel: {
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rp(32),
  },
  emptyText: {
    fontSize: rp(16),
    color: '#757575',
    textAlign: 'center',
    marginTop: rp(16),
  },
});

export default SurveysScreen;

