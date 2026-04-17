import React, { useMemo, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { APP_ILLUSTRATIONS } from '../data/illustrations';
import { TASK_ILLUSTRATIONS } from '../data/taskIllustrations';
import { useAuth } from '../context/AuthContext';
import { useCat } from '../context/CatContext';
import { RADII } from '../theme/tokens';
import { useAppTheme } from '../theme/useAppTheme';
import { REMINDER_PRESETS } from '../utils/notifications';

function ToggleRow({ styles, title, note, value, onPress, icon }) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.toggleCopy}>
        <View style={styles.toggleTitleRow}>
          <Ionicons name={icon} size={16} color={styles.__colors.blue} />
          <Text style={styles.toggleTitle}>{title}</Text>
        </View>
        <Text style={styles.toggleNote}>{note}</Text>
      </View>
      <View style={[styles.togglePill, value && styles.togglePillOn]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
      </View>
    </TouchableOpacity>
  );
}

export default function AjustesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideLayout = Platform.OS === 'web' && width >= 1180;
  const { colors, themeMode, toggleThemeMode } = useAppTheme();
  const { user, configured, authBusy, authError, signInWithGoogle, signOut } = useAuth();
  const {
    settings,
    notificationStatus,
    achievements,
    minigameStats,
    syncStatus,
    cloudSaveEnabled,
    updateSettingValue,
    setReminderEnabled,
    setReminderSlot,
  } = useCat();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const settingsGallery = [APP_ILLUSTRATIONS.studyScene, TASK_ILLUSTRATIONS.d1, TASK_ILLUSTRATIONS.d7];
  const [previewItem, setPreviewItem] = useState(null);

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
      <Text style={styles.eyebrow}>Ajustes</Text>
      <Text style={styles.title}>Haz la app mas tuya.</Text>
      <Text style={styles.subtitle}>Recordatorios suaves, modo cozy, tema calido y una vitrina de logros para Kuroneko.</Text>

      <View style={[styles.sectionCard, styles.accountHeroCard]}>
        <View style={styles.accountHeroHeader}>
          <View style={styles.accountHeroCopy}>
            <Text style={styles.sectionTitle}>Cuenta y guardado</Text>
            <Text style={styles.sectionText}>
              Entra con Google para no perder tareas, monedas, compras, tema e iconos cuando cambies de equipo o borres la app.
            </Text>
          </View>
          <View style={styles.accountHeroBadge}>
            <Ionicons name={user ? 'cloud-done-outline' : 'cloud-outline'} size={18} color={user ? colors.mintStrong : colors.blueStrong} />
            <Text style={styles.accountHeroBadgeText}>{user ? 'Guardando' : 'Sin login'}</Text>
          </View>
        </View>

        <View style={styles.accountStatusCard}>
          <Text style={styles.accountStatusTitle}>{user?.email || 'Sin sesion activa'}</Text>
          <Text style={styles.accountStatusText}>
            {cloudSaveEnabled
              ? `Guardado remoto activo (${syncStatus}).`
              : configured
                ? 'Todavia no has iniciado sesion. Puedes hacerlo aqui mismo.'
                : 'Falta configurar Supabase para activar el login.'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.accountPrimaryButton, styles.accountHeroButton]}
          onPress={user ? signOut : signInWithGoogle}
          activeOpacity={0.82}
          disabled={authBusy || !configured}
        >
          <Ionicons name={user ? 'log-out-outline' : 'logo-google'} size={16} color={colors.text} />
          <Text style={styles.accountPrimaryButtonText}>
            {authBusy ? 'Procesando...' : user ? 'Cerrar sesion' : 'Entrar con Google'}
          </Text>
        </TouchableOpacity>

        {!configured ? <Text style={styles.accountHelperText}>Agrega las variables de Supabase para habilitar cuentas y nube.</Text> : null}
        {authError ? <Text style={styles.accountErrorText}>{authError}</Text> : null}
      </View>

      <View style={styles.galleryRow}>
        {settingsGallery.map((image, index) => (
          <TouchableOpacity
            key={index}
            style={styles.galleryTile}
            activeOpacity={0.9}
            delayLongPress={2000}
            onLongPress={() => setPreviewItem({ source: image, title: 'Vista ajustes' })}
          >
            <Image source={image} style={styles.galleryImage} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.settingsGrid, isWideLayout && styles.settingsGridWide]}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tema</Text>
          <Text style={styles.sectionText}>Dark sigue siendo la base nocturna. Bright ahora es mas crema, calido y domestico.</Text>

          <TouchableOpacity style={styles.themeSwitch} onPress={toggleThemeMode} activeOpacity={0.84}>
            <View style={styles.themeOption}>
              <Ionicons name="moon-outline" size={16} color={colors.lilacStrong} />
              <Text style={styles.themeOptionText}>Dark</Text>
            </View>
            <View style={styles.themeOptionCenter}>
              <View style={[styles.themeOptionKnob, themeMode === 'light' && styles.themeOptionKnobLight]} />
            </View>
            <View style={styles.themeOption}>
              <Ionicons name="sunny-outline" size={16} color={colors.gold} />
              <Text style={styles.themeOptionText}>Bright</Text>
            </View>
          </TouchableOpacity>

          <ToggleRow
            styles={styles}
            title="Modo cozy"
            note="Mantiene el tono amable y sin castigos fuertes en las interacciones."
            value={settings.cozyMode}
            onPress={() => updateSettingValue('cozyMode', !settings.cozyMode)}
            icon="moon-outline"
          />

          <ToggleRow
            styles={styles}
            title="Sonido suave"
            note="Activa pequenos pops y tonos tiernos en minijuegos y recompensas."
            value={settings.soundEnabled}
            onPress={() => updateSettingValue('soundEnabled', !settings.soundEnabled)}
            icon="musical-notes-outline"
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recordatorios</Text>
          <Text style={styles.sectionText}>
            {Platform.OS === 'web'
              ? 'En web solo queda configurado. En celular podras usar las notificaciones reales.'
              : 'Activa una senal diaria pequena para volver a la rutina sin sentir presion.'}
          </Text>

          <ToggleRow
            styles={styles}
            title="Recordatorio diario"
            note={notificationStatus === 'denied' ? 'El permiso fue rechazado. Puedes intentarlo otra vez.' : 'Una notificacion breve y amable una vez al dia.'}
            value={settings.remindersEnabled}
            onPress={() => setReminderEnabled(!settings.remindersEnabled)}
            icon="notifications-outline"
          />

          <View style={styles.reminderSlots}>
            {Object.values(REMINDER_PRESETS).map((preset) => {
              const active = settings.reminderSlot === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.slotButton, active && styles.slotButtonActive]}
                  onPress={() => setReminderSlot(preset.id)}
                  activeOpacity={0.82}
                >
                  <Text style={[styles.slotButtonTitle, active && styles.slotButtonTitleActive]}>{preset.label}</Text>
                  <Text style={[styles.slotButtonText, active && styles.slotButtonTextActive]}>
                    {`${preset.hour.toString().padStart(2, '0')}:${preset.minute.toString().padStart(2, '0')}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={[styles.settingsGrid, isWideLayout && styles.settingsGridWide]}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Logros</Text>
          <Text style={styles.sectionText}>Microdesbloqueos que muestran como va creciendo la relacion con Kuroneko.</Text>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={[styles.achievementRow, achievement.unlocked && styles.achievementRowUnlocked]}>
              <View style={[styles.achievementIconWrap, achievement.unlocked && styles.achievementIconWrapUnlocked]}>
                <Ionicons name={achievement.icon} size={16} color={achievement.unlocked ? colors.mintStrong : colors.textFaint} />
              </View>
              <View style={styles.achievementCopy}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementNote}>{achievement.note}</Text>
              </View>
              <Text style={[styles.achievementState, achievement.unlocked && styles.achievementStateUnlocked]}>
                {achievement.unlocked ? 'Listo' : 'Bloq.'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Actividad</Text>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Minijuegos jugados</Text>
            <Text style={styles.activityValue}>{minigameStats.totalPlayed || 0}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Ultimo minijuego</Text>
            <Text style={styles.activityValue}>{minigameStats.lastPlayedGame || 'ninguno'}</Text>
          </View>
        </View>
      </View>

      <ImagePreviewModal
        visible={Boolean(previewItem)}
        source={previewItem?.source}
        title={previewItem?.title}
        colors={colors}
        onClose={() => setPreviewItem(null)}
      />
    </ScrollView>
  );
}

const createStyles = (colors) => {
  const styles = StyleSheet.create({
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
      color: colors.blue,
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
    galleryRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    galleryTile: {
      flex: 1,
      height: 92,
      borderRadius: RADII.lg,
      backgroundColor: colors.bgGlass,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    galleryImage: {
      width: '82%',
      height: '82%',
    },
    settingsGrid: {
      width: '100%',
    },
    settingsGridWide: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'stretch',
    },
    sectionCard: {
      flex: 1,
      padding: 18,
      borderRadius: RADII.lg,
      backgroundColor: colors.bgGlass,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    accountHeroCard: {
      backgroundColor: colors.bgGlassStrong,
      borderColor: colors.borderStrong,
    },
    accountHeroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    accountHeroCopy: {
      flex: 1,
    },
    accountHeroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: RADII.pill,
      backgroundColor: colors.bgCardAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    accountHeroBadgeText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
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
    accountStatusCard: {
      padding: 14,
      borderRadius: RADII.lg,
      backgroundColor: colors.bgGlassStrong,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    accountStatusTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 4,
    },
    accountStatusText: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    accountPrimaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: RADII.lg,
      backgroundColor: colors.bgCardAlt,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    accountHeroButton: {
      minHeight: 48,
    },
    accountPrimaryButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '800',
    },
    accountHelperText: {
      color: colors.textFaint,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 10,
    },
    accountErrorText: {
      color: colors.pinkStrong,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 10,
    },
    themeSwitch: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: RADII.lg,
      backgroundColor: colors.bgGlassStrong,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    themeOptionText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    themeOptionCenter: {
      width: 68,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.bgCardAlt,
      padding: 4,
      justifyContent: 'center',
    },
    themeOptionKnob: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.lilacStrong,
    },
    themeOptionKnobLight: {
      alignSelf: 'flex-end',
      backgroundColor: colors.gold,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    toggleCopy: {
      flex: 1,
      paddingRight: 12,
    },
    toggleTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    toggleTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    toggleNote: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    togglePill: {
      width: 48,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.bgCardAlt,
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    togglePillOn: {
      backgroundColor: colors.successBg,
    },
    toggleKnob: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.textFaint,
    },
    toggleKnobOn: {
      alignSelf: 'flex-end',
      backgroundColor: colors.mintStrong,
    },
    reminderSlots: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 12,
    },
    slotButton: {
      flex: 1,
      minWidth: 92,
      padding: 12,
      borderRadius: RADII.md,
      backgroundColor: colors.bgGlassStrong,
      borderWidth: 1,
      borderColor: colors.border,
    },
    slotButtonActive: {
      borderColor: colors.blueStrong,
      backgroundColor: `${colors.blue}25`,
    },
    slotButtonTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 4,
    },
    slotButtonTitleActive: {
      color: colors.blueStrong,
    },
    slotButtonText: {
      color: colors.textMuted,
      fontSize: 12,
    },
    slotButtonTextActive: {
      color: colors.textSoft,
    },
    achievementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    achievementRowUnlocked: {
      backgroundColor: colors.successBg,
    },
    achievementIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bgGlassStrong,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 12,
    },
    achievementIconWrapUnlocked: {
      backgroundColor: colors.successBg,
      borderColor: colors.successBorder,
    },
    achievementCopy: {
      flex: 1,
    },
    achievementTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 4,
    },
    achievementNote: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    achievementState: {
      color: colors.textFaint,
      fontSize: 11,
      fontWeight: '700',
    },
    achievementStateUnlocked: {
      color: colors.mintStrong,
    },
    activityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    activityLabel: {
      color: colors.textMuted,
      fontSize: 13,
    },
    activityValue: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
  });

  styles.__colors = colors;
  return styles;
};
