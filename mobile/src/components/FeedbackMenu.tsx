import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Button, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {rp} from '../utils/responsive';

const FeedbackMenu: React.FC = () => {
  const navigation = useNavigation();

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Зворотний зв'язок
        </Text>
        <Text variant="bodySmall" style={styles.description}>
          Допоможіть нам покращити систему
        </Text>
        <View style={styles.buttonsContainer}>
          <Button
            mode="outlined"
            onPress={() => (navigation as any).navigate('Surveys')}
            style={styles.button}
            icon="clipboard-text">
            Опитування
          </Button>
          <Button
            mode="outlined"
            onPress={() => (navigation as any).navigate('Feedback')}
            style={styles.button}
            icon="message-text">
            Зворотний зв'язок
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  title: {
    fontWeight: 'bold',
    marginBottom: rp(4),
    color: '#212121',
  },
  description: {
    color: '#757575',
    marginBottom: rp(16),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: rp(8),
  },
  button: {
    flex: 1,
  },
});

export default FeedbackMenu;

