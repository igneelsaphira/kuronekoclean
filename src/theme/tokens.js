const DARK_COLORS = {
  bg: '#14101d',
  bgSoft: '#1b1527',
  bgCard: '#231b31',
  bgCardAlt: '#2c223d',
  bgGlass: 'rgba(35, 27, 49, 0.78)',
  bgGlassStrong: 'rgba(25, 19, 36, 0.92)',
  border: 'rgba(222, 196, 245, 0.18)',
  borderStrong: 'rgba(222, 196, 245, 0.34)',
  lilac: '#dec4f5',
  lilacStrong: '#cda5ef',
  blue: '#b9d7f8',
  blueStrong: '#97c2f4',
  pink: '#f3c4dd',
  pinkStrong: '#e9a8d0',
  mint: '#c5e7dd',
  mintStrong: '#9fd6c8',
  gold: '#f3d5b2',
  text: '#fff7ff',
  textSoft: 'rgba(255, 245, 255, 0.92)',
  textMuted: 'rgba(233, 220, 242, 0.72)',
  textFaint: 'rgba(216, 203, 228, 0.54)',
  ink: '#433055',
  successBg: 'rgba(159, 214, 200, 0.16)',
  successBorder: 'rgba(159, 214, 200, 0.34)',
  warningBg: 'rgba(243, 213, 178, 0.16)',
  warningBorder: 'rgba(243, 213, 178, 0.3)',
  shadow: '#09060f',
  white: '#ffffff',
};

const LIGHT_COLORS = {
  bg: '#f7f1e8',
  bgSoft: '#fbf6ef',
  bgCard: '#fffaf4',
  bgCardAlt: '#f3eadc',
  bgGlass: 'rgba(255, 250, 244, 0.88)',
  bgGlassStrong: 'rgba(250, 243, 233, 0.96)',
  border: 'rgba(169, 150, 126, 0.16)',
  borderStrong: 'rgba(154, 135, 112, 0.26)',
  lilac: '#d5c4cf',
  lilacStrong: '#b596aa',
  blue: '#a8c9c5',
  blueStrong: '#87b0ae',
  pink: '#ebcfcf',
  pinkStrong: '#d8a8b1',
  mint: '#bbc9af',
  mintStrong: '#8ca07d',
  gold: '#c9a56b',
  text: '#5c4f44',
  textSoft: 'rgba(93, 79, 67, 0.92)',
  textMuted: 'rgba(117, 103, 90, 0.72)',
  textFaint: 'rgba(134, 120, 108, 0.54)',
  ink: '#5a4b3f',
  successBg: 'rgba(140, 160, 125, 0.16)',
  successBorder: 'rgba(140, 160, 125, 0.32)',
  warningBg: 'rgba(201, 165, 107, 0.16)',
  warningBorder: 'rgba(201, 165, 107, 0.28)',
  shadow: '#b59f8b',
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
