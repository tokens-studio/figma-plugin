const fontLoads = new Map<string, Promise<void>>();

export function loadFontOnce(font: FontName): Promise<void> {
  const key = JSON.stringify([font.family, font.style]);
  let loading = fontLoads.get(key);
  if (!loading) {
    loading = Promise.resolve()
      .then(() => figma.loadFontAsync(font))
      .catch((error) => {
        if (fontLoads.get(key) === loading) fontLoads.delete(key);
        throw error;
      });
    fontLoads.set(key, loading);
  }
  return loading;
}

export function clearFontLoadCache() {
  fontLoads.clear();
}
