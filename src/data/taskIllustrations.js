const DEFAULT_TASK_ILLUSTRATIONS = {
  d1: require('../../assets/icon-desayuno.optimized.png'),
  d2: require('../../assets/icon-tomar-desayuno.optimized.png'),
  d3: require('../../assets/icon-bano.optimized.png'),
  d4: require('../../assets/icon-tender-cama.optimized.png'),
  d5: require('../../assets/icon-limpiar-cocina.optimized.png'),
  d6: require('../../assets/icon-tomar-desayuno.optimized.png'),
  d7: require('../../assets/icon-tomar-once.optimized.png'),
  d8: require('../../assets/icon-tomar-once.optimized.png'),
  d9: require('../../assets/icon-sacar-basura.optimized.png'),
  d10: require('../../assets/icon-limpiar-polvo.optimized.png'),
  d11: require('../../assets/icon-lavar-loza.optimized.png'),
  d12: require('../../assets/icon-barrer-trapear.optimized.png'),
  s1: require('../../assets/icon-lavar-ropa.optimized.png'),
  s2: require('../../assets/icon-planchar.optimized.png'),
  s3: require('../../assets/icon-limpiar-cocina.optimized.png'),
  s4: require('../../assets/icon-limpiar-refrigerador.optimized.png'),
  s5: require('../../assets/icon-cambiar-sabanas.optimized.png'),
  s6: require('../../assets/icon-ordenar-armarios.optimized.png'),
  m1: require('../../assets/icon-limpiar-ventanas.optimized.png'),
  m2: require('../../assets/icon-aspirar.optimized.png'),
  m3: require('../../assets/icon-revisar-despensa.optimized.png'),
  m4: require('../../assets/icon-limpiar-lamparas.optimized.png'),
  a1: require('../../assets/icon-limpieza-profunda.optimized.png'),
  a2: require('../../assets/icon-revisar-pintura.optimized.png'),
  a3: require('../../assets/icon-ordenar-donar.optimized.png'),
};

export const TASK_ART_OPTIONS = {
  d4: [
    {
      id: 'd4_default',
      source: require('../../assets/icon-tender-cama.optimized.png'),
      label: 'Base tender cama',
      purchasable: false,
    },
    {
      id: 'd4_catbed_placeholder',
      source: require('../../assets/icon-tender-cama.optimized.png'),
      label: 'Espacio para gatito cama',
      purchasable: true,
    },
  ],
};

export function getTaskIllustration(taskId, equippedTaskArt = {}) {
  const selectedOptionId = equippedTaskArt?.[taskId];
  const options = TASK_ART_OPTIONS[taskId];

  if (selectedOptionId && options?.length) {
    const selected = options.find((option) => option.id === selectedOptionId);
    if (selected?.source) return selected.source;
  }

  return DEFAULT_TASK_ILLUSTRATIONS[taskId] || null;
}

export { DEFAULT_TASK_ILLUSTRATIONS as TASK_ILLUSTRATIONS };
