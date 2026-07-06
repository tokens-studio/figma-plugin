import { ThemeObject } from '@/types';

export type CollectionContext = {
  isExtended: boolean;
  parentModeId?: string;
};

/**
 * Single source of truth for "is this an extended (child) collection mode?".
 *
 * Detection order (most to least reliable):
 * 1. theme.$figmaIsExtension — persisted plugin metadata, survives re-exports
 * 2. collection.isExtension — Figma runtime property, only guaranteed on
 *    collections freshly returned by parentCollection.extend()
 * 3. structural — the mode carries a parentModeId, which only exists on
 *    extended collection modes
 *
 * The parentModeId is resolved from the collection's mode entry for the given
 * mode ID; it is required for any inherit-vs-override decision.
 */
export function resolveCollectionContext(
  collection: VariableCollection | null | undefined,
  modeId: string,
  theme?: Pick<ThemeObject, '$figmaIsExtension'>,
): CollectionContext {
  const modeObj = collection?.modes?.find((m) => m.modeId === modeId);
  const parentModeId = (modeObj as any)?.parentModeId as string | undefined;

  const isExtended = Boolean(
    theme?.$figmaIsExtension
    || (collection && 'isExtension' in collection && (collection as any).isExtension)
    || parentModeId !== undefined,
  );

  // Failure signature: we believe this is an extended collection, but we cannot
  // resolve a parentModeId for the given mode. Every value write then falls
  // through to an explicit setValueForMode (blue override) instead of the
  // inherit-vs-override diff. Log the mismatch so the mode-ID form can be checked.
  if (isExtended && parentModeId === undefined) {
    // eslint-disable-next-line no-console
    console.warn(
      `[resolveCollectionContext] EXTENDED but NO parentModeId for mode "${modeId}"`,
      `\n  collection: ${collection?.name} (id: ${collection?.id})`,
      `\n  isExtension prop: ${collection ? (collection as any).isExtension : 'n/a'}, theme.$figmaIsExtension: ${theme?.$figmaIsExtension}`,
      `\n  available modes: ${JSON.stringify(collection?.modes?.map((m) => ({ modeId: m.modeId, parentModeId: (m as any).parentModeId })))}`,
    );
  }

  return { isExtended, parentModeId };
}
