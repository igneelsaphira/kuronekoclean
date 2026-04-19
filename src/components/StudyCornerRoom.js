import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { APP_ILLUSTRATIONS } from '../data/illustrations';

export default function StudyCornerRoom() {
  return (
    <ImageBackground source={APP_ILLUSTRATIONS.studyScene} style={styles.room} imageStyle={styles.image} resizeMode="cover">
      <View style={styles.softWash} />
      <View style={styles.bottomBlend} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  room: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d8c1b5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  softWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 243, 0.06)',
  },
  bottomBlend: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '34%',
    backgroundColor: 'rgba(247, 235, 228, 0.16)',
  },
});
