import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCat } from '../context/CatContext';
import { COLORS, RADII } from '../theme/tokens';
import RooftopAdventureGame from './RooftopAdventureGame';
import SnoreLintGame from '../pelusas/SnoreLintGame';

export const ACTIVE_MINIGAME_KEYS = [
  'lint',
  'roller',
  'laundry',
  'misplaced',
  'bath',
  'bed',
  'rooftop',
];

const GAME_META = {
  lint: {
    title: 'Atrapa Pelusas',
    subtitle: 'Kuro ronca en el sillón: atrapa las 12 pelusas sin despertarlo.',
    rewards: { coins: 4, hearts: 1, happiness: 4 },
    reaction: 'Kuroneko ni se enteró y la sala quedó limpiecita.',
  },
  roller: {
    title: 'Rodillo quitapelos',
    subtitle: 'Pasa el rodillo y saca casi todo el pelo del mueble.',
    rewards: { coins: 5, hearts: 1, happiness: 5 },
    reaction: 'Ahora si dan ganas de echarse encima del cojin.',
    variants: [
      { label: 'Manta de gato', boardColor: '#d4c0cf' },
      { label: 'Sillon suave', boardColor: '#cec4d6' },
      { label: 'Cojin peludito', boardColor: '#d2c0ba' },
    ],
  },
  laundry: {
    title: 'Separar ropita',
    subtitle: 'Desliza cada prenda al canasto correcto.',
    rewards: { coins: 4, hearts: 1, happiness: 4 },
    reaction: 'Kuroneko mira la montanita ordenada con orgullo.',
  },
  misplaced: {
    title: 'Fuera de lugar',
    subtitle: 'Toca lo que esta fuera de sitio para arreglarlo.',
    rewards: { coins: 4, hearts: 1, happiness: 4 },
    reaction: 'Todo volvio a su lugar y el cuarto se siente mas suave.',
    variants: [
      { label: 'Dormitorio', boardColor: '#b8c7dc' },
      { label: 'Cocina', boardColor: '#c9d8c3' },
      { label: 'Bano', boardColor: '#c5d7df' },
    ],
  },
  bath: {
    title: 'Bano burbujita',
    subtitle: 'Revienta burbujas y enjuaga con suavidad.',
    rewards: { coins: 5, hearts: 2, happiness: 6 },
    reaction: 'Kuroneko queda brillante y mucho mas contento.',
    variants: [
      { label: 'Agua tibiecita', boardColor: '#a8cff0' },
      { label: 'Tina pastel', boardColor: '#aed8f6' },
    ],
  },
  bed: {
    title: 'Cama perfecta',
    subtitle: 'Ordena la cama paso a paso y deja el rincon listo.',
    rewards: { coins: 6, hearts: 2, happiness: 5 },
    reaction: 'La cama quedo tan linda que Kuroneko quiere dormir ahi.',
    variants: [
      { label: 'Cama humana', boardColor: '#cfbce2' },
      { label: 'Rincon gatuno', boardColor: '#d8c2db' },
    ],
  },
  rooftop: {
    title: 'Kuro: Aventura de Tejados',
    subtitle: 'Corre por tejados nocturnos, salta suave y junta estrellitas.',
    rewards: { coins: 7, hearts: 2, happiness: 6 },
    reaction: 'Kuroneko vuelve con patitas cansadas, estrellitas doradas y mucha alegria.',
  },
};

function playSoftTone(kind, enabled) {
  if (!enabled || Platform.OS !== 'web' || typeof window === 'undefined') return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const context = new AudioCtx();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const tone = {
    success: { frequency: 720, duration: 0.11, type: 'sine' },
    pop: { frequency: 560, duration: 0.05, type: 'triangle' },
    soft: { frequency: 420, duration: 0.07, type: 'triangle' },
  }[kind] || { frequency: 480, duration: 0.06, type: 'triangle' };

  oscillator.type = tone.type;
  oscillator.frequency.value = tone.frequency;
  gain.gain.value = 0.025;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + tone.duration);
  oscillator.onended = () => context.close();
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function RewardChip({ icon, value, tint, label }) {
  if (!value) return null;

  return (
    <View style={styles.rewardChip}>
      <Ionicons name={icon} size={15} color={tint} />
      <Text style={styles.rewardChipValue}>+{value}</Text>
      <Text style={styles.rewardChipLabel}>{label}</Text>
    </View>
  );
}

function CozyBoard({ children, footer }) {
  return (
    <View style={styles.boardWrap}>
      {children}
      {footer ? <View style={styles.boardFooter}>{footer}</View> : null}
    </View>
  );
}

function RollerGame({ onComplete, variant, soundEnabled }) {
  const hairPoints = useMemo(() => ([
    { id: 'h1', x: 14, y: 20 },
    { id: 'h2', x: 26, y: 34 },
    { id: 'h3', x: 36, y: 44 },
    { id: 'h4', x: 48, y: 26 },
    { id: 'h5', x: 58, y: 38 },
    { id: 'h6', x: 68, y: 24 },
    { id: 'h7', x: 78, y: 44 },
    { id: 'h8', x: 18, y: 60 },
    { id: 'h9', x: 28, y: 72 },
    { id: 'h10', x: 42, y: 64 },
    { id: 'h11', x: 56, y: 74 },
    { id: 'h12', x: 68, y: 62 },
    { id: 'h13', x: 80, y: 70 },
  ]), []);
  const [cleanedIds, setCleanedIds] = useState([]);
  const [roller, setRoller] = useState({ x: 22, y: 42 });
  const [done, setDone] = useState(false);

  const rollAt = (x, y) => {
    setRoller({ x, y });
    setCleanedIds((prev) => {
      const next = [...prev];
      hairPoints.forEach((point) => {
        if (!next.includes(point.id) && distance({ x, y }, point) < 16) {
          next.push(point.id);
        }
      });
      return next;
    });
  };

  useEffect(() => {
    if (!done && cleanedIds.length / hairPoints.length >= 0.9) {
      setDone(true);
      playSoftTone('success', soundEnabled);
      setTimeout(() => onComplete(), 600);
    }
  }, [cleanedIds.length, done, hairPoints.length, onComplete, soundEnabled]);

  return (
    <CozyBoard
      footer={<Text style={styles.progressText}>{Math.round((cleanedIds.length / hairPoints.length) * 100)}% limpio</Text>}
    >
      <View
        style={[styles.surfaceBoard, styles.rollerBoard, { backgroundColor: variant?.boardColor || '#d4c0cf' }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => rollAt(event.nativeEvent.locationX / 3.1, event.nativeEvent.locationY / 2.45)}
        onResponderMove={(event) => rollAt(event.nativeEvent.locationX / 3.1, event.nativeEvent.locationY / 2.45)}
      >
        <View style={[styles.surfaceGlow, { opacity: cleanedIds.length / hairPoints.length }]} />
        {hairPoints.map((point) => {
          const cleaned = cleanedIds.includes(point.id);
          return (
            <View
              key={point.id}
              style={[
                styles.hairMark,
                {
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  opacity: cleaned ? 0 : 1,
                },
              ]}
            />
          );
        })}
        <View style={[styles.rollerTool, { left: `${roller.x}%`, top: `${roller.y}%` }]}>
          <View style={styles.rollerHandle} />
          <View style={styles.rollerBody} />
        </View>
        {done ? <Text style={styles.successMark}>Que suave</Text> : null}
      </View>
    </CozyBoard>
  );
}

function LaundryGame({ onComplete, soundEnabled }) {
  const items = useMemo(() => ([
    { id: 'c1', emoji: '👕', label: 'Polera limpia', correct: 'clean' },
    { id: 'c2', emoji: '🧦', label: 'Calcetin sucio', correct: 'dirty' },
    { id: 'c3', emoji: '👗', label: 'Vestido limpio', correct: 'clean' },
    { id: 'c4', emoji: '🩳', label: 'Shorts sucios', correct: 'dirty' },
    { id: 'c5', emoji: '🧣', label: 'Bufanda limpia', correct: 'clean' },
  ]), []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const drag = useRef(new Animated.ValueXY()).current;
  const currentItem = items[index];

  useEffect(() => {
    drag.setValue({ x: 0, y: 0 });
  }, [drag, index]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      const target = gesture.dx < -60 ? 'dirty' : gesture.dx > 60 ? 'clean' : null;

      if (!target) {
        Animated.spring(drag, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        return;
      }

      if (currentItem.correct === target) {
        playSoftTone('soft', soundEnabled);
        setFeedback(target === 'clean' ? 'Quedo ordenadita' : 'Adentro del canasto sucio');
        Animated.timing(drag, {
          toValue: { x: target === 'clean' ? 180 : -180, y: 60 },
          duration: 180,
          useNativeDriver: false,
        }).start(() => {
          if (index === items.length - 1) {
            playSoftTone('success', soundEnabled);
            onComplete();
          } else {
            setIndex((prev) => prev + 1);
          }
        });
      } else {
        playSoftTone('pop', soundEnabled);
        setFeedback('Ups, ese canasto no era');
        Animated.sequence([
          Animated.timing(drag, { toValue: { x: gesture.dx * 0.2, y: 0 }, duration: 120, useNativeDriver: false }),
          Animated.spring(drag, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
        ]).start();
      }
    },
  }), [currentItem, drag, index, items.length, onComplete, soundEnabled]);

  if (!currentItem) return null;

  return (
    <CozyBoard footer={<Text style={styles.progressText}>{index + 1}/{items.length} prendas</Text>}>
      <View style={styles.laundryWrap}>
        <View style={styles.basketRow}>
          <View style={styles.basketCard}>
            <Text style={styles.basketEmoji}>🧺</Text>
            <Text style={styles.basketTitle}>Sucia</Text>
          </View>
          <View style={styles.basketCard}>
            <Text style={styles.basketEmoji}>🧺</Text>
            <Text style={styles.basketTitle}>Limpia</Text>
          </View>
        </View>
        <Animated.View style={[styles.clothingCard, drag.getLayout()]} {...panResponder.panHandlers}>
          <Text style={styles.clothingEmoji}>{currentItem.emoji}</Text>
          <Text style={styles.clothingLabel}>{currentItem.label}</Text>
          <Text style={styles.clothingHint}>Desliza a izquierda o derecha</Text>
        </Animated.View>
        <Text style={styles.helperText}>{feedback || 'La limpia va a la derecha. La sucia va a la izquierda.'}</Text>
      </View>
    </CozyBoard>
  );
}

function MisplacedGame({ onComplete, variant, soundEnabled }) {
  const items = useMemo(() => ([
    { id: 'm1', emoji: '🥄', wrongX: '18%', wrongY: '66%', rightX: '72%', rightY: '24%' },
    { id: 'm2', emoji: '🧼', wrongX: '68%', wrongY: '54%', rightX: '18%', rightY: '24%' },
    { id: 'm3', emoji: '📚', wrongX: '44%', wrongY: '72%', rightX: '64%', rightY: '20%' },
    { id: 'm4', emoji: '🧸', wrongX: '75%', wrongY: '70%', rightX: '26%', rightY: '58%' },
  ]), []);
  const [fixed, setFixed] = useState([]);

  useEffect(() => {
    if (fixed.length === items.length) {
      playSoftTone('success', soundEnabled);
      setTimeout(() => onComplete(), 500);
    }
  }, [fixed.length, items.length, onComplete, soundEnabled]);

  return (
    <CozyBoard footer={<Text style={styles.progressText}>{fixed.length}/{items.length} cosas acomodadas</Text>}>
      <View style={[styles.roomBoard, { backgroundColor: variant?.boardColor || '#b8c7dc' }]}>
        <View style={styles.roomBed} />
        <View style={styles.roomTable} />
        <View style={styles.roomShelf} />
        {items.map((item) => {
          const isFixed = fixed.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.roomObject,
                {
                  left: isFixed ? item.rightX : item.wrongX,
                  top: isFixed ? item.rightY : item.wrongY,
                  backgroundColor: isFixed ? 'rgba(110, 224, 180, 0.18)' : 'rgba(255,255,255,0.06)',
                },
              ]}
              onPress={() => {
                if (!isFixed) {
                  playSoftTone('soft', soundEnabled);
                  setFixed((prev) => [...prev, item.id]);
                }
              }}
              activeOpacity={0.84}
            >
              <Text style={styles.roomObjectEmoji}>{item.emoji}</Text>
            </TouchableOpacity>
          );
        })}
        {fixed.length === items.length ? <Text style={styles.successMark}>Todo en su lugar</Text> : null}
      </View>
    </CozyBoard>
  );
}

function BubbleBathGame({ onComplete, variant, soundEnabled }) {
  const bubblePoints = useMemo(() => ([
    { id: 'b1', x: '18%', y: '20%' },
    { id: 'b2', x: '34%', y: '16%' },
    { id: 'b3', x: '54%', y: '18%' },
    { id: 'b4', x: '68%', y: '22%' },
    { id: 'b5', x: '26%', y: '38%' },
    { id: 'b6', x: '52%', y: '40%' },
  ]), []);
  const foamPoints = useMemo(() => ([
    { id: 'f1', x: 22, y: 42 },
    { id: 'f2', x: 40, y: 46 },
    { id: 'f3', x: 57, y: 44 },
    { id: 'f4', x: 34, y: 63 },
    { id: 'f5', x: 52, y: 64 },
  ]), []);
  const [phase, setPhase] = useState('bubbles');
  const [popped, setPopped] = useState([]);
  const [cleaned, setCleaned] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (phase === 'bubbles' && popped.length === bubblePoints.length) {
      setPhase('rinse');
    }
  }, [bubblePoints.length, phase, popped.length]);

  useEffect(() => {
    if (!done && phase === 'rinse' && cleaned.length === foamPoints.length) {
      setDone(true);
      playSoftTone('success', soundEnabled);
      setTimeout(() => onComplete(), 600);
    }
  }, [cleaned.length, done, foamPoints.length, onComplete, phase, soundEnabled]);

  const rinseAt = (x, y) => {
    setCursor({ x, y });
    setCleaned((prev) => {
      const next = [...prev];
      foamPoints.forEach((point) => {
        if (!next.includes(point.id) && distance({ x, y }, point) < 15) {
          next.push(point.id);
        }
      });
      return next;
    });
  };

  return (
    <CozyBoard footer={<Text style={styles.progressText}>{phase === 'bubbles' ? 'Revienta burbujitas' : 'Desliza para enjuagar'}</Text>}>
      <View
        style={[styles.bathBoard, { backgroundColor: variant?.boardColor || '#a8cff0' }]}
        onStartShouldSetResponder={() => phase === 'rinse'}
        onMoveShouldSetResponder={() => phase === 'rinse'}
        onResponderGrant={(event) => rinseAt(event.nativeEvent.locationX / 3.1, event.nativeEvent.locationY / 2.45)}
        onResponderMove={(event) => rinseAt(event.nativeEvent.locationX / 3.1, event.nativeEvent.locationY / 2.45)}
        onResponderRelease={() => setCursor(null)}
      >
        <Text style={styles.bathCat}>{done ? '😺' : phase === 'bubbles' ? '😶‍🌫️' : '🐱'}</Text>
        {bubblePoints.map((point) => {
          const gone = popped.includes(point.id);
          return (
            <TouchableOpacity
              key={point.id}
              style={[styles.bubbleDot, { left: point.x, top: point.y, opacity: phase === 'bubbles' && !gone ? 1 : 0 }]}
              onPress={() => {
                playSoftTone('pop', soundEnabled);
                setPopped((prev) => (prev.includes(point.id) ? prev : [...prev, point.id]));
              }}
              activeOpacity={0.82}
            />
          );
        })}
        {foamPoints.map((point) => {
          const gone = cleaned.includes(point.id);
          return (
            <View
              key={point.id}
              style={[
                styles.foamPatch,
                {
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  opacity: phase === 'rinse' && !gone ? 1 : 0,
                },
              ]}
            />
          );
        })}
        {cursor && phase === 'rinse' ? <View style={[styles.rinseCursor, { left: `${cursor.x}%`, top: `${cursor.y}%` }]} /> : null}
      </View>
    </CozyBoard>
  );
}

function BedGame({ onComplete, variant, soundEnabled }) {
  const [sheetTouches, setSheetTouches] = useState([]);
  const [step, setStep] = useState('sheet');
  const [pillowPos, setPillowPos] = useState({ x: 24, y: 56 });
  const [blanketTouches, setBlanketTouches] = useState([]);

  const pillowPan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: () => step === 'pillow',
    onPanResponderMove: (event, gesture) => {
      setPillowPos({
        x: Math.max(12, Math.min(72, 24 + gesture.dx / 3)),
        y: Math.max(20, Math.min(72, 56 + gesture.dy / 3)),
      });
    },
    onPanResponderRelease: () => {
      const isCorrect = distance({ x: pillowPos.x, y: pillowPos.y }, { x: 63, y: 28 }) < 12;
      if (isCorrect) {
        setPillowPos({ x: 63, y: 28 });
        setStep('blanket');
      } else {
        setPillowPos({ x: 24, y: 56 });
      }
    },
  }), [pillowPos.x, pillowPos.y, step]);

  useEffect(() => {
    if (step === 'sheet' && sheetTouches.length >= 6) {
      playSoftTone('soft', soundEnabled);
      setStep('pillow');
    }
  }, [sheetTouches.length, step, soundEnabled]);

  useEffect(() => {
    if (step === 'blanket' && blanketTouches.length >= 6) {
      setStep('done');
      playSoftTone('success', soundEnabled);
      setTimeout(() => onComplete(), 700);
    }
  }, [blanketTouches.length, onComplete, step, soundEnabled]);

  const smoothSheet = (x) => {
    const segment = Math.max(0, Math.min(5, Math.floor((x / 310) * 6)));
    setSheetTouches((prev) => (prev.includes(segment) ? prev : [...prev, segment]));
  };

  const smoothBlanket = (x) => {
    const segment = Math.max(0, Math.min(5, Math.floor((x / 310) * 6)));
    setBlanketTouches((prev) => (prev.includes(segment) ? prev : [...prev, segment]));
  };

  return (
    <CozyBoard
      footer={<Text style={styles.progressText}>{step === 'sheet' ? 'Alisa la sabana' : step === 'pillow' ? 'Lleva la almohada al borde superior' : step === 'blanket' ? 'Acomoda la manta' : 'Lista para descansar'}</Text>}
    >
      <View
        style={[styles.bedBoard, { backgroundColor: variant?.boardColor || '#cfbce2' }]}
        onStartShouldSetResponder={() => step === 'sheet' || step === 'blanket'}
        onMoveShouldSetResponder={() => step === 'sheet' || step === 'blanket'}
        onResponderGrant={(event) => {
          if (step === 'sheet') smoothSheet(event.nativeEvent.locationX);
          if (step === 'blanket') smoothBlanket(event.nativeEvent.locationX);
        }}
        onResponderMove={(event) => {
          if (step === 'sheet') smoothSheet(event.nativeEvent.locationX);
          if (step === 'blanket') smoothBlanket(event.nativeEvent.locationX);
        }}
      >
        <View style={[styles.sheetLayer, { opacity: 0.6 + sheetTouches.length * 0.06 }]} />
        <View style={[styles.blanketLayer, { opacity: step === 'blanket' || step === 'done' ? 0.5 + blanketTouches.length * 0.06 : 0.24 }]} />
        <View style={styles.pillowTarget} />
        {step !== 'done' ? (
          <View style={[styles.pillow, { left: `${pillowPos.x}%`, top: `${pillowPos.y}%` }]} {...pillowPan.panHandlers}>
            <Text style={styles.pillowEmoji}>☁️</Text>
          </View>
        ) : null}
        {step === 'done' ? <Text style={styles.bedCat}>😽</Text> : null}
      </View>
    </CozyBoard>
  );
}

const GAME_COMPONENTS = {
  lint: SnoreLintGame,
  roller: RollerGame,
  laundry: LaundryGame,
  misplaced: MisplacedGame,
  bath: BubbleBathGame,
  bed: BedGame,
  rooftop: RooftopAdventureGame,
};

export function MiniGameModal({ visible, gameKey, onClose, onReward }) {
  const { settings } = useCat();
  const [showResult, setShowResult] = useState(false);
  const [variant, setVariant] = useState(null);
  const timeoutRef = useRef(null);
  const meta = gameKey ? GAME_META[gameKey] : null;
  const GameComponent = gameKey ? GAME_COMPONENTS[gameKey] : null;

  useEffect(() => {
    setShowResult(false);
    if (meta?.variants?.length) {
      const nextVariant = meta.variants[Math.floor(Math.random() * meta.variants.length)];
      setVariant(nextVariant);
    } else {
      setVariant(null);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [gameKey, meta, visible]);

  if (!meta || !GameComponent) return null;

  const handleComplete = () => {
    setShowResult(true);
    playSoftTone('success', settings.soundEnabled);
    timeoutRef.current = setTimeout(() => {
      onReward({
        gameKey,
        title: meta.title,
        rewards: meta.rewards,
        reaction: meta.reaction,
      });
      setShowResult(false);
      onClose();
    }, 1400);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalEyebrow}>Minijuego cozy</Text>
              <Text style={styles.modalTitle}>{meta.title}</Text>
              <Text style={styles.modalSubtitle}>{meta.subtitle}{variant?.label ? ` · ${variant.label}` : ''}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {gameKey === 'lint' ? (
            <View style={{ height: 520 }}>
              <GameComponent onComplete={handleComplete} onClose={onClose} variant={variant} soundEnabled={settings.soundEnabled} />
            </View>
          ) : (
            <GameComponent onComplete={handleComplete} onClose={onClose} variant={variant} soundEnabled={settings.soundEnabled} />
          )}

          {showResult ? (
            <View style={styles.resultOverlay}>
              <Text style={styles.resultEmoji}>😻</Text>
              <Text style={styles.resultTitle}>Que gustito.</Text>
              <Text style={styles.resultText}>{meta.reaction}</Text>
              <View style={styles.resultRewards}>
                <RewardChip icon="logo-bitcoin" value={meta.rewards.coins} tint={COLORS.gold} label="monedas" />
                <RewardChip icon="heart" value={meta.rewards.hearts} tint={COLORS.pinkStrong} label="corazones" />
                <RewardChip icon="sparkles" value={meta.rewards.happiness} tint={COLORS.mintStrong} label="felicidad" />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 12, 0.86)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalHeaderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  modalEyebrow: {
    color: COLORS.blue,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  boardWrap: {
    padding: 16,
  },
  boardFooter: {
    paddingTop: 12,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  surfaceBoard: {
    width: 310,
    alignSelf: 'center',
    height: 245,
    borderRadius: RADII.lg,
    overflow: 'hidden',
    backgroundColor: '#dbcab6',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  surfaceGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  lintDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(92, 80, 76, 0.7)',
  },
  cleanCursor: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    marginLeft: -26,
    marginTop: -26,
  },
  successMark: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  rollerBoard: {
    backgroundColor: '#d4c0cf',
  },
  hairMark: {
    position: 'absolute',
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(70, 62, 69, 0.9)',
    transform: [{ rotate: '18deg' }],
  },
  rollerTool: {
    position: 'absolute',
    width: 78,
    height: 34,
    marginLeft: -39,
    marginTop: -17,
    alignItems: 'center',
  },
  rollerHandle: {
    width: 6,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#8f7d6f',
    marginBottom: 2,
  },
  rollerBody: {
    width: 78,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#f6f1eb',
    borderWidth: 1,
    borderColor: 'rgba(97, 87, 82, 0.18)',
  },
  laundryWrap: {
    width: 310,
    alignSelf: 'center',
    minHeight: 245,
  },
  basketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  basketCard: {
    width: '47%',
    padding: 14,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.bgGlassStrong,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  basketEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  basketTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  clothingCard: {
    alignSelf: 'center',
    width: '82%',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: RADII.xl,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginTop: 8,
  },
  clothingEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  clothingLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  clothingHint: {
    color: COLORS.textFaint,
    fontSize: 12,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
  },
  roomBoard: {
    width: 310,
    alignSelf: 'center',
    height: 245,
    borderRadius: RADII.lg,
    backgroundColor: '#b8c7dc',
    overflow: 'hidden',
  },
  roomBed: {
    position: 'absolute',
    left: '12%',
    bottom: '14%',
    width: '54%',
    height: '28%',
    borderRadius: 20,
    backgroundColor: '#f2d7e8',
  },
  roomTable: {
    position: 'absolute',
    right: '14%',
    bottom: '16%',
    width: '18%',
    height: '20%',
    borderRadius: 12,
    backgroundColor: '#e2c8b0',
  },
  roomShelf: {
    position: 'absolute',
    right: '18%',
    top: '18%',
    width: '32%',
    height: '12%',
    borderRadius: 10,
    backgroundColor: '#d9b69b',
  },
  roomObject: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomObjectEmoji: {
    fontSize: 22,
  },
  bathBoard: {
    width: 310,
    alignSelf: 'center',
    height: 245,
    borderRadius: RADII.lg,
    overflow: 'hidden',
    backgroundColor: '#a8cff0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bathCat: {
    fontSize: 94,
  },
  bubbleDot: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  foamPatch: {
    position: 'absolute',
    width: 52,
    height: 26,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  rinseCursor: {
    position: 'absolute',
    width: 62,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.45)',
    marginLeft: -31,
    marginTop: -8,
  },
  bedBoard: {
    width: 310,
    alignSelf: 'center',
    height: 245,
    borderRadius: RADII.lg,
    backgroundColor: '#cfbce2',
    overflow: 'hidden',
  },
  sheetLayer: {
    position: 'absolute',
    left: '12%',
    top: '22%',
    width: '76%',
    height: '56%',
    borderRadius: 28,
    backgroundColor: '#fff4ea',
  },
  blanketLayer: {
    position: 'absolute',
    left: '18%',
    bottom: '18%',
    width: '64%',
    height: '24%',
    borderRadius: 20,
    backgroundColor: '#f6c2dd',
  },
  pillowTarget: {
    position: 'absolute',
    right: '18%',
    top: '16%',
    width: 54,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillow: {
    position: 'absolute',
    width: 54,
    height: 34,
    marginLeft: -27,
    marginTop: -17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillowEmoji: {
    fontSize: 28,
  },
  bedCat: {
    position: 'absolute',
    right: '22%',
    top: '30%',
    fontSize: 44,
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 28, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  resultTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: 16,
  },
  resultRewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  rewardChip: {
    minWidth: 86,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  rewardChipValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  rewardChipLabel: {
    color: COLORS.textFaint,
    fontSize: 11,
    marginTop: 2,
  },
});
