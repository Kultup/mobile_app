import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button, Card} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import {rp, wp, hp} from '../../utils/responsive';

const AuthScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="displaySmall" style={styles.title}>
            Країна Мрій
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Система навчання персоналу
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Login' as never)}
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Увійти
              </Button>

              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Register' as never)}
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Зареєструватися
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rp(16),
    backgroundColor: '#f5f5f5',
  },
  content: {
    width: '100%',
    maxWidth: wp(90),
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: rp(8),
    fontWeight: 'bold',
    color: '#6200ee',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: rp(48),
    color: '#757575',
  },
  card: {
    width: '100%',
  },
  button: {
    marginBottom: rp(12),
    width: '100%',
  },
  buttonContent: {
    paddingVertical: rp(8),
  },
});

export default AuthScreen;


