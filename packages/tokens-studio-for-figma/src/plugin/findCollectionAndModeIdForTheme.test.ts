import { findCollectionAndModeIdForTheme } from './findCollectionAndModeIdForTheme';

describe('findCollectionAndModeIdForTheme', () => {
  it('should return collection and modeId if collection exists and mode exists with that name', () => {
    const mockCollection = {
      name: 'Core',
      modes: [{ modeId: 'M:123', name: 'Default' }],
    };
    const allCollections = [mockCollection];
    const { collection, modeId } = findCollectionAndModeIdForTheme('Core', 'Default', allCollections);
    expect(collection).toEqual(mockCollection);
    expect(modeId).toEqual('M:123');
  });

  it('returns undefined if collection does not exist', () => {
    const allCollections = [];
    const { collection, modeId } = findCollectionAndModeIdForTheme('Core', 'Default', allCollections);
    expect(collection).toBeUndefined();
    expect(modeId).toBeUndefined();
  });

  it('returns undefined modeId if mode does not exist', () => {
    const mockCollection = {
      name: 'Core',
      modes: [{ modeId: 'M:123', name: 'Default' }],
    };
    const allCollections = [mockCollection];
    const { collection, modeId } = findCollectionAndModeIdForTheme('Core', 'Dark', allCollections);
    expect(collection).toEqual(mockCollection);
    expect(modeId).toBeUndefined();
  });
});
