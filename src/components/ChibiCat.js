import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import ChibiCatSimple from './ChibiCatSimple';

/**
 * Kuro: gato negro con respiración + bostezo + parpadeo (todo con Views, sin SVG).
 */
export default function ChibiCat() {
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.04,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [breathe]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: breathe }] }]}>
      <ChibiCatSimple />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
