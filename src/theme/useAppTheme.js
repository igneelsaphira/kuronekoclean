import { useMemo } from 'react';
import { useCat } from '../context/CatContext';
import { getThemeColors } from './tokens';

export function useAppTheme() {
  const { settings, updateSettingValue } = useCat();
  const themeMode = settings?.themeMode || 'dark';
  const colors = useMemo(() => getThemeColors(themeMode), [themeMode]);

  const setThemeMode = (mode) => updateSettingValue?.('themeMode', mode);
  const toggleThemeMode = () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark');

  return {
    colors,
    themeMode,
    setThemeMode,
    toggleThemeMode,
  };
}
