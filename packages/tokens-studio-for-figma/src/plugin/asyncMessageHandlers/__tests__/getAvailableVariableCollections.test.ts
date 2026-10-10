import { getAvailableVariableCollections } from '../getAvailableVariableCollections';

describe('getAvailableVariableCollections', () => {
  it('should return available variable collections', async () => {
    const mockCollections = [
      {
        id: 'collection1',
        name: 'Collection 1',
        modes: [
          { modeId: 'mode1', name: 'Light' },
          { modeId: 'mode2', name: 'Dark' },
        ],
      },
      {
        id: 'collection2',
        name: 'Collection 2',
        modes: [
          { modeId: 'mode3', name: 'Default' },
        ],
      },
    ];

    global.figma = {
      variables: {
        getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue(mockCollections),
      },
    } as any;

    const result = await getAvailableVariableCollections();

    expect(result).toEqual({
      collections: [
        {
          ...mockCollections[0],
          isExtension: false,
          extensionDepth: 0,
          parentCollectionId: undefined,
          modes: mockCollections[0].modes.map((mode) => ({
            ...mode,
            parentModeId: undefined,
          })),
        },
        {
          ...mockCollections[1],
          isExtension: false,
          extensionDepth: 0,
          parentCollectionId: undefined,
          modes: mockCollections[1].modes.map((mode) => ({
            ...mode,
            parentModeId: undefined,
          })),
        },
      ],
    });
  });

  it('detects extended collections via parent-linked modes when isExtension is absent', async () => {
    global.figma = {
      variables: {
        getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([
          { id: 'parent', name: 'Parent', modes: [{ modeId: 'parent-mode', name: 'Light' }] },
          {
            id: 'child',
            name: 'Child',
            parentVariableCollectionId: 'parent',
            modes: [{ modeId: 'child-mode', name: 'Light', parentModeId: 'parent-mode' }],
          },
          {
            id: 'orphan',
            name: 'Orphan',
            modes: [{ modeId: 'orphan-mode', name: 'Light', parentModeId: 'missing-mode' }],
          },
        ]),
      },
    } as any;

    const { collections } = await getAvailableVariableCollections();

    expect(collections.map(({ id, isExtension, extensionDepth }) => ({ id, isExtension, extensionDepth }))).toEqual([
      { id: 'parent', isExtension: false, extensionDepth: 0 },
      { id: 'child', isExtension: true, extensionDepth: 1 },
      { id: 'orphan', isExtension: true, extensionDepth: 1 },
    ]);
    expect(collections[1].parentCollectionId).toBe('parent');
  });

  it('should return empty array if error occurs', async () => {
    global.figma = {
      variables: {
        getLocalVariableCollectionsAsync: jest.fn().mockRejectedValue(new Error('Failed')),
      },
    } as any;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await getAvailableVariableCollections();

    expect(result).toEqual({
      collections: [],
    });
    expect(consoleSpy).toHaveBeenCalledWith('Error getting variable collections:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
