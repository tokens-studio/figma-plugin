const getPreferredColorScheme = () => {
  if (window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

export const setFigmaBrowserTheme = (theme, updateHash) => {
  const htmlClassList = document.documentElement?.classList || [];
  const isDark = htmlClassList.contains('figma-dark');

  switch (theme) {
    case 'light': {
      if (isDark) {
        htmlClassList.remove('figma-dark');
      }

      break;
    }
    case 'dark': {
      if (!isDark) {
        htmlClassList.add('figma-dark');
      }

      break;
    }
    case 'system': {
      const systemTheme = getPreferredColorScheme();
      if (systemTheme === 'dark' && !isDark) {
        htmlClassList.add('figma-dark');
      } else if (systemTheme === 'light' && isDark) {
        htmlClassList.remove('figma-dark');
      }
      break;
    }
    default: {
      break;
    }
  }
  if (updateHash) {
    updateHash({ theme });
  }
};
