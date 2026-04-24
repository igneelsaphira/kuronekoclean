const DARK_COLORS = {
  bg: '#101517',
  bgSoft: '#162022',
  bgCard: '#1d282b',
  bgCardAlt: '#263236',
  bgGlass: 'rgba(29, 40, 43, 0.82)',
  bgGlassStrong: 'rgba(17, 24, 26, 0.94)',
  border: 'rgba(207, 224, 220, 0.16)',
  borderStrong: 'rgba(207, 224, 220, 0.3)',
  lilac: '#c8bedf',
  lilacStrong: '#ab9dd4',
  blue: '#99cdd8',
  blueStrong: '#71b8c7',
  pink: '#efb8a8',
  pinkStrong: '#e28f7b',
  mint: '#b8dfcf',
  mintStrong: '#78c9ad',
  gold: '#f0c36e',
  text: '#f8f4ed',
  textSoft: 'rgba(248, 244, 237, 0.92)',
  textMuted: 'rgba(226, 221, 211, 0.72)',
  textFaint: 'rgba(208, 202, 192, 0.54)',
  ink: '#304143',
  successBg: 'rgba(159, 214, 200, 0.16)',
  successBorder: 'rgba(159, 214, 200, 0.34)',
  warningBg: 'rgba(243, 213, 178, 0.16)',
  warningBorder: 'rgba(243, 213, 178, 0.3)',
  shadow: '#050809',
  white: '#ffffff',
};

const LIGHT_COLORS = {
  bg: '#f5f1e7',
  bgSoft: '#fbf8f0',
  bgCard: '#fffdf7',
  bgCardAlt: '#ece7da',
  bgGlass: 'rgba(255, 253, 247, 0.9)',
  bgGlassStrong: 'rgba(246, 242, 232, 0.97)',
  border: 'rgba(83, 103, 100, 0.14)',
  borderStrong: 'rgba(83, 103, 100, 0.26)',
  lilac: '#c9c0dc',
  lilacStrong: '#8f80b9',
  blue: '#98c7d0',
  blueStrong: '#4f98a6',
  pink: '#efc2b3',
  pinkStrong: '#cb735d',
  mint: '#b5d8c8',
  mintStrong: '#4f967d',
  gold: '#b98a2d',
  text: '#2f3d3d',
  textSoft: 'rgba(47, 61, 61, 0.92)',
  textMuted: 'rgba(65, 79, 78, 0.7)',
  textFaint: 'rgba(82, 96, 94, 0.54)',
  ink: '#375256',
  successBg: 'rgba(79, 150, 125, 0.14)',
  successBorder: 'rgba(79, 150, 125, 0.28)',
  warningBg: 'rgba(185, 138, 45, 0.14)',
  warningBorder: 'rgba(185, 138, 45, 0.26)',
  shadow: '#aab1a6',
  white: '#ffffff',
};

export const THEMES = {
  dark: DARK_COLORS,
  light: LIGHT_COLORS,
};

export function getThemeColors(mode = 'dark') {
  return THEMES[mode] || DARK_COLORS;
}

export const COLORS = DARK_COLORS;

export const RADII = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const PHONE_FRAME = {
  width: 390,
  height: 844,
};
