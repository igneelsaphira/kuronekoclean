import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SHOP_ITEMS } from '../data/shopItems';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import {
  clearReminderNotifications,
  prepareNotifications,
  requestReminderPermission,
  scheduleDailyReminder,
} from '../utils/notifications';

const CatContext = createContext();
const STORAGE_KEY = '@kuroclean/state-v6';
const SETTINGS_DEFAULTS = {
  themeMode: 'dark',
  remindersEnabled: false,
  reminderSlot: 'evening',
  soundEnabled: true,
  cozyMode: true,
};
const STATE_VERSION = 6;

const TAREAS_DIARIAS = [
  { id: 'd1', nombre: 'Hacer desayuno', icono: '🍳', detalle: 'Un comienzo tibio para ti y para la casa.', duracion: '10 min', hecha: false },
  { id: 'd2', nombre: 'Tomar desayuno', icono: '☕', detalle: 'Porque tu energia tambien cuenta como rutina.', duracion: '15 min', hecha: false },
  { id: 'd3', nombre: 'Baño', icono: '🚿', detalle: 'Un reinicio pequeño que cambia todo el dia.', duracion: '10 min', hecha: false },
  { id: 'd4', nombre: 'Tender camas / ordenar', icono: '🛏️', detalle: 'Orden visible para bajar un poco el ruido mental.', duracion: '8 min', hecha: false },
  { id: 'd5', nombre: 'Hacer almuerzo', icono: '🍲', detalle: 'Preparar algo rico tambien sostiene la casa y el cuerpo.', duracion: '20 min', hecha: false },
  { id: 'd6', nombre: 'Almorzar', icono: '🥘', detalle: 'Comer con calma tambien forma parte del cuidado diario.', duracion: '20 min', hecha: false },
  { id: 'd7', nombre: 'Hacer once', icono: '🫖', detalle: 'Dejar lista la once baja el peso del resto de la tarde.', duracion: '12 min', hecha: false },
  { id: 'd8', nombre: 'Tomar once', icono: '🍵', detalle: 'Una pausa suave para no llegar vacia al final del dia.', duracion: '15 min', hecha: false },
  { id: 'd9', nombre: 'Sacar basura', icono: '🗑️', detalle: 'Liberar lo que ya cumplio su ciclo.', duracion: '5 min', hecha: false },
  { id: 'd10', nombre: 'Limpiar polvo', icono: '✨', detalle: 'Un gesto corto que hace que todo respire mejor.', duracion: '7 min', hecha: false },
  { id: 'd11', nombre: 'Lavar loza', icono: '🍽️', detalle: 'Cerrar una escena para que no pese despues.', duracion: '12 min', hecha: false },
  { id: 'd12', nombre: 'Barrer y trapear', icono: '🧹', detalle: 'Una base limpia cambia la energia del espacio.', duracion: '15 min', hecha: false },
];

const TAREAS_SEMANALES = [
  { id: 's1', nombre: 'Lavar ropa', icono: '🧺', detalle: 'Quitar carga acumulada de la semana.', duracion: '25 min', hecha: false },
  { id: 's2', nombre: 'Planchar', icono: '👔', detalle: 'Preparar la semana con menos friccion.', duracion: '20 min', hecha: false },
  { id: 's3', nombre: 'Limpiar cocina', icono: '🍳', detalle: 'Volver amable el lugar donde se sostiene el dia.', duracion: '20 min', hecha: false },
  { id: 's4', nombre: 'Limpiar refrigerador', icono: '🧊', detalle: 'Revisar, vaciar y dejar espacio para lo nuevo.', duracion: '20 min', hecha: false },
  { id: 's5', nombre: 'Cambiar sabanas', icono: '🌙', detalle: 'Dormir mejor tambien es parte del cuidado.', duracion: '12 min', hecha: false },
  { id: 's6', nombre: 'Ordenar armarios', icono: '🚪', detalle: 'Quitar exceso para encontrar lo necesario mas rapido.', duracion: '18 min', hecha: false },
];

const TAREAS_MENSUALES = [
  { id: 'm1', nombre: 'Limpiar ventanas', icono: '🪟', detalle: 'Mas luz, mas aire, mas sensacion de apertura.', duracion: '25 min', hecha: false },
  { id: 'm2', nombre: 'Aspirar', icono: '🛋️', detalle: 'Una pasada profunda para que el espacio vuelva a asentarse.', duracion: '20 min', hecha: false },
  { id: 'm3', nombre: 'Revisar despensa', icono: '🥫', detalle: 'Ordenar lo que nutre tambien ordena la cabeza.', duracion: '18 min', hecha: false },
  { id: 'm4', nombre: 'Limpiar lamparas', icono: '💡', detalle: 'Pequeños puntos de luz que cambian toda la atmosfera.', duracion: '12 min', hecha: false },
];

const TAREAS_ANUALES = [
  { id: 'a1', nombre: 'Limpieza profunda', icono: '🧽', detalle: 'Una limpieza grande para empezar otro ciclo mas liviano.', duracion: '45 min', hecha: false },
  { id: 'a2', nombre: 'Revisar pintura / paredes', icono: '🖌️', detalle: 'Mirar el hogar con ojos nuevos y reparar lo que pide cuidado.', duracion: '35 min', hecha: false },
  { id: 'a3', nombre: 'Ordenar y donar', icono: '📦', detalle: 'Dejar ir tambien puede ser una forma de ordenar.', duracion: '40 min', hecha: false },
];

function cloneTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function mergeTasks(defaults, savedTasks) {
  const savedMap = new Map((savedTasks || []).map((task) => [task.id, task]));
  return defaults.map((task) => ({
    ...task,
    hecha: Boolean(savedMap.get(task.id)?.hecha),
  }));
}

function buildProgress(tasks) {
  const total = tasks.length;
  const hechas = tasks.filter((task) => task.hecha).length;
  const pendientes = total - hechas;
  return {
    total,
    hechas,
    pendientes,
    porcentaje: total ? (hechas / total) * 100 : 0,
  };
}

function getMinutes(duration) {
  const match = String(duration).match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getKuroLevel(score) {
  if (score >= 180) return { label: 'Guardian lunar', note: 'Tu rutina ya sostiene el espacio con presencia real.' };
  if (score >= 110) return { label: 'Companera de ritual', note: 'Ya existe una constancia suave entre tu y Kuroneko.' };
  if (score >= 55) return { label: 'Orden en progreso', note: 'La casa ya se esta sintiendo mas consciente.' };
  return { label: 'Despertando la rutina', note: 'Cada gesto pequeno todavia esta construyendo el habito.' };
}

function buildAchievements({ completadasTotales, minigameStats, purchasedItems, kuroScore, resumenRutinas, settings }) {
  const purchasedCount = Object.keys(purchasedItems || {}).length;

  return [
    {
      id: 'first_steps',
      title: 'Primeras huellitas',
      note: 'Completa 3 tareas en total.',
      icon: 'paw',
      unlocked: completadasTotales >= 3,
    },
    {
      id: 'cozy_player',
      title: 'Juego suave',
      note: 'Juega 3 microjuegos.',
      icon: 'sparkles',
      unlocked: (minigameStats.totalPlayed || 0) >= 3,
    },
    {
      id: 'collector',
      title: 'Pequena coleccion',
      note: 'Compra tu primer objeto o tema.',
      icon: 'bag-handle',
      unlocked: purchasedCount >= 1,
    },
    {
      id: 'steady_home',
      title: 'Casa que respira',
      note: 'Cierra 5 tareas diarias.',
      icon: 'home',
      unlocked: resumenRutinas.diaria.hechas >= 5,
    },
    {
      id: 'guardian',
      title: 'Guardiana lunar',
      note: 'Llega a 140 puntos con Kuroneko.',
      icon: 'moon',
      unlocked: kuroScore >= 140,
    },
    {
      id: 'soft_signal',
      title: 'Senal suave',
      note: 'Activa un recordatorio diario.',
      icon: 'notifications',
      unlocked: Boolean(settings.remindersEnabled),
    },
  ];
}

function buildPersistedPayload({
  tareasDiaria,
  tareasSemanal,
  tareasMensual,
  tareasAnual,
  hambre,
  felicidad,
  monedas,
  corazones,
  purchasedItems,
  equippedTheme,
  equippedTaskArt,
  settings,
  minigameStats,
}) {
  return {
    version: STATE_VERSION,
    updatedAt: new Date().toISOString(),
    tareasDiaria: tareasDiaria.map(({ id, hecha }) => ({ id, hecha })),
    tareasSemanal: tareasSemanal.map(({ id, hecha }) => ({ id, hecha })),
    tareasMensual: tareasMensual.map(({ id, hecha }) => ({ id, hecha })),
    tareasAnual: tareasAnual.map(({ id, hecha }) => ({ id, hecha })),
    hambre,
    felicidad,
    monedas,
    corazones,
    purchasedItems,
    equippedTheme,
    equippedTaskArt,
    settings,
    minigameStats,
  };
}

const REGULAR_FEED_REACTIONS = [
  'Gracias por cuidarme asi de lindo. Quede con la pancita y el corazon calentitos.',
  'Mmm... esto estaba riquisimo. Contigo todo se siente mas tierno.',
  'Me encanta cuando me alimentas con tanto amorcito. Ya me siento mejor.',
  'Que ricooo. Ahora quiero quedarme contigo mientras haces una cosita suave.',
];

const SPECIAL_FEED_REACTIONS = [
  'Mami preciosa, esto estaba perfecto. Me hiciste sentir la gatita mas amada del mundo.',
  'Te juro que casi ronronee en forma de corazon. Gracias por este mimo tan dulce.',
  'Tu cuidado me derrite completita. Vamos juntas, tu y yo podemos con el dia.',
  'Aaaa, que ternura. Me dieron ganas de apretarte la mano y acompanar cada pasito tuyo.',
];

function isIncomingStateNewer(incoming, current) {
  const incomingTime = Date.parse(incoming?.updatedAt || 0);
  const currentTime = Date.parse(current?.updatedAt || 0);
  return incomingTime > currentTime;
}

export function CatProvider({ children }) {
  const { user, isAuthenticated, configured: authConfigured } = useAuth();
  const [tareasDiaria, setTareasDiaria] = useState(() => cloneTasks(TAREAS_DIARIAS));
  const [tareasSemanal, setTareasSemanal] = useState(() => cloneTasks(TAREAS_SEMANALES));
  const [tareasMensual, setTareasMensual] = useState(() => cloneTasks(TAREAS_MENSUALES));
  const [tareasAnual, setTareasAnual] = useState(() => cloneTasks(TAREAS_ANUALES));
  const [hambre, setHambre] = useState(72);
  const [felicidad, setFelicidad] = useState(76);
  const [monedas, setMonedas] = useState(0);
  const [corazones, setCorazones] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState({});
  const [equippedTheme, setEquippedTheme] = useState('default');
  const [equippedTaskArt, setEquippedTaskArt] = useState({ d4: 'd4_default' });
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);
  const [notificationStatus, setNotificationStatus] = useState('idle');
  const [minigameStats, setMinigameStats] = useState({ totalPlayed: 0, lastPlayedGame: null, completedByGame: {} });
  const [hidrato, setHidrato] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  const applyPersistedState = (parsed) => {
    if (!parsed) return;

    setTareasDiaria(mergeTasks(TAREAS_DIARIAS, parsed.tareasDiaria));
    setTareasSemanal(mergeTasks(TAREAS_SEMANALES, parsed.tareasSemanal));
    setTareasMensual(mergeTasks(TAREAS_MENSUALES, parsed.tareasMensual));
    setTareasAnual(mergeTasks(TAREAS_ANUALES, parsed.tareasAnual));
    setHambre(clamp(parsed.hambre ?? 72, 0, 100));
    setFelicidad(clamp(parsed.felicidad ?? 76, 0, 100));
    setMonedas(clamp(parsed.monedas ?? 0, 0, 9999));
    setCorazones(clamp(parsed.corazones ?? 0, 0, 9999));
    setPurchasedItems(parsed.purchasedItems || {});
    setEquippedTheme(parsed.equippedTheme || 'default');
    setEquippedTaskArt({ d4: 'd4_default', ...(parsed.equippedTaskArt || {}) });
    setSettings({ ...SETTINGS_DEFAULTS, ...(parsed.settings || {}) });
    setMinigameStats(parsed.minigameStats || { totalPlayed: 0, lastPlayedGame: null, completedByGame: {} });
  };

  useEffect(() => {
    prepareNotifications().catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw || cancelled) return;

        const parsed = JSON.parse(raw);
        applyPersistedState(parsed);
      } catch (error) {
        console.warn('No pude recuperar el estado de Kuroclean', error);
      } finally {
        if (!cancelled) setHidrato(true);
      }
    }

    loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  const resumenRutinas = useMemo(() => ({
    diaria: buildProgress(tareasDiaria),
    semanal: buildProgress(tareasSemanal),
    mensual: buildProgress(tareasMensual),
    anual: buildProgress(tareasAnual),
  }), [tareasDiaria, tareasSemanal, tareasMensual, tareasAnual]);

  const tareasHechas = resumenRutinas.diaria.hechas;
  const totalTareas = resumenRutinas.diaria.total;
  const progresoAseo = resumenRutinas.diaria.porcentaje;

  const progresoGeneral = useMemo(() => {
    const todas = [...tareasDiaria, ...tareasSemanal, ...tareasMensual, ...tareasAnual];
    const completadas = todas.filter((task) => task.hecha).length;
    return todas.length ? (completadas / todas.length) * 100 : 0;
  }, [tareasDiaria, tareasSemanal, tareasMensual, tareasAnual]);

  const sugerenciasHoy = useMemo(() => {
    const primeras = [
      ...tareasDiaria.filter((task) => !task.hecha),
      ...tareasSemanal.filter((task) => !task.hecha),
      ...tareasMensual.filter((task) => !task.hecha),
    ];
    return primeras.slice(0, 3);
  }, [tareasDiaria, tareasSemanal, tareasMensual]);

  const tareasRapidas = useMemo(() => {
    const candidatas = [...tareasDiaria, ...tareasSemanal]
      .filter((task) => !task.hecha && getMinutes(task.duracion) <= 12)
      .sort((a, b) => getMinutes(a.duracion) - getMinutes(b.duracion));

    return candidatas.slice(0, 4);
  }, [tareasDiaria, tareasSemanal]);

  const completadasTotales = useMemo(() => {
    return resumenRutinas.diaria.hechas + resumenRutinas.semanal.hechas + resumenRutinas.mensual.hechas + resumenRutinas.anual.hechas;
  }, [resumenRutinas]);

  const kuroScore = useMemo(() => {
    return (
      resumenRutinas.diaria.hechas * 6 +
      resumenRutinas.semanal.hechas * 11 +
      resumenRutinas.mensual.hechas * 16 +
      resumenRutinas.anual.hechas * 24
    );
  }, [resumenRutinas]);

  const kuroLevel = useMemo(() => getKuroLevel(kuroScore), [kuroScore]);
  const achievements = useMemo(() => buildAchievements({
    completadasTotales,
    minigameStats,
    purchasedItems,
    kuroScore,
    resumenRutinas,
    settings,
  }), [completadasTotales, minigameStats, purchasedItems, kuroScore, resumenRutinas, settings]);
  const unlockedAchievements = useMemo(() => achievements.filter((achievement) => achievement.unlocked), [achievements]);
  const persistedPayload = useMemo(() => buildPersistedPayload({
    tareasDiaria,
    tareasSemanal,
    tareasMensual,
    tareasAnual,
    hambre,
    felicidad,
    monedas,
    corazones,
    purchasedItems,
    equippedTheme,
    equippedTaskArt,
    settings,
    minigameStats,
  }), [corazones, equippedTaskArt, equippedTheme, felicidad, hambre, minigameStats, monedas, purchasedItems, settings, tareasAnual, tareasDiaria, tareasMensual, tareasSemanal]);

  useEffect(() => {
    if (!hidrato) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistedPayload)).catch((error) => {
      console.warn('No pude guardar el estado de Kuroclean', error);
    });
  }, [hidrato, persistedPayload]);

  useEffect(() => {
    let cancelled = false;

    async function syncRemoteState() {
      if (!hidrato) return;

      if (!isAuthenticated || !user?.id || !authConfigured || !supabase) {
        setSyncStatus('idle');
        return;
      }

      try {
        setSyncStatus('syncing');

        const { data, error } = await supabase
          .from('user_progress')
          .select('state, updated_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (cancelled) return;

        const remoteState = data?.state || null;

        if (!remoteState) {
          await supabase.from('user_progress').upsert({
            user_id: user.id,
            state: persistedPayload,
            updated_at: persistedPayload.updatedAt,
          }, { onConflict: 'user_id' });

          if (!cancelled) setSyncStatus('synced');
          return;
        }

        if (isIncomingStateNewer(remoteState, persistedPayload)) {
          applyPersistedState(remoteState);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
          if (!cancelled) setSyncStatus('synced');
          return;
        }

        await supabase.from('user_progress').upsert({
          user_id: user.id,
          state: persistedPayload,
          updated_at: persistedPayload.updatedAt,
        }, { onConflict: 'user_id' });

        if (!cancelled) setSyncStatus('synced');
      } catch (error) {
        console.warn('No pude sincronizar el progreso remoto', error);
        if (!cancelled) setSyncStatus('error');
      }
    }

    syncRemoteState();

    return () => {
      cancelled = true;
    };
  }, [authConfigured, hidrato, isAuthenticated, persistedPayload, user?.id]);

  useEffect(() => {
    const bonus = Math.min(16, Math.floor(progresoAseo / 8));
    setFelicidad((prev) => clamp(prev + bonus * 0.04, 0, 100));
  }, [tareasHechas, progresoAseo]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHambre((prev) => clamp(prev - 0.45, 0, 100));
      setFelicidad((prev) => clamp(prev - 0.25, 0, 100));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const marcarTarea = (tipo, id) => {
    const setters = {
      diaria: setTareasDiaria,
      semanal: setTareasSemanal,
      mensual: setTareasMensual,
      anual: setTareasAnual,
    };

    const setter = setters[tipo];
    if (!setter) return;

    setter((prev) => prev.map((task) => (
      task.id === id ? { ...task, hecha: !task.hecha } : task
    )));
  };

  const alimentar = (food = null) => {
    const hungerGain = clamp(food?.hungerGain ?? 18, 6, 30);
    const happinessGain = clamp(food?.happinessGain ?? 4, 1, 12);
    const special = Math.random() < 0.32;
    const reaction = special ? pickRandom(SPECIAL_FEED_REACTIONS) : pickRandom(REGULAR_FEED_REACTIONS);
    const foodName = food?.name || 'tu comidita';

    setHambre((prev) => clamp(prev + hungerGain, 0, 100));
    setFelicidad((prev) => clamp(prev + happinessGain, 0, 100));

    return {
      hungerGain,
      happinessGain,
      special,
      reaction,
      title: special ? `Kuroneko amo ${foodName}` : `Kuroneko comio ${foodName}`,
    };
  };
  const jugar = () => setFelicidad((prev) => clamp(prev + 12, 0, 100));

  const registerMiniGameReward = ({ gameKey = null, coins = 0, hearts = 0, happiness = 0 }) => {
    setMonedas((prev) => clamp(prev + coins, 0, 9999));
    setCorazones((prev) => clamp(prev + hearts, 0, 9999));
    setFelicidad((prev) => clamp(prev + happiness, 0, 100));
    setMinigameStats((prev) => ({
      totalPlayed: (prev.totalPlayed || 0) + 1,
      lastPlayedGame: gameKey,
      completedByGame: {
        ...(prev.completedByGame || {}),
        [gameKey]: ((prev.completedByGame || {})[gameKey] || 0) + 1,
      },
    }));
  };

  const buyShopItem = (itemId) => {
    const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
    if (!item) return { ok: false, reason: 'missing' };
    if (purchasedItems[itemId]) return { ok: false, reason: 'owned' };
    if (monedas < item.cost) return { ok: false, reason: 'coins' };

    setMonedas((prev) => prev - item.cost);
    setPurchasedItems((prev) => ({ ...prev, [itemId]: true }));

    if (item.type === 'theme' && item.themeKey) {
      setEquippedTheme(item.themeKey);
    }

    if (item.type === 'taskArt' && item.taskId && item.taskArtOptionId) {
      setEquippedTaskArt((prev) => ({ ...prev, [item.taskId]: item.taskArtOptionId }));
    }

    return { ok: true, item };
  };

  const equipTheme = (themeKey) => {
    if (themeKey === 'default') {
      setEquippedTheme('default');
      return { ok: true };
    }

    const themeItem = SHOP_ITEMS.find((item) => item.type === 'theme' && item.themeKey === themeKey);
    if (!themeItem || !purchasedItems[themeItem.id]) {
      return { ok: false, reason: 'locked' };
    }

    setEquippedTheme(themeKey);
    return { ok: true };
  };

  const equipTaskArt = (taskId, optionId) => {
    const item = SHOP_ITEMS.find((entry) => entry.type === 'taskArt' && entry.taskId === taskId && entry.taskArtOptionId === optionId);

    if (optionId.endsWith('_default')) {
      setEquippedTaskArt((prev) => ({ ...prev, [taskId]: optionId }));
      return { ok: true };
    }

    if (!item || !purchasedItems[item.id]) {
      return { ok: false, reason: 'locked' };
    }

    setEquippedTaskArt((prev) => ({ ...prev, [taskId]: optionId }));
    return { ok: true };
  };

  const updateSettingValue = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const setReminderEnabled = async (enabled) => {
    if (!enabled) {
      await clearReminderNotifications();
      setSettings((prev) => ({ ...prev, remindersEnabled: false }));
      setNotificationStatus('off');
      return { ok: true };
    }

    const granted = await requestReminderPermission();
    if (!granted) {
      setNotificationStatus('denied');
      return { ok: false };
    }

    await scheduleDailyReminder(settings.reminderSlot);
    setSettings((prev) => ({ ...prev, remindersEnabled: true }));
    setNotificationStatus('scheduled');
    return { ok: true };
  };

  const setReminderSlot = async (slot) => {
    setSettings((prev) => ({ ...prev, reminderSlot: slot }));
    if (settings.remindersEnabled) {
      const granted = await requestReminderPermission();
      if (!granted) {
        setNotificationStatus('denied');
        return { ok: false };
      }
      await scheduleDailyReminder(slot);
      setNotificationStatus('scheduled');
    }
    return { ok: true };
  };

  const reiniciarDia = () => setTareasDiaria(cloneTasks(TAREAS_DIARIAS));
  const reiniciarSemana = () => setTareasSemanal(cloneTasks(TAREAS_SEMANALES));
  const reiniciarMes = () => setTareasMensual(cloneTasks(TAREAS_MENSUALES));
  const reiniciarAño = () => setTareasAnual(cloneTasks(TAREAS_ANUALES));

  const value = {
    tareasDiaria,
    tareasSemanal,
    tareasMensual,
    tareasAnual,
    marcarTarea,
    reiniciarDia,
    reiniciarSemana,
    reiniciarMes,
    reiniciarAño,
    hambre,
    felicidad,
    monedas,
    corazones,
    alimentar,
    jugar,
    registerMiniGameReward,
    progresoAseo,
    progresoGeneral,
    resumenRutinas,
    sugerenciasHoy,
    tareasRapidas,
    tareasHechas,
    totalTareas,
    completadasTotales,
    kuroScore,
    kuroLevel,
    achievements,
    unlockedAchievements,
    minigameStats,
    purchasedItems,
    equippedTheme,
    equippedTaskArt,
    buyShopItem,
    equipTheme,
    equipTaskArt,
    settings,
    notificationStatus,
    updateSettingValue,
    setReminderEnabled,
    setReminderSlot,
    hidrato,
    syncStatus,
    cloudSaveEnabled: Boolean(isAuthenticated && user?.id),
  };

  return <CatContext.Provider value={value}>{children}</CatContext.Provider>;
}

export function useCat() {
  const ctx = useContext(CatContext);
  if (!ctx) throw new Error('useCat must be used within CatProvider');
  return ctx;
}
