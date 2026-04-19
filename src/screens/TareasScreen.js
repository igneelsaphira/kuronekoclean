import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { useCat } from '../context/CatContext';
import { SHOP_ITEMS } from '../data/shopItems';
import { TASK_ART_OPTIONS, getTaskIllustration } from '../data/taskIllustrations';
import { RADII } from '../theme/tokens';
import { useAppTheme } from '../theme/useAppTheme';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todo' },
  { key: 'quick', label: 'Cortitas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'done', label: 'Hechas' },
];

function getMinutes(duration) {
  const match = String(duration).match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function TaskCard({ task, accent, colors, illustrationSource, onToggle, onPreview }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const imageSource = illustrationSource;

  return (
    <TouchableOpacity style={[styles.taskCard, task.hecha && styles.taskCardDone]} onPress={onToggle} activeOpacity={0.84}>
      <TouchableOpacity
        style={[styles.taskEmojiWrap, { borderColor: `${accent}55`, backgroundColor: `${accent}18` }]}
        activeOpacity={0.9}
        onPress={() => imageSource && onPreview?.(imageSource, task.nombre)}
      >
        {imageSource ? <Image source={imageSource} style={styles.taskArt} resizeMode="contain" /> : <Text style={styles.taskEmoji}>{task.icono}</Text>}
      </TouchableOpacity>

      <View style={styles.taskCopy}>
        <View style={styles.taskTitleRow}>
          <Text style={[styles.taskTitle, task.hecha && styles.taskTitleDone]}>{task.nombre}</Text>
          <View style={styles.durationChip}>
            <Text style={styles.durationChipText}>{task.duracion}</Text>
          </View>
        </View>
        <Text style={styles.taskDetail}>{task.detalle}</Text>
      </View>

      <View style={[styles.checkCircle, task.hecha && styles.checkCircleDone]}>
        {task.hecha ? <Ionicons name="checkmark" size={16} color={colors.bg} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function TareasScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const isWideLayout = Platform.OS === 'web' && width >= 1180;
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    tareasDiaria,
    tareasSemanal,
    tareasMensual,
    tareasAnual,
    resumenRutinas,
    marcarTarea,
    reiniciarDia,
    reiniciarSemana,
    reiniciarMes,
    reiniciarAño,
    purchasedItems,
    equippedTaskArt,
    buyShopItem,
    equipTaskArt,
  } = useCat();

  const TAB_OPTIONS = useMemo(() => ([
    { key: 'diaria', label: 'Urgente', accent: colors.mintStrong },
    { key: 'semanal', label: 'Esta semana', accent: colors.lilacStrong },
    { key: 'mensual', label: 'Toma tiempo', accent: colors.pinkStrong },
    { key: 'anual', label: 'Con calma', accent: colors.gold },
  ]), [colors.gold, colors.lilacStrong, colors.mintStrong, colors.pinkStrong]);

  const [pestaña, setPestaña] = useState('diaria');
  const [filtro, setFiltro] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    if (route.params?.presetTab) setPestaña(route.params.presetTab);
    if (route.params?.presetFilter) setFiltro(route.params.presetFilter);
  }, [route.params]);

  const datos = {
    diaria: { tareas: tareasDiaria, reiniciar: reiniciarDia },
    semanal: { tareas: tareasSemanal, reiniciar: reiniciarSemana },
    mensual: { tareas: tareasMensual, reiniciar: reiniciarMes },
    anual: { tareas: tareasAnual, reiniciar: reiniciarAño },
  };

  const { tareas, reiniciar } = datos[pestaña];
  const resumen = resumenRutinas[pestaña];
  const accent = TAB_OPTIONS.find((tab) => tab.key === pestaña)?.accent || colors.mintStrong;

  const tareasFiltradas = useMemo(() => {
    if (filtro === 'quick') return tareas.filter((task) => !task.hecha && getMinutes(task.duracion) <= 12);
    if (filtro === 'pending') return tareas.filter((task) => !task.hecha);
    if (filtro === 'done') return tareas.filter((task) => task.hecha);
    return tareas;
  }, [filtro, tareas]);

  const mensajeResumen = useMemo(() => {
    if (resumen.pendientes === 0) return 'Rutina cerrada por hoy. Puedes respirar un poco.';
    if (resumen.hechas === 0) return 'Empieza por una sola tarea. No hace falta hacerlo todo.';
    return `Te quedan ${resumen.pendientes} pendientes en esta rutina.`;
  }, [resumen]);

  const mensajeFiltro = useMemo(() => {
    if (filtro === 'quick') return 'Mostrando solo tareas de 12 min o menos.';
    if (filtro === 'pending') return 'Mostrando solo lo que sigue pendiente.';
    if (filtro === 'done') return 'Mostrando solo lo que ya cerraste.';
    return 'Vista completa de esta rutina.';
  }, [filtro]);

  const previewActions = useMemo(() => {
    if (!previewItem?.taskId || !TASK_ART_OPTIONS[previewItem.taskId]?.length) return null;

    return (
      <View style={styles.previewOptionsWrap}>
        <Text style={styles.previewOptionsTitle}>Cambiar dibujo aqui mismo</Text>
        {TASK_ART_OPTIONS[previewItem.taskId].map((option) => {
          const storeItem = SHOP_ITEMS.find((item) => item.type === 'taskArt' && item.taskId === previewItem.taskId && item.taskArtOptionId === option.id);
          const owned = !option.purchasable || Boolean(storeItem && purchasedItems[storeItem.id]);
          const active = equippedTaskArt?.[previewItem.taskId] === option.id;

          return (
            <View key={option.id} style={[styles.previewOptionRow, active && styles.previewOptionRowActive]}>
              <View style={styles.previewOptionThumb}>
                <Image source={option.source} style={styles.previewOptionThumbImage} resizeMode="contain" />
              </View>
              <View style={styles.previewOptionCopy}>
                <Text style={styles.previewOptionLabel}>{option.label}</Text>
                <Text style={styles.previewOptionNote}>{active ? 'Es el dibujo que se muestra ahora.' : owned ? 'Ya lo tienes disponible.' : `Cuesta ${storeItem?.cost || 0} monedas.`}</Text>
              </View>
              <TouchableOpacity
                style={[styles.previewOptionButton, active && styles.previewOptionButtonActive]}
                onPress={() => {
                  if (owned) {
                    equipTaskArt(previewItem.taskId, option.id);
                    setPreviewItem((prev) => prev ? { ...prev, source: option.source } : prev);
                  } else if (storeItem) {
                    buyShopItem(storeItem.id);
                  }
                }}
                activeOpacity={0.82}
              >
                <Text style={[styles.previewOptionButtonText, active && styles.previewOptionButtonTextActive]}>
                  {active ? 'Activo' : owned ? 'Usar' : `${storeItem?.cost || 0} monedas`}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  }, [buyShopItem, equipTaskArt, equippedTaskArt, previewItem, purchasedItems, styles]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isWideLayout && styles.contentWide,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>Rutinas</Text>
        <Text style={styles.title}>Tareas claras, suaves y bonitas.</Text>
        <Text style={styles.subtitle}>Toca una tarea para marcarla. Puedes moverte por hoy, semana, mes o limpieza profunda sin perder el hilo.</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>{TAB_OPTIONS.find((tab) => tab.key === pestaña)?.label}</Text>
              <Text style={styles.summaryValue}>{Math.round(resumen.porcentaje)}%</Text>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={reiniciar} activeOpacity={0.82}>
              <Ionicons name="refresh-outline" size={16} color={colors.textSoft} />
              <Text style={styles.resetButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryBarTrack}>
            <View style={[styles.summaryBarFill, { width: `${Math.max(6, resumen.porcentaje)}%`, backgroundColor: accent }]} />
          </View>

          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStat}><Text style={styles.summaryStatValue}>{resumen.hechas}</Text><Text style={styles.summaryStatLabel}>hechas</Text></View>
            <View style={styles.summaryStat}><Text style={styles.summaryStatValue}>{resumen.pendientes}</Text><Text style={styles.summaryStatLabel}>pendientes</Text></View>
            <View style={styles.summaryStat}><Text style={styles.summaryStatValue}>{resumen.total}</Text><Text style={styles.summaryStatLabel}>total</Text></View>
          </View>

          <Text style={styles.summaryText}>{mensajeResumen}</Text>
        </View>

        <View style={styles.tabsRow}>
          {TAB_OPTIONS.map((tab) => {
            const isActive = pestaña === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && { borderColor: `${tab.accent}99`, backgroundColor: `${tab.accent}18` }]}
                onPress={() => setPestaña(tab.key)}
                activeOpacity={0.82}
              >
                <Text style={[styles.tabButtonText, isActive && { color: colors.text }]}>{tab.label}</Text>
                <Text style={[styles.tabButtonCount, isActive && { color: tab.accent }]}>{resumenRutinas[tab.key].hechas}/{resumenRutinas[tab.key].total}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((option) => {
            const isActive = filtro === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.filterChip, isActive && { borderColor: `${accent}99`, backgroundColor: `${accent}18` }]}
                onPress={() => setFiltro(option.key)}
                activeOpacity={0.82}
              >
                <Text style={[styles.filterChipText, isActive && { color: colors.text }]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.filterMessage}>{mensajeFiltro}</Text>

        <View style={styles.listWrap}>
          {tareasFiltradas.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              accent={accent}
              colors={colors}
              illustrationSource={getTaskIllustration(task.id, equippedTaskArt)}
              onPreview={(source, title) => setPreviewItem({ source, title, taskId: task.id })}
              onToggle={() => marcarTarea(pestaña, task.id)}
            />
          ))}

          {!tareasFiltradas.length ? (
            <View style={styles.emptyCard}>
              <Ionicons name="moon-outline" size={20} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>Nada por mostrar en este filtro.</Text>
              <Text style={styles.emptyText}>Prueba otra vista o cambia de rutina.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <ImagePreviewModal
        visible={Boolean(previewItem)}
        source={previewItem?.source}
        title={previewItem?.title}
        colors={colors}
        actions={previewActions}
        onClose={() => setPreviewItem(null)}
      />
    </View>
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
    maxWidth: 980,
    alignSelf: 'center',
  },
  eyebrow: {
    color: colors.mintStrong,
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
  summaryCard: {
    padding: 18,
    borderRadius: RADII.lg,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryBarTrack: {
    height: 11,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgCardAlt,
    overflow: 'hidden',
    marginBottom: 14,
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: RADII.pill,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryStat: {
    flex: 1,
  },
  summaryStatValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryStatLabel: {
    color: colors.textFaint,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  tabButton: {
    width: '47%',
    padding: 14,
    borderRadius: RADII.md,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  tabButtonCount: {
    color: colors.textFaint,
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  filterMessage: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  listWrap: {
    gap: 12,
  },
  emptyCard: {
    padding: 18,
    borderRadius: RADII.lg,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgGlass,
  },
  taskCardDone: {
    borderColor: `${colors.pinkStrong}4a`,
    backgroundColor: `${colors.pink}16`,
  },
  taskEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskEmoji: {
    fontSize: 22,
  },
  taskArt: {
    width: '78%',
    height: '78%',
  },
  taskCopy: {
    flex: 1,
    paddingRight: 10,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  taskTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  taskTitleDone: {
    color: colors.pinkStrong,
    textDecorationLine: 'line-through',
  },
  durationChip: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationChipText: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '700',
  },
  taskDetail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.pinkStrong,
    borderColor: colors.pinkStrong,
  },
  previewOptionsWrap: {
    gap: 10,
  },
  previewOptionsTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  previewOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADII.md,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewOptionRowActive: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  previewOptionThumb: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewOptionThumbImage: {
    width: '80%',
    height: '80%',
  },
  previewOptionCopy: {
    flex: 1,
    paddingHorizontal: 10,
  },
  previewOptionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewOptionNote: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  previewOptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewOptionButtonActive: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  previewOptionButtonText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  previewOptionButtonTextActive: {
    color: colors.mintStrong,
  },
});
