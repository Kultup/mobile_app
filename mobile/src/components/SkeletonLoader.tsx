import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {rp} from '../utils/responsive';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = rp(20),
  borderRadius = rp(4),
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
});

// Predefined skeleton components
export const SkeletonCard: React.FC = () => (
  <View style={skeletonStyles.card}>
    <SkeletonLoader width="60%" height={rp(20)} style={skeletonStyles.title} />
    <SkeletonLoader width="100%" height={rp(16)} style={skeletonStyles.text} />
    <SkeletonLoader width="80%" height={rp(16)} style={skeletonStyles.text} />
  </View>
);

export const SkeletonListItem: React.FC = () => (
  <View style={skeletonStyles.listItem}>
    <SkeletonLoader
      width={rp(50)}
      height={rp(50)}
      borderRadius={rp(25)}
      style={skeletonStyles.avatar}
    />
    <View style={skeletonStyles.listItemContent}>
      <SkeletonLoader width="60%" height={rp(18)} style={skeletonStyles.text} />
      <SkeletonLoader width="40%" height={rp(14)} style={skeletonStyles.text} />
    </View>
  </View>
);

export const SkeletonProductCard: React.FC = () => (
  <View style={skeletonStyles.productCard}>
    <SkeletonLoader width="100%" height={rp(150)} style={skeletonStyles.image} />
    <View style={skeletonStyles.productContent}>
      <SkeletonLoader width="70%" height={rp(18)} style={skeletonStyles.text} />
      <SkeletonLoader width="50%" height={rp(14)} style={skeletonStyles.text} />
      <SkeletonLoader width="40%" height={rp(20)} style={skeletonStyles.price} />
    </View>
  </View>
);

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: rp(16),
    borderRadius: rp(8),
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  title: {
    marginBottom: rp(12),
  },
  text: {
    marginBottom: rp(8),
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: rp(16),
    marginHorizontal: rp(16),
    marginVertical: rp(4),
    borderRadius: rp(8),
  },
  avatar: {
    marginRight: rp(12),
  },
  listItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  productCard: {
    backgroundColor: '#fff',
    marginHorizontal: rp(16),
    marginVertical: rp(8),
    borderRadius: rp(8),
    overflow: 'hidden',
  },
  image: {
    marginBottom: rp(8),
  },
  productContent: {
    padding: rp(12),
  },
  price: {
    marginTop: rp(8),
  },
});

export default SkeletonLoader;

