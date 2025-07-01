import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFigmaTheme } from './useFigmaTheme';
import { themePreferenceSelector } from '@/selectors';

export function useEffectiveTheme() {
  const { isDarkTheme: figmaIsDark } = useFigmaTheme();
  const themePreference = useSelector(themePreferenceSelector);

  const isDarkTheme = useMemo(() => {
    switch (themePreference) {
      case 'light':
        return false;
      case 'dark':
        return true;
      case 'auto':
      default:
        return figmaIsDark;
    }
  }, [themePreference, figmaIsDark]);

  return { isDarkTheme, themePreference };
}
