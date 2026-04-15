import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CatProvider, useCat } from './src/context/CatContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import GatitoScreen from './src/screens/GatitoScreen';
import TareasScreen from './src/screens/TareasScreen';
import TiendaScreen from './src/screens/TiendaScreen';
import SeguirTrabajandoScreen from './src/screens/SeguirTrabajandoScreen';
import AjustesScreen from './src/screens/AjustesScreen';
import LoginScreen from './src/screens/LoginScreen';
import { PHONE_FRAME, RADII } from './src/theme/tokens';
import { useAppTheme } from './src/theme/useAppTheme';

const Tab = createBottomTabNavigator();

const TAB_ITEMS = [
  { name: 'Inicio', icon: 'home-outline', iconActive: 'home' },
  { name: 'Rutinas', icon: 'checkmark-circle-outline', iconActive: 'checkmark-circle' },
  { name: 'Tienda', icon: 'bag-outline', iconActive: 'bag' },
  { name: 'Ritual', icon: 'sparkles-outline', iconActive: 'sparkles' },
  { name: 'Ajustes', icon: 'settings-outline', iconActive: 'settings' },
];

function MetricCard({ styles, label, value, accent, note }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.metricNote}>{note}</Text>
    </View>
  );
}

function DesktopCompanionPanel({ styles, colors }) {
  const {
    progresoAseo,
    progresoGeneral,
    hambre,
    felicidad,
    resumenRutinas,
    kuroScore,
    kuroLevel,
    sugerenciasHoy,
    monedas,
    corazones,
    equippedTheme,
  } = useCat();

  return (
    <View style={styles.desktopPanel}>
      <View style={styles.desktopHero}>
        <Text style={styles.desktopEyebrow}>Kuroclean</Text>
        <Text style={styles.desktopTitle}>Una companera suave para ordenar dias reales.</Text>
        <Text style={styles.desktopText}>Limpieza amable, mini recompensas y una casita cozy para Kuroneko.</Text>

        <View style={styles.desktopBadgeRow}>
          <View style={styles.desktopBadge}>
            <Text style={styles.desktopBadgeLabel}>Nivel</Text>
            <Text style={styles.desktopBadgeValue}>{kuroLevel.label}</Text>
          </View>
          <View style={styles.desktopBadge}>
            <Text style={styles.desktopBadgeLabel}>Puntaje</Text>
            <Text style={styles.desktopBadgeValue}>{kuroScore}</Text>
          </View>
        </View>

        <View style={styles.desktopWalletRow}>
          <View style={styles.desktopWalletChip}><Ionicons name="logo-bitcoin" size={14} color={colors.gold} /><Text style={styles.desktopWalletText}>{monedas}</Text></View>
          <View style={styles.desktopWalletChip}><Ionicons name="heart" size={14} color={colors.pinkStrong} /><Text style={styles.desktopWalletText}>{corazones}</Text></View>
          <View style={styles.desktopWalletChip}><Ionicons name="color-palette-outline" size={14} color={colors.mintStrong} /><Text style={styles.desktopWalletText}>{equippedTheme}</Text></View>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <MetricCard styles={styles} label="Rutina de hoy" value={`${Math.round(progresoAseo)}%`} accent={colors.blue} note="Pequenos avances siguen contando." />
        <MetricCard styles={styles} label="Progreso total" value={`${Math.round(progresoGeneral)}%`} accent={colors.lilacStrong} note="Todo suma aunque vayas lento." />
        <MetricCard styles={styles} label="Hambre Kuro" value={`${Math.round(hambre)}%`} accent={colors.gold} note="Un recordatorio suave para cuidar." />
        <MetricCard styles={styles} label="Felicidad Kuro" value={`${Math.round(felicidad)}%`} accent={colors.mintStrong} note="Tu energia y la casa se contagian." />
      </View>

      <View style={styles.desktopGuide}>
        <Text style={styles.desktopSectionTitle}>Buenas primeras tareas</Text>
        {sugerenciasHoy.length ? sugerenciasHoy.map((task) => (
          <View key={task.id} style={styles.desktopTaskRow}>
            <Text style={styles.desktopTaskEmoji}>{task.icono}</Text>
            <View style={styles.desktopTaskCopy}>
              <Text style={styles.desktopTaskTitle}>{task.nombre}</Text>
              <Text style={styles.desktopTaskDetail}>{task.duracion} · {task.detalle}</Text>
            </View>
          </View>
        )) : <Text style={styles.desktopTaskEmpty}>Por ahora no quedan sugerencias visibles. Buen trabajo.</Text>}
      </View>

      <View style={styles.desktopBreakdown}>
        {[
          ['Hoy', resumenRutinas.diaria.hechas, resumenRutinas.diaria.total],
          ['Semana', resumenRutinas.semanal.hechas, resumenRutinas.semanal.total],
          ['Mes', resumenRutinas.mensual.hechas, resumenRutinas.mensual.total],
          ['Profundo', resumenRutinas.anual.hechas, resumenRutinas.anual.total],
        ].map(([label, done, total]) => (
          <View key={label} style={styles.desktopBreakdownCard}>
            <Text style={styles.desktopBreakdownLabel}>{label}</Text>
            <Text style={styles.desktopBreakdownValue}>{done}/{total}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function WebPhoneShell({ styles, children }) {
  const { width: rawW, height: rawH } = useWindowDimensions();
  const winW = Math.max(rawW || 800, 320);
  const winH = Math.max(rawH || 900, 500);
  const availableW = Math.max(1, winW - 28);
  const availableH = Math.max(1, winH - 28);
  const scale = Math.min(availableW / PHONE_FRAME.width, availableH / PHONE_FRAME.height, 1);
  const frameW = Math.round(PHONE_FRAME.width * scale);
  const frameH = Math.round(PHONE_FRAME.height * scale);

  return (
    <View style={styles.webPhoneWrap}>
      <View style={styles.webPhoneHeader}><Text style={styles.webPhoneHeaderText}>Vista mobile</Text></View>
      <View style={[styles.webPhone, { width: frameW, height: frameH }]}>
        <View style={styles.webPhoneInner}>{children}</View>
      </View>
    </View>
  );
}

function DesktopTopBar({ styles, colors, activeRoute, onNavigate }) {
  return (
    <View style={styles.desktopTopBar}>
      <View style={styles.desktopTopBrand}>
        <Text style={styles.desktopTopBrandText}>Kuroclean</Text>
      </View>
      <View style={styles.desktopTopTabs}>
        {TAB_ITEMS.map((item) => {
          const active = activeRoute === item.name;
          return (
            <TouchableOpacity key={item.name} style={[styles.desktopTopTab, active && styles.desktopTopTabActive]} onPress={() => onNavigate(item.name)} activeOpacity={0.82}>
              <Ionicons name={active ? item.iconActive : item.icon} size={16} color={active ? colors.text : colors.textMuted} />
              <Text style={[styles.desktopTopTabText, active && styles.desktopTopTabTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function AppTabs({ styles, colors, hideTabBar = false }) {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      tabBar={hideTabBar ? () => null : undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        sceneStyle: styles.sceneCompact,
        tabBarIcon: ({ color, focused, size }) => {
          const item = TAB_ITEMS.find((entry) => entry.name === route.name);
          return <Ionicons name={focused ? item.iconActive : item.icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={GatitoScreen} />
      <Tab.Screen name="Rutinas" component={TareasScreen} />
      <Tab.Screen name="Tienda" component={TiendaScreen} />
      <Tab.Screen name="Ritual" component={SeguirTrabajandoScreen} />
      <Tab.Screen name="Ajustes" component={AjustesScreen} />
    </Tab.Navigator>
  );
}

function AuthReminderBanner({ styles, colors }) {
  const { remainingGraceMs, signInWithGoogle, authBusy } = useAuth();
  const minutes = Math.floor(remainingGraceMs / 60000);
  const seconds = Math.floor((remainingGraceMs % 60000) / 1000);
  const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.authBanner}>
      <View style={styles.authBannerCopy}>
        <Text style={styles.authBannerTitle}>Inicia sesion para guardar tu progreso</Text>
        <Text style={styles.authBannerText}>En {timerText} el login pasara a ser obligatorio.</Text>
      </View>
      <TouchableOpacity style={styles.authBannerButton} onPress={signInWithGoogle} activeOpacity={0.82} disabled={authBusy}>
        <Ionicons name="logo-google" size={14} color={colors.text} />
        <Text style={styles.authBannerButtonText}>{authBusy ? 'Abriendo...' : 'Entrar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function DesktopWideApp({ styles, colors, navigationTheme, themeMode }) {
  const navigationRef = useNavigationContainerRef();
  const [activeRoute, setActiveRoute] = useState('Inicio');
  const { height } = useWindowDimensions();
  const desktopHeight = Math.max(720, Math.min(height - 48, 980));

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onReady={() => setActiveRoute(navigationRef.getCurrentRoute()?.name || 'Inicio')}
      onStateChange={() => setActiveRoute(navigationRef.getCurrentRoute()?.name || 'Inicio')}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.webRoot}>
        <View style={[styles.webGlowA, { backgroundColor: colors.lilac + '33' }]} />
        <View style={[styles.webGlowB, { backgroundColor: colors.blue + '22' }]} />

        <View style={[styles.webWideLayout, { minHeight: desktopHeight, height: desktopHeight }]}> 
          <View style={styles.desktopMainColumn}>
            <DesktopTopBar styles={styles} colors={colors} activeRoute={activeRoute} onNavigate={(routeName) => navigationRef.navigate(routeName)} />
            <View style={styles.desktopMainContainer}>
              <AppTabs styles={styles} colors={colors} hideTabBar />
            </View>
          </View>

          <View style={styles.desktopPanelWrap}>
            <DesktopCompanionPanel styles={styles} colors={colors} />
          </View>
        </View>
      </View>
    </NavigationContainer>
  );
}

function CompactApp({ styles, colors, themeMode }) {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: 'transparent',
          card: colors.bgCard,
          text: colors.text,
          border: 'transparent',
          primary: colors.lilacStrong,
        },
      }}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <View style={Platform.OS === 'web' ? styles.webRootCompact : styles.mobileRoot}>
        {Platform.OS === 'web' ? <WebPhoneShell styles={styles}><AppTabs styles={styles} colors={colors} /></WebPhoneShell> : <AppTabs styles={styles} colors={colors} />}
      </View>
    </NavigationContainer>
  );
}

function ThemedAppChrome() {
  const { colors, themeMode } = useAppTheme();
  const { authRequired, remainingGraceMs, isAuthenticated, configured, loading, authBusy, authError, signInWithGoogle } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 1180;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const root = document.getElementById('root');
      if (root) {
        root.style.flex = '1';
        root.style.display = 'flex';
        root.style.flexDirection = 'column';
        root.style.minHeight = '100vh';
        root.style.width = '100%';
      }
      document.body.style.margin = '0';
      document.body.style.minHeight = '100vh';
      document.body.style.backgroundColor = colors.bg;
      document.documentElement.style.height = '100%';
    }
  }, [colors.bg]);

  const navigationTheme = useMemo(() => ({
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
      card: colors.bgCard,
      text: colors.text,
      border: 'transparent',
      primary: colors.lilacStrong,
    },
  }), [colors]);

  if (authRequired) {
    return (
      <LoginScreen
        mandatory
        configured={configured}
        loading={loading || authBusy}
        error={authError}
        remainingGraceMs={remainingGraceMs}
        onGooglePress={signInWithGoogle}
      />
    );
  }

  if (isWideWeb) {
    return (
      <View style={styles.appFrame}>
        <DesktopWideApp styles={styles} colors={colors} navigationTheme={navigationTheme} themeMode={themeMode} />
        {!isAuthenticated ? <AuthReminderBanner styles={styles} colors={colors} /> : null}
      </View>
    );
  }

  return (
    <View style={styles.appFrame}>
      <CompactApp styles={styles} colors={colors} themeMode={themeMode} />
      {!isAuthenticated ? <AuthReminderBanner styles={styles} colors={colors} /> : null}
    </View>
  );
}

function AppNavigation() {
  return (
    <AuthProvider>
      <CatProvider>
        <ThemedAppChrome />
      </CatProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigation />
    </SafeAreaProvider>
  );
}

const createStyles = (colors) => StyleSheet.create({
  mobileRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  appFrame: {
    flex: 1,
  },
  webRootCompact: {
    flex: 1,
    minHeight: '100vh',
    width: '100%',
    backgroundColor: colors.bg,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 22,
    position: 'relative',
    overflow: 'auto',
  },
  webRoot: {
    flex: 1,
    minHeight: '100vh',
    width: '100%',
    backgroundColor: colors.bg,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 22,
    position: 'relative',
    overflow: 'auto',
  },
  webGlowA: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    top: -120,
    left: -80,
  },
  webGlowB: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    bottom: -100,
    right: -70,
  },
  webWideLayout: {
    width: '100%',
    maxWidth: 1360,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  desktopMainColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
  },
  desktopTopBar: {
    height: 74,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgGlassStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    zIndex: 20,
  },
  desktopTopBrand: {
    paddingRight: 14,
  },
  desktopTopBrandText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  desktopTopTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flex: 1,
  },
  desktopTopTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desktopTopTabActive: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderStrong,
  },
  desktopTopTabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  desktopTopTabTextActive: {
    color: colors.text,
  },
  desktopMainContainer: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 18,
    position: 'relative',
  },
  desktopPanelWrap: {
    width: 420,
    padding: 4,
  },
  desktopPanel: {
    flex: 1,
    padding: 28,
    borderRadius: RADII.xl,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  desktopHero: {
    marginBottom: 24,
  },
  desktopEyebrow: {
    color: colors.pinkStrong,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  desktopTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: 12,
  },
  desktopText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
  desktopBadgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  desktopBadge: {
    flex: 1,
    padding: 12,
    borderRadius: RADII.md,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desktopBadgeLabel: {
    color: colors.textFaint,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  desktopBadgeValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  desktopWalletRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  desktopWalletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desktopWalletText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '47%',
    minHeight: 118,
    padding: 16,
    borderRadius: RADII.lg,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  metricNote: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 18,
  },
  desktopGuide: {
    padding: 18,
    borderRadius: RADII.lg,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  desktopSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  desktopTaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  desktopTaskEmoji: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 1,
  },
  desktopTaskCopy: {
    flex: 1,
  },
  desktopTaskTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  desktopTaskDetail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  desktopTaskEmpty: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  desktopBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  desktopBreakdownCard: {
    flexGrow: 1,
    minWidth: 92,
    padding: 14,
    borderRadius: RADII.md,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desktopBreakdownLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  desktopBreakdownValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  webPhoneWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webPhoneHeader: {
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  webPhoneHeaderText: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  webPhone: {
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: colors.bgSoft,
    borderWidth: 4,
    borderColor: colors.borderStrong,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.45,
    shadowRadius: 42,
    elevation: 30,
  },
  webPhoneInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
  },
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    height: 70,
    borderTopWidth: 0,
    backgroundColor: colors.bgGlassStrong,
    borderRadius: RADII.lg,
    paddingBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 8,
    elevation: 0,
  },
  tabBarItem: {
    borderRadius: RADII.md,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sceneCompact: {
    backgroundColor: 'transparent',
  },
  authBanner: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 18 : 54,
    left: 18,
    right: 18,
    padding: 12,
    borderRadius: RADII.lg,
    backgroundColor: colors.bgGlassStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 50,
  },
  authBannerCopy: {
    flex: 1,
  },
  authBannerTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  authBannerText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  authBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  authBannerButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
