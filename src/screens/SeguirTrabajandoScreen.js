import React, { useMemo } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { BLOQUES, INTRO, RECORDATORIOS, TITULO_PAGINA } from '../data/seguirTrabajando';
import { TASK_ILLUSTRATIONS } from '../data/taskIllustrations';
import { RADII } from '../theme/tokens';
import { useAppTheme } from '../theme/useAppTheme';

export default function SeguirTrabajandoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isWideLayout = Platform.OS === 'web' && width >= 1180;
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const ritualGallery = [TASK_ILLUSTRATIONS.d4, TASK_ILLUSTRATIONS.d7, TASK_ILLUSTRATIONS.d8];
  const [previewItem, setPreviewItem] = React.useState(null);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        isWideLayout && styles.contentWide,
        { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>Ritual</Text>
      <Text style={styles.title}>{TITULO_PAGINA}</Text>
      <Text style={styles.intro}>{INTRO}</Text>

      <View style={styles.ritualGalleryRow}>
        {ritualGallery.map((image, index) => (
          <TouchableOpacity key={index} style={styles.ritualGalleryTile} activeOpacity={0.9} delayLongPress={2000} onLongPress={() => setPreviewItem({ source: image, title: 'Vista ritual' })}>
            <Image source={image} style={styles.ritualGalleryImage} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.blocksGrid, isWideLayout && styles.blocksGridWide]}>
        {BLOQUES.map((bloque, index) => (
          <View key={bloque.titulo} style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.step}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.cardTitle}>{bloque.titulo}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{bloque.subtitulo}</Text>
            <View style={styles.listWrap}>
              {bloque.pasos.map((paso) => (
                <View key={paso} style={styles.listItem}>
                  <View style={styles.listDot} />
                  <Text style={styles.listText}>{paso}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.reminderCard}>
        <Text style={styles.reminderTitle}>Recuerdos utiles</Text>
        {RECORDATORIOS.map((item) => <Text key={item} style={styles.reminderText}>• {item}</Text>)}
      </View>

      <View style={styles.ctaRow}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Rutinas', { presetTab: 'diaria', presetFilter: 'quick' })} activeOpacity={0.85}>
          <Text style={styles.ctaButtonText}>Abrir tareas cortitas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaGhost} onPress={() => navigation.navigate('Inicio')} activeOpacity={0.85}>
          <Text style={styles.ctaGhostText}>Volver con Kuroneko</Text>
        </TouchableOpacity>
      </View>

      <ImagePreviewModal visible={Boolean(previewItem)} source={previewItem?.source} title={previewItem?.title} colors={colors} onClose={() => setPreviewItem(null)} />
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, width: '100%' },
  contentWide: { maxWidth: 1080, alignSelf: 'center' },
  eyebrow: { color: colors.pinkStrong, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', marginBottom: 8 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', lineHeight: 34, marginBottom: 10 },
  intro: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  ritualGalleryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  ritualGalleryTile: { flex: 1, height: 96, borderRadius: RADII.lg, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ritualGalleryImage: { width: '82%', height: '82%' },
  blocksGrid: { width: '100%' },
  blocksGridWide: { flexDirection: 'row', gap: 14, alignItems: 'stretch' },
  card: { flex: 1, padding: 18, borderRadius: RADII.lg, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  step: { color: colors.blue, fontSize: 12, fontWeight: '700', marginRight: 12 },
  cardTitle: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '700', lineHeight: 24 },
  cardSubtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  listWrap: { gap: 10 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start' },
  listDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mintStrong, marginTop: 6, marginRight: 10 },
  listText: { flex: 1, color: colors.textSoft, fontSize: 14, lineHeight: 21 },
  reminderCard: { padding: 18, borderRadius: RADII.lg, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border },
  reminderTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 12 },
  reminderText: { color: colors.textMuted, fontSize: 13, lineHeight: 21, marginBottom: 8 },
  ctaRow: { gap: 12, marginTop: 16 },
  ctaButton: { paddingVertical: 15, paddingHorizontal: 16, borderRadius: RADII.pill, backgroundColor: colors.lilacStrong, alignItems: 'center' },
  ctaButtonText: { color: colors.bg, fontSize: 13, fontWeight: '800' },
  ctaGhost: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: RADII.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.bgGlass, alignItems: 'center' },
  ctaGhostText: { color: colors.text, fontSize: 13, fontWeight: '700' },
});
