import { useState, useEffect } from 'react';

export function useFigmaTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const htmlClassList = document.documentElement?.classList || [];
    const isDark = htmlClassList.contains('figma-dark');
    setIsDarkTheme(isDark);
  }, []);

  return { isDarkTheme };
}
