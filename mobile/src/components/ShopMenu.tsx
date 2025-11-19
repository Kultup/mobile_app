import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Button, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../contexts/AuthContext';
import {rp} from '../utils/responsive';

const ShopMenu: React.FC = () => {
  const navigation = useNavigation();
  const {user} = useAuth();

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            Магазин
          </Text>
          <View style={styles.balanceContainer}>
            <Text variant="headlineSmall" style={styles.balance}>
              {user?.points_balance || 0} 🪙
            </Text>
          </View>
        </View>
        <Text variant="bodySmall" style={styles.description}>
          Купуйте аватарки, рамки, теми та інші товари
        </Text>
        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={() => (navigation as any).navigate('Shop')}
            style={styles.button}
            icon="store">
            Магазин
          </Button>
          <Button
            mode="outlined"
            onPress={() => (navigation as any).navigate('Purchases')}
            style={styles.button}
            icon="history">
            Мої покупки
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rp(8),
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  description: {
    color: '#757575',
    marginBottom: rp(16),
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: rp(8),
  },
  button: {
    flex: 1,
  },
});

export default ShopMenu;

