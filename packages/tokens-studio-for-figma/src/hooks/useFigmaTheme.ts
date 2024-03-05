import { useState, useEffect } from 'react';

export function useFigmaTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const htmlClassList = document.documentElement?.classList || [];
    const isDark = htmlClassList.contains('figma-dark');
    setIsDarkTheme(isDark);

    const observer = new MutationObserver(() => {
      const isDarkMode = htmlClassList.contains('figma-dark');
      setIsDarkTheme(isDarkMode);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return { isDarkTheme };
}
