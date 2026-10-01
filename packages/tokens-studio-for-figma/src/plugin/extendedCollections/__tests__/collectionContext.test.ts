import { resolveCollectionContext } from '../collectionContext';

describe('resolveCollectionContext', () => {
  const regularCollection = {
    id: 'coll-1',
    modes: [{ modeId: 'mode-1', name: 'Light' }],
  } as unknown as VariableCollection;

  const extendedCollection = {
    id: 'child-coll',
    isExtension: true,
    modes: [{ modeId: 'child-mode', name: 'Light', parentModeId: 'parent-mode' }],
  } as unknown as VariableCollection;

  // Existing extended collection loaded from getLocalVariableCollectionsAsync
  // may not expose the isExtension runtime property
  const extendedCollectionWithoutFlag = {
    id: 'child-coll',
    modes: [{ modeId: 'child-mode', name: 'Light', parentModeId: 'parent-mode' }],
  } as unknown as VariableCollection;

  it('detects regular collections', () => {
    expect(resolveCollectionContext(regularCollection, 'mode-1')).toEqual({
      isExtended: false,
      parentModeId: undefined,
    });
  });

  it('detects extended collections via isExtension property', () => {
    expect(resolveCollectionContext(extendedCollection, 'child-mode')).toEqual({
      isExtended: true,
      parentModeId: 'parent-mode',
    });
  });

  it('detects extended collections structurally via parentModeId when isExtension is absent', () => {
    expect(resolveCollectionContext(extendedCollectionWithoutFlag, 'child-mode')).toEqual({
      isExtended: true,
      parentModeId: 'parent-mode',
    });
  });

  it('detects extended collections via theme metadata even without mode match', () => {
    const result = resolveCollectionContext(regularCollection, 'unknown-mode', { $figmaIsExtension: true });
    expect(result.isExtended).toBe(true);
    expect(result.parentModeId).toBeUndefined();
  });

  it('handles null collection', () => {
    expect(resolveCollectionContext(null, 'mode-1')).toEqual({
      isExtended: false,
      parentModeId: undefined,
    });
  });

  it('does not mark regular collection as extended when theme flag is false', () => {
    const result = resolveCollectionContext(regularCollection, 'mode-1', { $figmaIsExtension: false });
    expect(result.isExtended).toBe(false);
  });
});
