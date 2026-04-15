const DARK_COLORS = {
  bg: '#090d18',
  bgSoft: '#11182b',
  bgCard: '#151d34',
  bgCardAlt: '#1c2642',
  bgGlass: 'rgba(17, 24, 43, 0.72)',
  bgGlassStrong: 'rgba(15, 21, 38, 0.9)',
  border: 'rgba(193, 180, 255, 0.16)',
  borderStrong: 'rgba(193, 180, 255, 0.32)',
  lilac: '#c1b4ff',
  lilacStrong: '#a78eff',
  blue: '#98ddff',
  blueStrong: '#68cfff',
  pink: '#f7b7df',
  pinkStrong: '#f08cc9',
  mint: '#9cefd1',
  mintStrong: '#6ee0b4',
  gold: '#ffdca5',
  text: '#fbf8ff',
  textSoft: 'rgba(247, 243, 255, 0.9)',
  textMuted: 'rgba(226, 220, 245, 0.68)',
  textFaint: 'rgba(214, 208, 236, 0.5)',
  ink: '#30254b',
  successBg: 'rgba(110, 224, 180, 0.14)',
  successBorder: 'rgba(110, 224, 180, 0.36)',
  warningBg: 'rgba(255, 220, 165, 0.14)',
  warningBorder: 'rgba(255, 220, 165, 0.32)',
  shadow: '#03050d',
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
