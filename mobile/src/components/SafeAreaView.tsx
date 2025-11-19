import React from 'react';
import {SafeAreaView as RNSafeAreaView, StyleSheet} from 'react-native';
import {SafeAreaView as ContextSafeAreaView} from 'react-native-safe-area-context';

interface SafeAreaViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: any;
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  edges = ['top', 'bottom'],
  style,
}) => {
  return (
    <ContextSafeAreaView edges={edges} style={[styles.container, style]}>
      {children}
    </ContextSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaView;

