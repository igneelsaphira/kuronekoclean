import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { useCat } from '../context/CatContext';
import StudyCornerRoom from '../components/StudyCornerRoom';
import { APP_ILLUSTRATIONS } from '../data/illustrations';
import { TASK_ILLUSTRATIONS, getTaskIllustration } from '../data/taskIllustrations';
import { ACTIVE_MINIGAME_KEYS, MiniGameModal } from '../minigames/MiniGameModal';
import { RADII } from '../theme/tokens';
import { useAppTheme } from '../theme/useAppTheme';

const KURO_IMAGE = require('../../assets/kuro-cat-cute.png');
const KURO_RUN_SHEET = require('../../assets/kuro/kuro-run.png');

const FEED_OPTIONS = [
  { id: 'strawberry-milk', emoji: '🍓', accent: '#f6c3da', name: 'Lechita rosa', note: 'Suave y dulce para empezar bonito.', hungerGain: 14, happinessGain: 4 },
  { id: 'onigiri', emoji: '🍙', accent: '#d9d7f8', name: 'Onigiri tibio', note: 'Comidita calmadita para recuperar energia.', hungerGain: 18, happinessGain: 5 },
  { id: 'pancake', emoji: '🥞', accent: '#f4d8b8', name: 'Hotcake de miel', note: 'Pequeno gustito para subir la ternura.', hungerGain: 16, happinessGain: 6 },
];

const GAME_PICKER_META = {
  lint: { title: 'Atrapa Pelusas', description: 'Kuro ronca: atrapa las 12 pelusas por la sala.', icon: '★', category: 'kuro', featured: true },
  roller: { title: 'Rodillo quitapelos', description: 'Pasa el rodillo hasta dejar todo livianito.', icon: '◒', category: 'cleaning' },
  laundry: { title: 'Separar ropita', description: 'Manda cada prenda al canasto correcto.', icon: '▣', category: 'organizing' },
  misplaced: { title: 'Fuera de lugar', description: 'Encuentra y acomoda lo que esta perdido.', icon: '◇', category: 'organizing' },
  bath: { title: 'Bano burbujita', description: 'Revienta burbujas y enjuaga con calma.', icon: '○', category: 'care' },
  bed: { title: 'Cama perfecta', description: 'Deja la cama lista para descansar.', icon: '☾', category: 'care' },
  rooftop: { title: 'Kuro: Aventura de Tejados', description: 'Corre por Santiago de noche, salta y junta estrellitas.', icon: '★', category: 'kuro', featured: true },
};

const GAME_PICKER_CATEGORIES = [
  { key: 'all', label: 'Todos' },
  { key: 'cleaning', label: 'Limpieza' },
  { key: 'organizing', label: 'Orden' },
  { key: 'care', label: 'Cuidado' },
  { key: 'kuro', label: 'Kuro' },
];

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos dias';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function getMood({ hambre, felicidad, progresoAseo }, colors) {
  if (hambre <= 35) return { key: 'hungry', label: 'Kuroneko tiene hambre', accent: colors.gold };
  if (felicidad <= 42) return { key: 'tired', label: 'Kuroneko necesita ternura', accent: colors.pinkStrong };
  if (progresoAseo >= 70) return { key: 'radiant', label: 'La casa ya esta respirando', accent: colors.mintStrong };
  return { key: 'steady', label: 'Avance suave, sin prisa', accent: colors.blue };
}

const HOME_PHRASES = {
  radiant: ['Tu espacio se esta sintiendo mas liviano.', 'Vamos precioso, hoy si se puede avanzar suave.', 'Me gusta cuando la casa respira contigo.'],
  steady: ['Una tarea pequena tambien cambia el dia.', 'No hace falta hacerlo todo de una vez.', 'Podemos ir poquito a poquito y aun asi cuenta.'],
  hungry: ['Mami, un mimo y una tarea cortita? :3', 'Si me alimentas, te acompano en la siguiente tarea.', 'Hoy podria bastar con empezar por lo minimo.'],
  tired: ['Si estas cansada, hagamos una sola cosa bien pequena.', 'A veces ordenar empieza por un rincon nada mas.', 'No te exijo, solo te acompano.'],
};

function RewardBubble({ styles, rewardToast, opacity }) {
  if (!rewardToast) return null;
  const rewardChips = [
    rewardToast.rewards?.hunger ? `+${rewardToast.rewards.hunger} hambre` : null,
    rewardToast.rewards?.happiness ? `+${rewardToast.rewards.happiness} felicidad` : null,
    rewardToast.rewards?.coins ? `+${rewardToast.rewards.coins} monedas` : null,
    rewardToast.rewards?.hearts ? `+${rewardToast.rewards.hearts} corazones` : null,
  ].filter(Boolean);

  return (
    <Animated.View style={[styles.rewardToast, { opacity }]}> 
      <Text style={styles.rewardToastTitle}>{rewardToast.title}</Text>
      <Text style={styles.rewardToastText}>{rewardToast.reaction}</Text>
      {rewardChips.length ? <View style={styles.rewardToastRow}>{rewardChips.map((chip) => <Text key={chip} style={styles.rewardToastChip}>{chip}</Text>)}</View> : null}
    </Animated.View>
  );
}

function IllustrationCard({ styles, image, title, text, onPress, onPreview }) {
  return (
    <TouchableOpacity style={styles.illustrationCard} onPress={onPress} activeOpacity={0.86}>
      <TouchableOpacity
        style={styles.illustrationFrame}
        activeOpacity={0.9}
        delayLongPress={2000}
        onLongPress={() => onPreview?.(image, title)}
      >
        <Image source={image} style={styles.illustrationImage} resizeMode="contain" />
      </TouchableOpacity>
      <View style={styles.illustrationCopy}>
        <Text style={styles.illustrationTitle}>{title}</Text>
        <Text style={styles.illustrationText}>
          {title === 'Alimentar' ? 'Abre una ventanita suave con 3 comiditas para arrastrar hasta Kuro.' : text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function FeedModal({ visible, styles, colors, onClose, onFeed }) {
  const [selectedFoodId, setSelectedFoodId] = useState(FEED_OPTIONS[0].id);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const webDragStart = useRef(null);
  const dragBubbleRef = useRef(null);
  const selectedFood = FEED_OPTIONS.find((item) => item.id === selectedFoodId) || FEED_OPTIONS[0];

  const resetDrag = () => {
    Animated.spring(drag, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      bounciness: 10,
      speed: 18,
    }).start(() => setDragging(false));
  };

  useEffect(() => {
    if (!visible) return;
    setSelectedFoodId(FEED_OPTIONS[0].id);
    setDragging(false);
    webDragStart.current = null;
    drag.setValue({ x: 0, y: 0 });
  }, [drag, visible]);

  const deliverSelectedFood = () => {
    drag.setValue({ x: 0, y: 0 });
    setDragging(false);
    onFeed(selectedFood);
  };

  const handleDrop = (gesture) => {
    const isTapFeed = Math.abs(gesture.dx) <= 14 && Math.abs(gesture.dy) <= 14;
    const draggedHighEnough = gesture.dy <= -120;
    const closeToCenter = Math.abs(gesture.dx) <= 140;

    if (isTapFeed) {
      Animated.sequence([
        Animated.timing(drag, { toValue: { x: 0, y: -10 }, duration: 90, useNativeDriver: false }),
        Animated.timing(drag, { toValue: { x: 0, y: 0 }, duration: 110, useNativeDriver: false }),
      ]).start(deliverSelectedFood);
      return;
    }

    if (!draggedHighEnough || !closeToCenter) {
      resetDrag();
      return;
    }

    Animated.sequence([
      Animated.timing(drag, { toValue: { x: 0, y: -16 }, duration: 120, useNativeDriver: false }),
      Animated.timing(drag, { toValue: { x: 0, y: 0 }, duration: 140, useNativeDriver: false }),
    ]).start(deliverSelectedFood);
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
    const handlePointerMove = (event) => {
      if (!webDragStart.current) return;
      if (webDragStart.current.kind !== 'pointer') return;
      if (webDragStart.current.pointerId != null && event.pointerId !== webDragStart.current.pointerId) return;
      const dx = event.clientX - webDragStart.current.x;
      const dy = event.clientY - webDragStart.current.y;
      drag.setValue({ x: dx, y: dy });
    };

    const handlePointerUp = (event) => {
      if (!webDragStart.current) return;
      if (webDragStart.current.kind !== 'pointer') return;
      if (webDragStart.current.pointerId != null && event.pointerId !== webDragStart.current.pointerId) return;
      const gesture = {
        dx: event.clientX - webDragStart.current.x,
        dy: event.clientY - webDragStart.current.y,
      };
      webDragStart.current = null;
      handleDrop(gesture);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [drag, visible, selectedFood]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => visible,
    onStartShouldSetPanResponderCapture: () => visible,
    onMoveShouldSetPanResponder: (_, gesture) => visible && (Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2),
    onMoveShouldSetPanResponderCapture: (_, gesture) => visible && (Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2),
    onPanResponderGrant: () => setDragging(true),
    onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => handleDrop(gesture),
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: resetDrag,
  }), [drag, visible, selectedFood]);

  const webDragHandlers = Platform.OS === 'web' ? {
    onPointerDown: (event) => {
      const nativeEvent = event.nativeEvent || event;
      if (nativeEvent.pointerType === 'touch') return;
      webDragStart.current = {
        x: nativeEvent.clientX,
        y: nativeEvent.clientY,
        pointerId: nativeEvent.pointerId,
        kind: 'pointer',
      };
      setDragging(true);
      drag.setValue({ x: 0, y: 0 });
      dragBubbleRef.current?.setPointerCapture?.(nativeEvent.pointerId);
    },
    onTouchStart: (event) => {
      const nativeEvent = event.nativeEvent || event;
      const touch = nativeEvent.touches?.[0];
      if (!touch) return;
      webDragStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        kind: 'touch',
      };
      setDragging(true);
      drag.setValue({ x: 0, y: 0 });
    },
    onTouchMove: (event) => {
      const nativeEvent = event.nativeEvent || event;
      if (!webDragStart.current || webDragStart.current.kind !== 'touch') return;
      const touch = nativeEvent.touches?.[0];
      if (!touch) return;
      const dx = touch.clientX - webDragStart.current.x;
      const dy = touch.clientY - webDragStart.current.y;
      drag.setValue({ x: dx, y: dy });
      event.preventDefault?.();
    },
    onTouchEnd: (event) => {
      const nativeEvent = event.nativeEvent || event;
      if (!webDragStart.current || webDragStart.current.kind !== 'touch') return;
      const touch = nativeEvent.changedTouches?.[0];
      const endX = touch?.clientX ?? webDragStart.current.x;
      const endY = touch?.clientY ?? webDragStart.current.y;
      const gesture = {
        dx: endX - webDragStart.current.x,
        dy: endY - webDragStart.current.y,
      };
      webDragStart.current = null;
      handleDrop(gesture);
      event.preventDefault?.();
    },
  } : {};

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.feedModalOverlay} onPress={onClose}>
        <Pressable style={styles.feedModalCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.feedModalHeader}>
            <View style={styles.feedModalHeaderCopy}>
              <Text style={styles.feedModalEyebrow}>Momento tierno</Text>
              <Text style={styles.feedModalTitle}>Dale una comidita a Kuroneko</Text>
              <Text style={styles.feedModalText}>Elige una opcion y arrastrala hasta el gatito. Le subira el hambre y un poquito la felicidad.</Text>
            </View>
            <TouchableOpacity style={styles.feedCloseButton} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.feedOptionsRow}>
            {FEED_OPTIONS.map((food) => {
              const active = food.id === selectedFoodId;
              return (
                <TouchableOpacity
                  key={food.id}
                  style={[
                    styles.feedOptionCard,
                    active && styles.feedOptionCardActive,
                    active && { borderColor: food.accent, backgroundColor: `${food.accent}22` },
                  ]}
                  onPress={() => {
                    setSelectedFoodId(food.id);
                    drag.setValue({ x: 0, y: 0 });
                  }}
                  activeOpacity={0.86}
                >
                  <View style={[styles.feedOptionEmojiWrap, { backgroundColor: `${food.accent}33` }]}>
                    <Text style={styles.feedOptionEmoji}>{food.emoji}</Text>
                  </View>
                  <Text style={styles.feedOptionTitle}>{food.name}</Text>
                  <Text style={styles.feedOptionNote}>{food.note}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.feedDragStage}>
            <View style={styles.feedInstructionPill}>
              <Ionicons name="hand-left-outline" size={14} color={colors.pinkStrong} />
              <Text style={styles.feedInstructionText}>Arrastra {selectedFood.name} hasta Kuroneko</Text>
            </View>

            <View style={styles.feedStageLine} />

            <View style={styles.feedCatTarget}>
              <View style={styles.feedCatAura} />
              <Image source={KURO_IMAGE} style={styles.feedCatModalImage} resizeMode="contain" />
              <Text style={styles.feedCatTargetTitle}>Kuroneko espera su comidita</Text>
              <Text style={styles.feedCatTargetText}>Sueltala sobre el gatito para darle el mimo.</Text>
            </View>

            <TouchableOpacity style={styles.feedFallbackButton} onPress={deliverSelectedFood} activeOpacity={0.88}>
              <Ionicons name="restaurant-outline" size={15} color={colors.bg} />
              <Text style={styles.feedFallbackButtonText}>Dar comidita igual</Text>
            </TouchableOpacity>

            <Animated.View
              ref={dragBubbleRef}
              style={[
                styles.feedDragBubble,
                Platform.OS === 'web' && styles.feedDragBubbleWeb,
                { transform: drag.getTranslateTransform() },
                dragging && styles.feedDragBubbleActive,
                { borderColor: selectedFood.accent, backgroundColor: `${selectedFood.accent}2a` },
              ]}
              {...webDragHandlers}
              {...panResponder.panHandlers}
            >
              <Text style={styles.feedDragEmoji}>{selectedFood.emoji}</Text>
              <Text style={styles.feedDragTitle}>{selectedFood.name}</Text>
              <Text style={styles.feedDragHint}>Arrastrame hacia Kuro</Text>
            </Animated.View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function KuroPickerSprite({ styles }) {
  return (
    <View style={styles.gamePickerKuroFrame}>
      <Image
        source={KURO_RUN_SHEET}
        resizeMode="stretch"
        style={styles.gamePickerKuroSheet}
      />
    </View>
  );
}

function MiniGamePickerModal({ visible, styles, colors, games, onClose, onSelect, onSurprise }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const visibleGames = activeCategory === 'all'
    ? games
    : games.filter((game) => game.category === activeCategory);

  useEffect(() => {
    if (visible) setActiveCategory('all');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.gamePickerOverlay} onPress={onClose}>
        <Pressable style={styles.gamePickerCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.gamePickerHeader}>
            <View style={styles.gamePickerHeaderCopy}>
              <Text style={styles.gamePickerEyebrow}>Minijuegos cozy</Text>
              <Text style={styles.gamePickerTitle}>¿A qué jugamos hoy?</Text>
              <Text style={styles.gamePickerText}>Elige uno directo o deja que Kuro saque una sorpresa justa.</Text>
            </View>
            <TouchableOpacity style={styles.feedCloseButton} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.gamePickerScroll}
            contentContainerStyle={styles.gamePickerScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.surpriseGameCard} onPress={onSurprise} activeOpacity={0.88}>
              <View style={styles.surpriseIconWrap}>
                <Ionicons name="sparkles" size={22} color={colors.gold} />
              </View>
              <View style={styles.gamePickerCardCopy}>
                <Text style={styles.surpriseTitle}>Aleatorio</Text>
                <Text style={styles.gamePickerDescription}>Usa la bolsa justa: todos salen una vez antes de repetir.</Text>
              </View>
              <Ionicons name="shuffle" size={18} color={colors.gold} />
            </TouchableOpacity>

            <View style={styles.gameCategoryRow}>
              {GAME_PICKER_CATEGORIES.map((category) => {
                const active = category.key === activeCategory;
                return (
                  <TouchableOpacity
                    key={category.key}
                    style={[styles.gameCategoryPill, active && styles.gameCategoryPillActive]}
                    onPress={() => setActiveCategory(category.key)}
                    activeOpacity={0.82}
                  >
                    <Text style={[styles.gameCategoryText, active && styles.gameCategoryTextActive]}>{category.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.gamePickerGrid}>
              {visibleGames.map((game) => {
                const isFeatured = Boolean(game.featured);
                return (
                  <TouchableOpacity
                    key={game.key}
                    style={[styles.gameChoiceCard, isFeatured && styles.gameChoiceCardFeatured]}
                    onPress={() => onSelect(game.key)}
                    activeOpacity={0.88}
                  >
                    <View style={[styles.gameChoiceVisual, isFeatured && styles.gameChoiceVisualFeatured]}>
                      {isFeatured ? (
                        <KuroPickerSprite styles={styles} />
                      ) : (
                        <Text style={styles.gameChoiceIcon}>{game.icon}</Text>
                      )}
                    </View>
                    <Text style={styles.gameChoiceTitle}>{game.title}</Text>
                    <Text style={styles.gamePickerDescription}>{game.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function shuffleMiniGames(keys, previousKey = null) {
  const shuffled = [...keys];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  if (shuffled.length > 1 && shuffled[0] === previousKey) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

export default function GatitoScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideLayout = Platform.OS === 'web' && width >= 1180;
  const { colors, themeMode, toggleThemeMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    hambre,
    felicidad,
    monedas,
    corazones,
    alimentar,
    registerMiniGameReward,
    progresoAseo,
    progresoGeneral,
    tareasHechas,
    totalTareas,
    sugerenciasHoy,
    tareasRapidas,
    kuroScore,
    kuroLevel,
    equippedTheme,
    purchasedItems,
    unlockedAchievements,
    equippedTaskArt,
  } = useCat();

  const mood = useMemo(() => getMood({ hambre, felicidad, progresoAseo }, colors), [colors, felicidad, hambre, progresoAseo]);
  const frases = HOME_PHRASES[mood.key];
  const [fraseVisible, setFraseVisible] = useState(frases[0]);
  const [activeGameKey, setActiveGameKey] = useState(null);
  const [lastGameKey, setLastGameKey] = useState(null);
  const [rewardToast, setRewardToast] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [gamePickerVisible, setGamePickerVisible] = useState(false);
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const rewardOpacity = useRef(new Animated.Value(0)).current;
  const gameBagRef = useRef([]);
  const pickerGames = useMemo(() => ACTIVE_MINIGAME_KEYS.map((key) => ({
    key,
    ...GAME_PICKER_META[key],
  })).filter((game) => game.title), []);

  useEffect(() => {
    let index = 0;
    const showPhrase = () => {
      setFraseVisible(frases[index % frases.length]);
      index += 1;
      bubbleOpacity.setValue(0);
      Animated.timing(bubbleOpacity, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    };
    showPhrase();
    const interval = setInterval(showPhrase, 5200);
    return () => clearInterval(interval);
  }, [bubbleOpacity, frases]);

  useEffect(() => {
    if (!rewardToast) return undefined;
    rewardOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(rewardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(rewardOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setRewardToast(null);
    });
    return undefined;
  }, [rewardOpacity, rewardToast]);

  const startSurpriseMiniGame = () => {
    if (!gameBagRef.current.length) {
      gameBagRef.current = shuffleMiniGames(ACTIVE_MINIGAME_KEYS, lastGameKey);
    }

    const selected = gameBagRef.current.shift();
    setLastGameKey(selected);
    setGamePickerVisible(false);
    setActiveGameKey(selected);
  };

  const startSelectedMiniGame = (gameKey) => {
    setGamePickerVisible(false);
    setActiveGameKey(gameKey);
  };

  const handleMiniGameReward = (summary) => {
    registerMiniGameReward({ gameKey: summary.gameKey, ...summary.rewards });
    setRewardToast(summary);
  };

  const handleFeed = (food) => {
    const result = alimentar(food);
    setFeedModalVisible(false);
    setFraseVisible(result.reaction);
    bubbleOpacity.setValue(0);
    Animated.timing(bubbleOpacity, { toValue: 1, duration: 380, useNativeDriver: true }).start();
    setRewardToast({
      title: result.title,
      reaction: result.reaction,
      rewards: {
        hunger: result.hungerGain,
        happiness: result.happinessGain,
      },
    });
  };

  const actionCards = [
    {
      key: 'feed',
      image: APP_ILLUSTRATIONS.feedAction,
      title: 'Alimentar',
      text: 'Un mimo pequeño para subir su energia.',
      onPress: () => setFeedModalVisible(true),
    },
    {
      key: 'play',
      image: APP_ILLUSTRATIONS.playAction,
      title: 'Jugar',
      text: 'Elige un minijuego o deja que Kuro te sorprenda.',
      onPress: () => setGamePickerVisible(true),
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          isWideLayout && styles.contentWide,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Kuroclean</Text>
            <Text style={styles.title}>{getGreeting()}, ordenemos con suavidad.</Text>
            <Text style={styles.subtitle}>Una app de gatito para limpiar, ordenar y respirar un poco sin sentirte exigida.</Text>
            <View style={styles.walletRow}>
              <TouchableOpacity style={styles.walletChip} onPress={() => navigation.navigate('Tienda')} activeOpacity={0.82}><Ionicons name="logo-bitcoin" size={14} color={colors.gold} /><Text style={styles.walletChipText}>{monedas}</Text></TouchableOpacity>
              <View style={styles.walletChip}><Ionicons name="heart" size={14} color={colors.pinkStrong} /><Text style={styles.walletChipText}>{corazones}</Text></View>
              <TouchableOpacity style={styles.walletChip} onPress={toggleThemeMode} activeOpacity={0.82}><Ionicons name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={14} color={themeMode === 'dark' ? colors.gold : colors.lilacStrong} /><Text style={styles.walletChipText}>{themeMode === 'dark' ? 'bright' : 'dark'}</Text></TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.ritualButton} onPress={() => navigation.navigate('Ritual')} activeOpacity={0.8}>
            <Ionicons name="sparkles-outline" size={18} color={colors.text} />
            <Text style={styles.ritualButtonText}>Ritual</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.topGrid, isWideLayout && styles.topGridWide]}>
          <View style={[styles.sceneCard, isWideLayout && styles.sceneCardWide]}>
            <StudyCornerRoom themeKey={equippedTheme} purchasedItems={purchasedItems} />

            <View style={styles.sceneTopRow}>
              <View style={[styles.sceneChip, { borderColor: `${mood.accent}66` }]}>
                <View style={[styles.sceneChipDot, { backgroundColor: mood.accent }]} />
                <Text style={styles.sceneChipText}>{mood.label}</Text>
              </View>
              <View style={styles.sceneChipAlt}><Ionicons name="checkmark-done-outline" size={14} color={colors.mintStrong} /><Text style={styles.sceneChipAltText}>{tareasHechas}/{totalTareas} hoy</Text></View>
            </View>

            <View style={styles.catStage}>
              <Animated.View style={[styles.bubble, { opacity: bubbleOpacity }]}>
                <Text style={styles.bubbleText}>{fraseVisible}</Text>
              </Animated.View>
              <Image source={KURO_IMAGE} style={styles.catImage} resizeMode="contain" />
            </View>
          </View>

          <View style={[styles.sideColumn, isWideLayout && styles.sideColumnWide]}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}><Text style={styles.statLabel}>Rutina de hoy</Text><Text style={[styles.statValue, { color: colors.blue }]}>{clamp(progresoAseo)}%</Text><Text style={styles.statNote}>Lo diario hace que la casa respire.</Text></View>
              <View style={styles.statCard}><Text style={styles.statLabel}>Progreso total</Text><Text style={[styles.statValue, { color: colors.lilacStrong }]}>{clamp(progresoGeneral)}%</Text><Text style={styles.statNote}>Tambien cuentan semana, mes y profundo.</Text></View>
            </View>

            <View style={styles.levelCard}>
              <View style={styles.levelCopy}>
                <Text style={styles.levelLabel}>Vinculo con Kuroneko</Text>
                <Text style={styles.levelTitle}>{kuroLevel.label}</Text>
                <Text style={styles.levelText}>{kuroLevel.note}</Text>
              </View>
              <View style={styles.levelScoreWrap}><Text style={styles.levelScoreValue}>{kuroScore}</Text><Text style={styles.levelScoreLabel}>pts</Text></View>
            </View>

            <View style={styles.achievementCard}>
              <View style={styles.achievementHeaderRow}><Text style={styles.sectionTitle}>Desbloqueos</Text><Text style={styles.achievementCount}>{unlockedAchievements.length}</Text></View>
              <View style={styles.achievementChipWrap}>
                {unlockedAchievements.slice(0, 4).map((achievement) => (
                  <View key={achievement.id} style={styles.achievementChip}><Ionicons name={achievement.icon} size={14} color={colors.mintStrong} /><Text style={styles.achievementChipText}>{achievement.title}</Text></View>
                ))}
                {!unlockedAchievements.length ? <Text style={styles.achievementEmpty}>Aun no desbloqueas insignias, pero ya vas en camino.</Text> : null}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.illustrationGrid}>
          {actionCards.map((card) => <IllustrationCard key={card.key} styles={styles} image={card.image} title={card.title} text={card.text} onPress={card.onPress} onPreview={(source, title) => setPreviewItem({ source, title })} />)}
        </View>

        <View style={styles.focusCard}>
          <View style={styles.focusHeader}><View><Text style={styles.sectionTitle}>Lo mejor para hoy</Text><Text style={styles.focusSubtitle}>Si no sabes por donde partir, prueba con una de estas.</Text></View><TouchableOpacity onPress={() => navigation.navigate('Rutinas')} activeOpacity={0.8}><Text style={styles.linkText}>Ver todas</Text></TouchableOpacity></View>

          {sugerenciasHoy.length ? sugerenciasHoy.map((task) => (
            <TouchableOpacity key={task.id} style={styles.focusTask} onPress={() => navigation.navigate('Rutinas')} activeOpacity={0.82}>
              <TouchableOpacity style={styles.focusArtWrap} activeOpacity={0.9} delayLongPress={2000} onLongPress={() => getTaskIllustration(task.id, equippedTaskArt) && setPreviewItem({ source: getTaskIllustration(task.id, equippedTaskArt), title: task.nombre })}>{getTaskIllustration(task.id, equippedTaskArt) ? <Image source={getTaskIllustration(task.id, equippedTaskArt)} style={styles.focusArt} resizeMode="contain" /> : <Text style={styles.focusEmoji}>{task.icono}</Text>}</TouchableOpacity>
              <View style={styles.focusTaskCopy}><Text style={styles.focusTaskTitle}>{task.nombre}</Text><Text style={styles.focusTaskText}>{task.detalle}</Text></View>
              <View style={styles.focusTaskTime}><Text style={styles.focusTaskTimeText}>{task.duracion}</Text></View>
            </TouchableOpacity>
          )) : <View style={styles.emptyInlineCard}><Text style={styles.emptyInlineTitle}>Ya no quedan sugerencias abiertas por ahora.</Text><Text style={styles.emptyInlineText}>Puedes revisar semana o hacer una limpieza profunda si te nace.</Text></View>}
        </View>

        <View style={[styles.bottomGrid, isWideLayout && styles.bottomGridWide]}>
          <View style={[styles.quickCard, isWideLayout && styles.quickCardWide]}>
            <Text style={styles.sectionTitle}>Entradas rapidas</Text>
            <Text style={styles.focusSubtitle}>Para los dias en que cuesta empezar, pero igual quieres mover algo.</Text>
            <View style={styles.quickActionRow}>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Rutinas', { presetTab: 'diaria', presetFilter: 'quick' })} activeOpacity={0.85}><Ionicons name="flash-outline" size={18} color={colors.blue} /><Text style={styles.quickActionTitle}>5-12 min</Text><Text style={styles.quickActionText}>Solo tareas cortitas para empezar suave.</Text></TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Rutinas', { presetTab: 'diaria', presetFilter: 'pending' })} activeOpacity={0.85}><Ionicons name="albums-outline" size={18} color={colors.lilacStrong} /><Text style={styles.quickActionTitle}>Pendientes hoy</Text><Text style={styles.quickActionText}>Una vista solo de lo que sigue abierto hoy.</Text></TouchableOpacity>
            </View>
            <View style={styles.quickListWrap}>
              {tareasRapidas.length ? tareasRapidas.slice(0, 3).map((task) => (
                <TouchableOpacity key={task.id} style={styles.quickMiniTask} onPress={() => navigation.navigate('Rutinas', { presetTab: 'diaria', presetFilter: 'quick' })} activeOpacity={0.82}>
                  <TouchableOpacity style={styles.quickMiniArtWrap} activeOpacity={0.9} delayLongPress={2000} onLongPress={() => getTaskIllustration(task.id, equippedTaskArt) && setPreviewItem({ source: getTaskIllustration(task.id, equippedTaskArt), title: task.nombre })}>{getTaskIllustration(task.id, equippedTaskArt) ? <Image source={getTaskIllustration(task.id, equippedTaskArt)} style={styles.quickMiniArt} resizeMode="contain" /> : <Text style={styles.quickMiniEmoji}>{task.icono}</Text>}</TouchableOpacity>
                  <View style={styles.quickMiniCopy}><Text style={styles.quickMiniTitle}>{task.nombre}</Text><Text style={styles.quickMiniText}>{task.duracion}</Text></View>
                  <Ionicons name="arrow-forward" size={14} color={colors.textFaint} />
                </TouchableOpacity>
              )) : <View style={styles.emptyInlineCard}><Text style={styles.emptyInlineTitle}>No hay tareas cortitas pendientes ahora mismo.</Text><Text style={styles.emptyInlineText}>Buen trabajo. Puedes volver mas tarde o mirar semana/mes.</Text></View>}
            </View>
          </View>

          <View style={[styles.ritualCard, isWideLayout && styles.ritualCardWide]}>
            <Text style={styles.sectionTitle}>Si hoy estas con poca energia</Text>
            <Text style={styles.ritualText}>Haz una sola tarea corta, alimenta a Kuroneko y deja que eso sea suficiente por ahora.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Ritual')} activeOpacity={0.85}><Text style={styles.primaryButtonText}>Abrir ritual suave</Text><Ionicons name="arrow-forward" size={16} color={colors.bg} /></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <RewardBubble styles={styles} rewardToast={rewardToast} opacity={rewardOpacity} />
      <ImagePreviewModal visible={Boolean(previewItem)} source={previewItem?.source} title={previewItem?.title} colors={colors} onClose={() => setPreviewItem(null)} />
      <FeedModal visible={feedModalVisible} styles={styles} colors={colors} onClose={() => setFeedModalVisible(false)} onFeed={handleFeed} />
      <MiniGamePickerModal
        visible={gamePickerVisible}
        styles={styles}
        colors={colors}
        games={pickerGames}
        onClose={() => setGamePickerVisible(false)}
        onSelect={startSelectedMiniGame}
        onSurprise={startSurpriseMiniGame}
      />
      <MiniGameModal visible={Boolean(activeGameKey)} gameKey={activeGameKey} onClose={() => setActiveGameKey(null)} onReward={handleMiniGameReward} />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, width: '100%' },
  contentWide: { maxWidth: 1080, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  headerCopy: { flex: 1, paddingRight: 12 },
  eyebrow: { color: colors.pinkStrong, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', marginBottom: 8 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', lineHeight: 34, marginBottom: 8 },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  walletRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  walletChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADII.pill, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border },
  walletChipText: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
  ritualButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADII.pill, backgroundColor: `${colors.pink}20`, borderWidth: 1, borderColor: `${colors.pinkStrong}55`, shadowColor: colors.pinkStrong, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 20 },
  ritualButtonText: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
  topGrid: { width: '100%' },
  topGridWide: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  sceneCard: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: '100%', height: 352, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderStrong, marginBottom: 18, position: 'relative', backgroundColor: colors.bgGlassStrong, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.22, shadowRadius: 28 },
  sceneCardWide: { width: 'auto', flexGrow: 1.08, flexShrink: 1, flexBasis: 'auto', marginBottom: 0 },
  sceneTopRow: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sceneChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, borderWidth: 1 },
  sceneChipDot: { width: 8, height: 8, borderRadius: 4 },
  sceneChipText: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  sceneChipAlt: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.26)' },
  sceneChipAltText: { color: colors.textSoft, fontSize: 11, fontWeight: '700' },
  catStage: { position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center' },
  bubble: { maxWidth: 276, marginBottom: 4, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.24)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.36)' },
  bubbleText: { color: colors.ink, fontSize: 13, lineHeight: 18, textAlign: 'center', fontWeight: '600' },
  catImage: { width: 210, height: 210 },
  sideColumn: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: '100%', minWidth: 0 },
  sideColumnWide: { width: 'auto', flexGrow: 0.92, flexShrink: 1, flexBasis: 'auto' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  statCard: { flex: 1, minHeight: 126, padding: 16, borderRadius: 18, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 18 },
  statLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  statNote: { color: colors.textFaint, fontSize: 12, lineHeight: 18 },
  levelCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 18, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border, marginBottom: 18, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 18 },
  levelCopy: { flex: 1, paddingRight: 14 },
  levelLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, marginBottom: 6 },
  levelTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  levelText: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  levelScoreWrap: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.lilac}28`, borderWidth: 1, borderColor: `${colors.lilacStrong}50`, shadowColor: colors.lilacStrong, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
  levelScoreValue: { color: colors.lilacStrong, fontSize: 22, fontWeight: '800' },
  levelScoreLabel: { color: colors.textFaint, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  achievementCard: { padding: 18, borderRadius: 18, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border, marginBottom: 18, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 18 },
  achievementHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  achievementCount: { color: colors.mintStrong, fontSize: 18, fontWeight: '800' },
  achievementChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achievementChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADII.pill, backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder },
  achievementChipText: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
  achievementEmpty: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  illustrationGrid: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  illustrationCard: { flex: 1, padding: 14, borderRadius: 18, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border, minHeight: 168, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 16 },
  illustrationFrame: { height: 92, borderRadius: RADII.md, backgroundColor: `${colors.lilac}14`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: `${colors.lilacStrong}30` },
  illustrationImage: { width: '78%', height: '78%' },
  illustrationCopy: { flex: 1 },
  illustrationTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  illustrationText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  focusCard: { padding: 18, borderRadius: 18, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border, marginBottom: 18, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 16 },
  focusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  focusSubtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  linkText: { color: colors.blue, fontSize: 12, fontWeight: '700' },
  focusTask: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  focusEmoji: { fontSize: 22, marginRight: 12 },
  focusArtWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.pink}16`, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden', borderWidth: 1, borderColor: `${colors.pinkStrong}3e` },
  focusArt: { width: '78%', height: '78%' },
  focusTaskCopy: { flex: 1, paddingRight: 10 },
  focusTaskTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  focusTaskText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  focusTaskTime: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: RADII.pill, backgroundColor: `${colors.blue}18`, borderWidth: 1, borderColor: `${colors.blueStrong}32` },
  focusTaskTimeText: { color: colors.blue, fontSize: 11, fontWeight: '700' },
  emptyInlineCard: { paddingTop: 6 },
  emptyInlineTitle: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  emptyInlineText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  bottomGrid: { width: '100%' },
  bottomGridWide: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  quickCardWide: { width: 'auto', flexGrow: 1.35, flexShrink: 1, flexBasis: 'auto', marginBottom: 0 },
  ritualCardWide: { width: 'auto', flexGrow: 1, flexShrink: 1, flexBasis: 'auto', marginBottom: 0 },
  quickCard: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: '100%', padding: 18, borderRadius: 18, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border, marginBottom: 18, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 16 },
  quickActionRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 14 },
  quickActionButton: { flex: 1, padding: 14, borderRadius: 16, backgroundColor: colors.bgGlassStrong, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 14 },
  quickActionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 10, marginBottom: 4 },
  quickActionText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  quickListWrap: { gap: 10 },
  quickMiniTask: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  quickMiniEmoji: { fontSize: 20, marginRight: 12 },
  quickMiniArtWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: `${colors.lilac}16`, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden', borderWidth: 1, borderColor: `${colors.lilacStrong}3a` },
  quickMiniArt: { width: '76%', height: '76%' },
  quickMiniCopy: { flex: 1 },
  quickMiniTitle: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  quickMiniText: { color: colors.textFaint, fontSize: 11 },
  ritualCard: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: '100%', padding: 18, borderRadius: 18, backgroundColor: `${colors.pink}12`, borderWidth: 1, borderColor: `${colors.pinkStrong}42`, marginBottom: 18, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.14, shadowRadius: 18 },
  ritualText: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 16, borderRadius: RADII.pill, backgroundColor: colors.lilacStrong, shadowColor: colors.lilacStrong, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 18 },
  primaryButtonText: { color: colors.bg, fontSize: 13, fontWeight: '800' },
  rewardToast: { position: 'absolute', left: 18, right: 18, bottom: 96, padding: 14, borderRadius: RADII.lg, backgroundColor: colors.bgGlassStrong, borderWidth: 1, borderColor: colors.borderStrong, shadowColor: colors.pinkStrong, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 18 },
  rewardToastTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  rewardToastText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  rewardToastRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rewardToastChip: { color: colors.textSoft, fontSize: 11, fontWeight: '700', paddingVertical: 6, paddingHorizontal: 8, borderRadius: RADII.pill, backgroundColor: colors.bgCardAlt },
  gamePickerOverlay: { flex: 1, backgroundColor: 'rgba(6, 7, 18, 0.72)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  gamePickerCard: { width: '100%', maxWidth: 720, maxHeight: '88%', borderRadius: RADII.xl, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderStrong, overflow: 'hidden', shadowColor: colors.lilacStrong, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.24, shadowRadius: 30 },
  gamePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  gamePickerHeaderCopy: { flex: 1 },
  gamePickerEyebrow: { color: colors.gold, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  gamePickerTitle: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '800', marginBottom: 7 },
  gamePickerText: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  gamePickerScroll: { width: '100%' },
  gamePickerScrollContent: { padding: 16, gap: 12 },
  surpriseGameCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: 'rgba(255, 215, 111, 0.11)', borderWidth: 1, borderColor: 'rgba(255, 215, 111, 0.34)' },
  surpriseIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 215, 111, 0.12)', borderWidth: 1, borderColor: 'rgba(255, 215, 111, 0.24)' },
  surpriseTitle: { color: colors.text, fontSize: 16, lineHeight: 20, fontWeight: '900', marginBottom: 4 },
  gamePickerCardCopy: { flex: 1, minWidth: 0 },
  gameCategoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gameCategoryPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADII.pill, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: colors.border },
  gameCategoryPillActive: { backgroundColor: 'rgba(255, 215, 111, 0.16)', borderColor: 'rgba(255, 215, 111, 0.44)' },
  gameCategoryText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  gameCategoryTextActive: { color: colors.text },
  gamePickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gameChoiceCard: { flexGrow: 1, flexBasis: 152, minWidth: 142, padding: 13, borderRadius: 18, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border },
  gameChoiceCardFeatured: { flexBasis: 318, backgroundColor: 'rgba(114, 96, 201, 0.18)', borderColor: 'rgba(255, 215, 111, 0.34)' },
  gameChoiceVisual: { height: 54, borderRadius: RADII.md, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10 },
  gameChoiceVisualFeatured: { height: 68, backgroundColor: 'rgba(11, 17, 48, 0.72)' },
  gameChoiceIcon: { color: colors.gold, fontSize: 25, fontWeight: '900' },
  gameChoiceTitle: { color: colors.text, fontSize: 14, lineHeight: 18, fontWeight: '800', marginBottom: 5 },
  gamePickerDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  gamePickerKuroFrame: { width: 72, height: 50, overflow: 'hidden', transform: [{ scale: 1.06 }] },
  gamePickerKuroSheet: { position: 'absolute', left: 0, top: 0, width: 288, height: 50 },
  feedModalOverlay: { flex: 1, backgroundColor: 'rgba(12, 8, 18, 0.56)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  feedModalCard: { width: '100%', maxWidth: 680, borderRadius: RADII.xl, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderStrong, padding: 18, shadowColor: colors.pinkStrong, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 28 },
  feedModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  feedModalHeaderCopy: { flex: 1 },
  feedModalEyebrow: { color: colors.pinkStrong, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  feedModalTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  feedModalText: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  feedCloseButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCardAlt, borderWidth: 1, borderColor: colors.border },
  feedOptionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  feedOptionCard: { flex: 1, padding: 12, borderRadius: RADII.lg, backgroundColor: colors.bgGlass, borderWidth: 1, borderColor: colors.border },
  feedOptionCardActive: { transform: [{ translateY: -2 }], shadowColor: colors.pinkStrong, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 16 },
  feedOptionEmojiWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  feedOptionEmoji: { fontSize: 22 },
  feedOptionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  feedOptionNote: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  feedDragStage: { minHeight: 320, borderRadius: RADII.xl, backgroundColor: colors.bgGlassStrong, borderWidth: 1, borderColor: colors.border, padding: 16, position: 'relative', overflow: 'hidden' },
  feedInstructionPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: RADII.pill, backgroundColor: `${colors.pink}18`, borderWidth: 1, borderColor: `${colors.pinkStrong}48`, marginBottom: 14, zIndex: 2 },
  feedInstructionText: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
  feedStageLine: { position: 'absolute', left: '50%', marginLeft: -1, top: 72, bottom: 90, width: 2, backgroundColor: `${colors.borderStrong}` },
  feedCatTarget: { alignSelf: 'center', width: '74%', minHeight: 176, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14, borderRadius: 28, backgroundColor: `${colors.lilac}12`, borderWidth: 1, borderColor: `${colors.lilacStrong}40`, alignItems: 'center', justifyContent: 'center' },
  feedCatAura: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: `${colors.pink}16`, top: 12 },
  feedCatModalImage: { width: 110, height: 110, marginBottom: 8 },
  feedCatTargetTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  feedCatTargetText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  feedFallbackButton: { alignSelf: 'center', marginTop: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADII.pill, backgroundColor: colors.lilacStrong, shadowColor: colors.lilacStrong, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 16, zIndex: 3 },
  feedFallbackButtonText: { color: colors.bg, fontSize: 12, fontWeight: '800' },
  feedDragBubble: { position: 'absolute', left: '50%', bottom: 18, marginLeft: -76, width: 152, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 24, borderWidth: 1, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 16 },
  feedDragBubbleWeb: { cursor: 'grab', touchAction: 'none', userSelect: 'none' },
  feedDragBubbleActive: { shadowColor: colors.pinkStrong, shadowOpacity: 0.24, shadowRadius: 22 },
  feedDragEmoji: { fontSize: 28, marginBottom: 4 },
  feedDragTitle: { color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 2, textAlign: 'center' },
  feedDragHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
});

