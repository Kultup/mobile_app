import {Dimensions, PixelRatio} from 'react-native';
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro - 375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale font size based on screen width
 */
export const scale = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scale);
};

/**
 * Scale font size with pixel ratio
 */
export const scaleFont = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get responsive width percentage
 */
export const wp = (percentage: number): number => {
  return widthPercentageToDP(percentage);
};

/**
 * Get responsive height percentage
 */
export const hp = (percentage: number): number => {
  return heightPercentageToDP(percentage);
};

/**
 * Get responsive font size
 */
export const rf = (size: number): number => {
  return scaleFont(size);
};

/**
 * Get responsive padding/margin
 */
export const rp = (size: number): number => {
  return scale(size);
};

