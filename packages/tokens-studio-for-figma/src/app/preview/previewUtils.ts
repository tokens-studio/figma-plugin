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
        document.documentElement.classList.remove('figma-dark');
      }

      break;
    }
    case 'dark': {
      if (!isDark) {
        document.documentElement.classList.add('figma-dark');
      }

      break;
    }
    case 'system': {
      const systemTheme = getPreferredColorScheme();
      if (systemTheme === 'dark' && !isDark) {
        document.documentElement.classList.add('figma-dark');
      } else if (systemTheme === 'light' && isDark) {
        document.documentElement.classList.remove('figma-dark');
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
