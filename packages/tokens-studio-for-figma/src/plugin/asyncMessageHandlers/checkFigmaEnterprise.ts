import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

// The probe result cannot change within a plugin session (a file does not move
// between plans while open), so cache it module-level. This also stops the
// probe from mutating the document (create/extend/remove collections) on every
// modal open — that dirtied the file, polluted undo/version history, and
// flashed phantom collections to multiplayer collaborators.
let cachedResult: boolean | null = null;

export const checkFigmaEnterprise: AsyncMessageChannelHandlers[AsyncMessageTypes.CHECK_FIGMA_ENTERPRISE] = async (): Promise<{
  isFigmaEnterprise: boolean;
}> => {
  if (cachedResult !== null) {
    return { isFigmaEnterprise: cachedResult };
  }

  // Prefer a non-mutating signal: any existing extended collection proves the
  // file is on a plan that supports extension.
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    if (collections.some((c) => (c as any).isExtension)) {
      cachedResult = true;
      return { isFigmaEnterprise: true };
    }
  } catch {
    // fall through to the probe
  }

  // Detect Enterprise by attempting .extend() — the only reliable signal.
  // .extend() is Enterprise-only; .isExtension exists on all plans.
  // createVariableCollection must be inside the try: it throws in view-only
  // contexts or at plan limits, and that must resolve to `false`, not reject
  // (callers treat a rejection as non-Enterprise but the thrown error would
  // otherwise skip the cache and re-probe forever).
  let probe: VariableCollection | undefined;
  try {
    probe = figma.variables.createVariableCollection('__ts_probe__');
    const extended = await (probe as any).extend('__ts_ext_probe__');
    if (extended && typeof extended.remove === 'function') extended.remove();
    cachedResult = true;
    return { isFigmaEnterprise: true };
  } catch {
    cachedResult = false;
    return { isFigmaEnterprise: false };
  } finally {
    try { probe?.remove(); } catch { /* ignore */ }
  }
};

// Exposed for tests only
export function resetFigmaEnterpriseCache() {
  cachedResult = null;
}
