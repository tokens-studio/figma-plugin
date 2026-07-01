import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const checkFigmaEnterprise: AsyncMessageChannelHandlers[AsyncMessageTypes.CHECK_FIGMA_ENTERPRISE] = async (): Promise<{
  isFigmaEnterprise: boolean;
}> => {
  // Detect Enterprise by attempting .extend() — the only reliable signal.
  // .extend() is Enterprise-only; .isExtension exists on all plans.
  const probe = figma.variables.createVariableCollection('__ts_probe__');
  try {
    const extended = await (probe as any).extend('__ts_ext_probe__');
    if (extended && typeof extended.remove === 'function') extended.remove();
    return { isFigmaEnterprise: true };
  } catch {
    return { isFigmaEnterprise: false };
  } finally {
    try { probe.remove(); } catch { /* ignore */ }
  }
};
