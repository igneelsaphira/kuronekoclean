import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_ILLUSTRATIONS } from '../data/illustrations';
import { ROOM_THEMES } from '../data/shopItems';

export default function StudyCornerRoom({ themeKey = 'default', purchasedItems = {} }) {
  const palette = ROOM_THEMES[themeKey] || ROOM_THEMES.default;

  return (
    <View style={[styles.room, { backgroundColor: palette.wall }]}> 
      <View style={[styles.wallGlow, { backgroundColor: palette.wallGlow }]} />
      <View style={[styles.floorGlow, { backgroundColor: palette.floorGlow }]} />
      <View style={[styles.floorLine, { backgroundColor: palette.floorLine }]} />

      <View style={styles.windowWrap}>
        <View style={[styles.windowArch, { backgroundColor: palette.windowArch }]} />
        <View style={[styles.windowFrame, { borderColor: palette.windowBorder, backgroundColor: palette.windowInner }]}> 
          <View style={[styles.vine, { backgroundColor: palette.vine }]} />
          <View style={[styles.windowInner, { backgroundColor: palette.windowInner }]} />
          <View style={[styles.cloudA, { backgroundColor: palette.cloudA }]} />
          <View style={[styles.cloudB, { backgroundColor: palette.cloudB }]} />
          <View style={[styles.windowCrossV, { backgroundColor: palette.windowBorder }]} />
          <View style={[styles.windowCrossH, { backgroundColor: palette.windowBorder }]} />
        </View>
      </View>

      <View style={[styles.boardWrap, { borderColor: palette.boardFrame, backgroundColor: palette.board }]}> 
        <View style={[styles.boardInner, { backgroundColor: palette.boardInner }]} />
        <View style={[styles.note, styles.noteA, { backgroundColor: palette.noteA }]} />
        <View style={[styles.note, styles.noteB, { backgroundColor: palette.noteB }]} />
        <View style={[styles.note, styles.noteC, { backgroundColor: palette.noteC }]} />
      </View>

      <View style={styles.wallArtFrame}>
        <Image source={APP_ILLUSTRATIONS.studyScene} style={styles.wallArtImage} resizeMode="contain" />
      </View>

      <View style={[styles.cushionShadow, { backgroundColor: palette.cushionShadow }]} />
      <View style={[styles.cushion, { backgroundColor: palette.cushion, borderColor: palette.cushionBorder }]} />

      {purchasedItems.toy_bell ? (
        <View style={styles.bellWrap}>
          <View style={styles.bellLine} />
          <Text style={styles.bellEmoji}>🔔</Text>
        </View>
      ) : null}

      {purchasedItems.badge_star ? (
        <View style={styles.starJarWrap}>
          <Text style={styles.starJarEmoji}>⭐</Text>
        </View>
      ) : null}

      {purchasedItems.moon_mobile ? (
        <View style={styles.moonWrap}>
          <View style={styles.moonLine} />
          <Text style={styles.moonEmoji}>🌙</Text>
        </View>
      ) : null}

      {purchasedItems.plant_friend ? (
        <View style={styles.plantWrap}>
          <Text style={styles.plantEmoji}>🪴</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  room: {
    ...StyleSheet.absoluteFillObject,
  },
  wallGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  floorGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '31%',
  },
  floorLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '30%',
    height: 2,
  },
  windowWrap: {
    position: 'absolute',
    left: -18,
    top: '6%',
    width: '42%',
    height: '56%',
    alignItems: 'center',
  },
  windowArch: {
    position: 'absolute',
    top: 0,
    width: '88%',
    height: '24%',
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
  },
  windowFrame: {
    marginTop: '16%',
    width: '88%',
    height: '84%',
    borderRadius: 28,
    borderWidth: 5,
    overflow: 'hidden',
  },
  windowInner: {
    ...StyleSheet.absoluteFillObject,
  },
  cloudA: {
    position: 'absolute',
    left: '8%',
    bottom: '14%',
    width: '58%',
    height: '26%',
    borderRadius: 80,
  },
  cloudB: {
    position: 'absolute',
    left: '34%',
    bottom: '20%',
    width: '42%',
    height: '20%',
    borderRadius: 80,
  },
  windowCrossV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '48%',
    width: 3,
  },
  windowCrossH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '48%',
    height: 3,
  },
  vine: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 8,
    height: '55%',
    borderRadius: 10,
  },
  boardWrap: {
    position: 'absolute',
    right: '6%',
    top: '20%',
    width: '56%',
    height: '38%',
    borderRadius: 10,
    borderWidth: 6,
  },
  wallArtFrame: {
    position: 'absolute',
    left: '40%',
    top: '10%',
    width: '18%',
    aspectRatio: 0.8,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wallArtImage: {
    width: '90%',
    height: '90%',
  },
  boardInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 6,
    borderRadius: 4,
  },
  note: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  noteA: {
    left: '11%',
    top: '16%',
    width: '28%',
    height: '34%',
  },
  noteB: {
    left: '41%',
    top: '44%',
    width: '28%',
    height: '28%',
  },
  noteC: {
    right: '8%',
    top: '16%',
    width: '30%',
    height: '44%',
  },
  cushionShadow: {
    position: 'absolute',
    right: '16%',
    bottom: '6.5%',
    width: '46%',
    height: '7.5%',
    borderRadius: 999,
  },
  cushion: {
    position: 'absolute',
    right: '16%',
    bottom: '8.5%',
    width: '46%',
    height: '9.5%',
    borderRadius: 999,
    borderWidth: 2,
  },
  bellWrap: {
    position: 'absolute',
    top: '12%',
    right: '18%',
    alignItems: 'center',
  },
  bellLine: {
    width: 2,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  bellEmoji: {
    fontSize: 18,
  },
  starJarWrap: {
    position: 'absolute',
    left: '44%',
    top: '28%',
  },
  starJarEmoji: {
    fontSize: 18,
  },
  moonWrap: {
    position: 'absolute',
    left: '26%',
    top: '7%',
    alignItems: 'center',
  },
  moonLine: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.46)',
    marginBottom: 4,
  },
  moonEmoji: {
    fontSize: 20,
  },
  plantWrap: {
    position: 'absolute',
    right: '20%',
    bottom: '18%',
  },
  plantEmoji: {
    fontSize: 20,
  },
});
