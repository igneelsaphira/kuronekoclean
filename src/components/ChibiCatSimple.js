import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

/**
 * Gato negro con Views: bostezo y parpadeo (sin respiración, la hace el padre).
 */
export default function ChibiCatSimple() {
  const mouthHeight = useRef(new Animated.Value(2)).current;
  const eyeClose = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const runYawn = () => {
      Animated.sequence([
        Animated.timing(mouthHeight, { toValue: 14, duration: 400, useNativeDriver: false }),
        Animated.timing(mouthHeight, { toValue: 2, duration: 500, useNativeDriver: false }),
      ]).start();
      setTimeout(runYawn, 6000);
    };
    const t = setTimeout(runYawn, 4000);
    return () => clearTimeout(t);
  }, [mouthHeight]);

  useEffect(() => {
    const runBlink = () => {
      Animated.sequence([
        Animated.timing(eyeClose, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(eyeClose, { toValue: 0, duration: 100, useNativeDriver: false }),
      ]).start();
      setTimeout(runBlink, 3000 + Math.random() * 2000);
    };
    const t = setTimeout(runBlink, 2500);
    return () => clearTimeout(t);
  }, [eyeClose]);

  const eyeHeight = eyeClose.interpolate({ inputRange: [0, 1], outputRange: [4, 0.5] });

  return (
    <>
      <View style={styles.bodyLying} />
      <View style={styles.headWrap}>
        <View style={styles.earLeft} />
        <View style={styles.earRight} />
        <View style={styles.head}>
          <View style={styles.eyesRow}>
            <Animated.View style={[styles.eye, { height: eyeHeight }]} />
            <Animated.View style={[styles.eye, { height: eyeHeight }]} />
          </View>
          <View style={styles.nose} />
          <Animated.View style={[styles.mouth, { height: mouthHeight }]} />
        </View>
      </View>
      <View style={styles.tail} />
    </>
  );
}

const styles = StyleSheet.create({
  bodyLying: {
    position: 'absolute',
    width: 85,
    height: 38,
    borderRadius: 42,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#0d0d0d',
    top: 28,
    left: 18,
  },
  headWrap: {
    position: 'relative',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  earLeft: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1a1a1a',
    top: 0,
    left: 8,
    transform: [{ rotate: '-155deg' }],
  },
  earRight: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1a1a1a',
    top: 0,
    left: 48,
    transform: [{ rotate: '155deg' }],
  },
  head: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 6,
  },
  eye: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2d2d2d',
    overflow: 'hidden',
  },
  nose: {
    width: 8,
    height: 6,
    borderRadius: 4,
    borderWidth: 0,
    borderColor: '#333',
    backgroundColor: '#333',
    marginBottom: 4,
  },
  mouth: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#333',
  },
  tail: {
    position: 'absolute',
    bottom: 22,
    right: -8,
    width: 24,
    height: 6,
    borderBottomWidth: 2.5,
    borderBottomColor: '#1a1a1a',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 8,
    transform: [{ rotate: '20deg' }],
  },
});
