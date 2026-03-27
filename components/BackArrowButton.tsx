import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';

interface Props {
  onPress: () => void;
}

export default function BackArrowButton({ onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button} hitSlop={styles.hitSlop}>
      <Ionicons name="arrow-back-circle" size={30} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.xs,
  },
  hitSlop: {
    top: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xs,
    left: spacing.xs,
  },
});
