import React, { useMemo } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { useCat } from '../context/CatContext';
import { ROOM_THEMES, SHOP_ITEMS } from '../data/shopItems';
import { TASK_ART_OPTIONS, TASK_ILLUSTRATIONS, getTaskIllustration } from '../data/taskIllustrations';
import { RADII } from '../theme/tokens';
import { useAppTheme } from '../theme/useAppTheme';

function WalletChip({ styles, icon, label, value, tint }) {
  return (
    <View style={styles.walletChip}>
      <Ionicons name={icon} size={16} color={tint} />
      <Text style={styles.walletValue}>{value}</Text>
      <Text style={styles.walletLabel}>{label}</Text>
    </View>
  );
}

export default function TiendaScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideLayout = Platform.OS === 'web' && width >= 1180;
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    monedas,
    corazones,
    purchasedItems,
    equippedTaskArt,
    buyShopItem,
  } = useCat();
  const [previewItem, setPreviewItem] = React.useState(null);

  const themeItems = SHOP_ITEMS.filter((item) => item.type === 'theme');
  const decorItems = SHOP_ITEMS.filter((item) => item.type === 'decor');
  const taskArtItems = SHOP_ITEMS.filter((item) => item.type === 'taskArt');
  const purchasableTaskArtOptions = TASK_ART_OPTIONS.d4.filter((option) => option.purchasable);

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
      <Text style={styles.eyebrow}>Tienda</Text>
      <Text style={styles.title}>Moneditas para mimar a Kuroneko.</Text>
      <Text style={styles.subtitle}>Todo lo que compres aqui se guarda para Kuroneko y queda listo para usar en su lugar correcto.</Text>

      <View style={styles.walletRow}>
        <WalletChip styles={styles} icon="logo-bitcoin" label="Monedas" value={monedas} tint={colors.gold} />
        <WalletChip styles={styles} icon="heart" label="Corazones" value={corazones} tint={colors.pinkStrong} />
      </View>

      <View style={[styles.desktopShopGrid, isWideLayout && styles.desktopShopGridWide]}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Temas del cuarto</Text>
          <Text style={styles.sectionText}>Cada tema cambia la atmosfera general. La ilustracion final la podras ir reemplazando despues sin romper el layout.</Text>

          <View style={styles.themePreview}>
              <View style={styles.paletteRow}>
              <View style={[styles.paletteDot, { backgroundColor: ROOM_THEMES.default.wall }]} />
              <View style={[styles.paletteDot, { backgroundColor: ROOM_THEMES.default.noteA }]} />
              <View style={[styles.paletteDot, { backgroundColor: ROOM_THEMES.default.cushion }]} />
            </View>
            <View style={styles.themePreviewCopy}>
              <Text style={styles.themeName}>Cielo de estudio</Text>
              <Text style={styles.themeDescription}>Tema base incluido desde el inicio.</Text>
            </View>
            <View style={styles.themeActionPill}><Text style={styles.themeActionText}>Incluido</Text></View>
          </View>

          {themeItems.map((item) => {
            const owned = Boolean(purchasedItems[item.id]);
            const palette = ROOM_THEMES[item.themeKey];

            return (
              <View key={item.id} style={styles.shopItem}>
                <View style={styles.paletteRow}>
                  <View style={[styles.paletteDot, { backgroundColor: palette.wall }]} />
                  <View style={[styles.paletteDot, { backgroundColor: palette.noteA }]} />
                  <View style={[styles.paletteDot, { backgroundColor: palette.cushion }]} />
                </View>

                <View style={styles.shopItemCopy}>
                  <Text style={styles.shopItemTitle}>{item.name}</Text>
                  <Text style={styles.shopItemText}>{item.description}</Text>
                </View>

                <TouchableOpacity
                  style={styles.shopButton}
                  onPress={() => { if (!owned) buyShopItem(item.id); }}
                  activeOpacity={0.82}
                >
                  <Text style={styles.shopButtonText}>{owned ? 'Comprado' : `${item.cost} monedas`}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Decoraciones visibles</Text>
          <Text style={styles.sectionText}>Estas piezas aparecen en el cuarto de Kuroneko y quedan listas para que despues pongas tus dibujos definitivos.</Text>

          {decorItems.map((item) => {
            const owned = Boolean(purchasedItems[item.id]);

            return (
              <View key={item.id} style={styles.shopItem}>
                <View style={[styles.futureIconWrap, owned && styles.futureIconWrapOwned]}>
                  <Ionicons name={item.id === 'toy_bell' ? 'sparkles' : item.id === 'moon_mobile' ? 'moon' : item.id === 'plant_friend' ? 'leaf' : 'star'} size={18} color={owned ? colors.mintStrong : colors.lilacStrong} />
                </View>

                <View style={styles.shopItemCopy}>
                  <Text style={styles.shopItemTitle}>{item.name}</Text>
                  <Text style={styles.shopItemText}>{item.description}</Text>
                </View>

                <TouchableOpacity style={styles.shopButton} onPress={() => buyShopItem(item.id)} activeOpacity={0.82}>
                  <Text style={styles.shopButtonText}>{owned ? 'Comprado' : `${item.cost} monedas`}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Iconos de tareas</Text>
        <Text style={styles.sectionText}>Cada variante vive en su tarea correspondiente. Asi se entiende clarito que va en cada lugar.</Text>

        <View style={styles.taskArtCurrent}>
          <TouchableOpacity style={styles.taskArtPreview} activeOpacity={0.9} delayLongPress={2000} onLongPress={() => setPreviewItem({ source: getTaskIllustration('d4', equippedTaskArt), title: 'Tender camas / ordenar' })}>
            <Image source={purchasableTaskArtOptions[0]?.source || getTaskIllustration('d4', equippedTaskArt)} style={styles.taskArtPreviewImage} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.taskArtCurrentCopy}>
            <Text style={styles.shopItemTitle}>Tender camas / ordenar</Text>
            <Text style={styles.shopItemText}>Aqui solo se muestra la version comprable para esta tarea, sin mezclarla con el icono base.</Text>
          </View>
        </View>

        {purchasableTaskArtOptions.map((option) => {
          const storeItem = taskArtItems.find((item) => item.taskArtOptionId === option.id);
          const owned = Boolean(storeItem && purchasedItems[storeItem.id]);

          return (
            <View key={option.id} style={styles.shopItem}>
              <TouchableOpacity style={styles.taskArtMiniPreview} activeOpacity={0.9} delayLongPress={2000} onLongPress={() => setPreviewItem({ source: option.source, title: option.label })}>
                <Image source={option.source} style={styles.taskArtMiniImage} resizeMode="contain" />
              </TouchableOpacity>

              <View style={styles.shopItemCopy}>
                <Text style={styles.shopItemTitle}>{option.label}</Text>
                <Text style={styles.shopItemText}>Version especial comprable para Tender camas / ordenar.</Text>
              </View>

              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => {
                  if (!owned && storeItem) {
                    buyShopItem(storeItem.id);
                  }
                }}
                activeOpacity={0.82}
              >
                <Text style={styles.shopButtonText}>{owned ? 'Comprado' : `${storeItem?.cost || 0} monedas`}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <ImagePreviewModal visible={Boolean(previewItem)} source={previewItem?.source} title={previewItem?.title} colors={colors} onClose={() => setPreviewItem(null)} />
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 18,
    width: '100%',
  },
  contentWide: {
    maxWidth: 1120,
    alignSelf: 'center',
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  walletRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  walletChip: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  walletValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  walletLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  desktopShopGrid: {
    width: '100%',
  },
  desktopShopGridWide: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  sectionCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgGlassStrong,
    marginBottom: 12,
  },
  themePreviewCopy: {
    flex: 1,
    paddingHorizontal: 12,
  },
  themeName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  themeDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  themeActionPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeActionText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paletteDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shopItemCopy: {
    flex: 1,
    paddingHorizontal: 12,
  },
  shopItemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  shopItemText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  shopButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shopButtonText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  futureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.lilac}20`,
    borderWidth: 1,
    borderColor: colors.border,
  },
  futureIconWrapOwned: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  taskArtCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  taskArtPreview: {
    width: 90,
    height: 90,
    borderRadius: RADII.md,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  taskArtPreviewImage: {
    width: '84%',
    height: '84%',
  },
  taskArtCurrentCopy: {
    flex: 1,
  },
  taskArtMiniPreview: {
    width: 54,
    height: 54,
    borderRadius: RADII.md,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  taskArtMiniImage: {
    width: '80%',
    height: '80%',
  },
});


