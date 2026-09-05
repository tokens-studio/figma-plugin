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

  return { isExtended, parentModeId };
}
