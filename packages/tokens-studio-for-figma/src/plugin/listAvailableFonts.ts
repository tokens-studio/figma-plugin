let fontsPromise: Promise<Font[]> | null = null;

export function listAvailableFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = figma.listAvailableFontsAsync().then((fonts) => fonts || []).catch((error) => {
      // Do not cache a rejected promise. The next call retries.
      fontsPromise = null;
      throw error;
    });
  }
  return fontsPromise;
}

export function resetListAvailableFontsCache(): void {
  fontsPromise = null;
}
