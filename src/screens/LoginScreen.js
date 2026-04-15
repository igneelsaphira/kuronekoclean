import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADII } from '../theme/tokens';
import { useAppTheme } from '../theme/useAppTheme';

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function LoginScreen({
  mandatory = false,
  remainingGraceMs = 0,
  configured = true,
  loading = false,
  error = null,
  onGooglePress,
  onContinue,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <View style={styles.glowA} />
      <View style={styles.glowB} />

      <View style={styles.card}>
        <Text style={styles.eyebrow}>Cuenta</Text>
        <Text style={styles.title}>{mandatory ? 'Inicia sesion para seguir usando Kuroclean.' : 'Guarda tu progreso con tu cuenta.'}</Text>
        <Text style={styles.subtitle}>
          {mandatory
            ? 'Tu avance, compras, tema, iconos y monedas quedaran unidos a tu usuario.'
            : 'Puedes seguir sin cuenta por unos minutos, pero despues el login sera obligatorio para no perder el progreso.'}
        </Text>

        {!mandatory ? (
          <View style={styles.timerPill}>
            <Ionicons name="time-outline" size={14} color={colors.gold} />
            <Text style={styles.timerText}>Tiempo sin login: {formatRemaining(remainingGraceMs)}</Text>
          </View>
        ) : null}

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitTitle}>Se guardara por usuario:</Text>
          <Text style={styles.benefitText}>Tareas, monedas, compras, tema, iconos, minijuegos y ajustes.</Text>
        </View>

        <TouchableOpacity
          style={[styles.googleButton, (!configured || loading) && styles.googleButtonDisabled]}
          onPress={onGooglePress}
          activeOpacity={0.84}
          disabled={!configured || loading}
        >
          {loading ? <ActivityIndicator color={colors.text} /> : <Ionicons name="logo-google" size={18} color={colors.text} />}
          <Text style={styles.googleButtonText}>{configured ? 'Entrar con Google' : 'Falta configurar Supabase'}</Text>
        </TouchableOpacity>

        {!configured ? (
          <Text style={styles.helperText}>Agrega `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para activar login y guardado remoto.</Text>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!mandatory ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={onContinue} activeOpacity={0.84}>
            <Text style={styles.secondaryButtonText}>Seguir por ahora</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  glowA: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -60,
    left: -40,
    backgroundColor: `${colors.blue}30`,
  },
  glowB: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    bottom: -50,
    right: -30,
    backgroundColor: `${colors.lilac}25`,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 22,
    borderRadius: RADII.xl,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  timerText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  benefitsCard: {
    padding: 14,
    borderRadius: RADII.lg,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  benefitTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  benefitText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADII.lg,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  googleButtonDisabled: {
    opacity: 0.55,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgGlass,
  },
  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  helperText: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  errorText: {
    color: colors.pinkStrong,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
