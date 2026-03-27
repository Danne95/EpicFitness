import React, { useEffect, useRef } from 'react';
import { TouchableWithoutFeedback, Animated, Text, StyleSheet, View } from 'react-native';
import { colors } from '../styles/theme';

interface TogglePillProps {
  value: boolean;
  onChange: (newValue: boolean) => void;
  activeText?: string;
  inactiveText?: string;
  width?: number;
  height?: number;
}

export default function TogglePill({
  value,
  onChange,
  activeText = 'ON',
  inactiveText = 'OFF',
  width = 80,
  height = 35,
}: TogglePillProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      stiffness: 200,
      damping: 20,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2],
  });

  return (
    <TouchableWithoutFeedback onPress={() => onChange(!value)}>
      <View style={[styles.container, { width, height, borderRadius: height / 2 }]}>
        <View style={styles.background}>
          <Text style={[styles.text, { left: 10 }]}>{inactiveText}</Text>
          <Text style={[styles.text, { right: 10 }]}>{activeText}</Text>
        </View>
        <Animated.View
          style={[
            styles.slider,
            {
              width: width / 2 - 4,
              height: height - 4,
              borderRadius: (height - 4) / 2,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.borderSoft,
    justifyContent: 'center',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
  },
  text: { color: colors.textMuted, fontWeight: 'bold' },
  slider: {
    backgroundColor: colors.accent,
    position: 'absolute',
    top: 2,
    left: 2,
  },
});
