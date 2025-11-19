import {Animated} from 'react-native';

/**
 * Fade in animation
 */
export const fadeIn = (
  animatedValue: Animated.Value,
  duration = 300,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (
  animatedValue: Animated.Value,
  duration = 300,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Scale animation (for achievements, cards, etc.)
 */
export const scaleIn = (
  animatedValue: Animated.Value,
  duration = 300,
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  });
};

/**
 * Bounce animation (for achievement unlock)
 */
export const bounce = (
  animatedValue: Animated.Value,
  duration = 600,
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.2,
      duration: duration / 2,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration / 2,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Slide in from bottom
 * Note: animatedValue should be initialized with distance value before calling this
 */
export const slideInFromBottom = (
  animatedValue: Animated.Value,
  distance = 50,
  duration = 300,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Pulse animation
 */
export const pulse = (
  animatedValue: Animated.Value,
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]),
  );
};

