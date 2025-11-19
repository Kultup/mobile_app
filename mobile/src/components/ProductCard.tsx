import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {Card, Text, Button} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import {getImageUrl} from '../utils/videoQuality';
import {API_BASE_URL} from '../constants/config';
import {rp} from '../utils/responsive';
import {fadeIn, scaleIn} from '../utils/animations';
import type {ShopProduct} from '../types';
import {useAuth} from '../contexts/AuthContext';

interface ProductCardProps {
  product: ShopProduct;
  isPurchased?: boolean;
  onPress?: () => void;
  onPurchase?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isPurchased = false,
  onPress,
  onPurchase,
}) => {
  const {user} = useAuth();
  const canAfford = user ? user.points_balance >= product.price : false;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      fadeIn(fadeAnim, 300),
      scaleIn(scaleAnim, 300),
    ]).start();
  }, []);

  const getTypeLabel = () => {
    const types: Record<string, string> = {
      avatar: 'Аватарка',
      profile_frame: 'Рамка профілю',
      badge: 'Бейдж',
      theme: 'Тема',
      customization: 'Кастомізація',
      gift: 'Подарунок',
    };
    return types[product.product_type] || product.product_type;
  };

  const imageUrl = product.image_url
    ? getImageUrl(product.image_url, API_BASE_URL)
    : null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{scale: scaleAnim}],
      }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card
        style={[
          styles.card,
          isPurchased && styles.purchasedCard,
          !canAfford && !isPurchased && styles.insufficientCard,
        ]}
        mode="elevated">
        {imageUrl && (
          <FastImage
            source={{
              uri: imageUrl,
              priority: FastImage.priority.normal,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            {isPurchased && (
              <View style={styles.purchasedBadge}>
                <Text style={styles.purchasedText}>✓ Куплено</Text>
              </View>
            )}
          </View>

          <Text variant="bodySmall" style={styles.typeLabel}>
            {getTypeLabel()}
          </Text>

          {product.description && (
            <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text variant="headlineSmall" style={styles.price}>
                {product.price}
              </Text>
              <Text variant="bodySmall" style={styles.priceLabel}>
                монет
              </Text>
            </View>

            {!isPurchased && (
              <Button
                mode="contained"
                onPress={onPurchase}
                disabled={!canAfford}
                compact
                style={styles.buyButton}>
                Купити
              </Button>
            )}
          </View>

          {!canAfford && !isPurchased && (
            <Text variant="bodySmall" style={styles.insufficientText}>
              Недостатньо монет
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
    overflow: 'hidden',
  },
  purchasedCard: {
    borderWidth: 2,
    borderColor: '#4caf50',
    backgroundColor: '#f1f8f4',
  },
  insufficientCard: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: rp(150),
    backgroundColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: rp(8),
    marginBottom: rp(4),
  },
  name: {
    flex: 1,
    fontWeight: 'bold',
    color: '#212121',
    marginRight: rp(8),
  },
  purchasedBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: rp(8),
    paddingVertical: rp(4),
    borderRadius: rp(12),
  },
  purchasedText: {
    color: '#fff',
    fontSize: rp(10),
    fontWeight: 'bold',
  },
  typeLabel: {
    color: '#757575',
    marginBottom: rp(4),
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginRight: rp(4),
  },
  priceLabel: {
    color: '#757575',
  },
  buyButton: {
    minWidth: rp(100),
  },
  insufficientText: {
    color: '#f44336',
    marginTop: rp(4),
    textAlign: 'center',
  },
});

export default ProductCard;

