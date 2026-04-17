import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADII } from '../theme/tokens';

export default function ImagePreviewModal({ visible, source, title, colors, onClose, note, actions }) {
  if (!source) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.card, { backgroundColor: colors.bgGlassStrong, borderColor: colors.borderStrong }]}> 
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{title || 'Vista ampliada'}</Text>
            <Pressable style={[styles.closeBtn, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]} onPress={onClose}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>
          <View style={[styles.imageWrap, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
            <Image source={source} style={styles.image} resizeMode="contain" />
          </View>
          {actions ? <View style={styles.actionsWrap}>{actions}</View> : null}
          <Text style={[styles.note, { color: colors.textMuted }]}>{note || 'Toca el dibujo para verlo mas grande.'}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 10, 18, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    paddingRight: 12,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  imageWrap: {
    height: 320,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  actionsWrap: {
    marginTop: 12,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
