import { getAvailableVariableCollections } from '../getAvailableVariableCollections';

describe('getAvailableVariableCollections', () => {
  it('should return available variable collections with extended collection info', async () => {
    const mockCollections = [
      {
        id: 'collection1',
        name: 'Base Collection',
        modes: [
          { modeId: 'mode1', name: 'Light' },
          { modeId: 'mode2', name: 'Dark' },
        ],
        parentVariableCollectionId: undefined,
        variableIds: ['var1', 'var2'],
      },
      {
        id: 'collection2',
        name: 'Brand A Collection',
        modes: [
          { modeId: 'mode3', name: 'Light' },
        ],
        parentVariableCollectionId: 'collection1',
        variableIds: ['var1', 'var2', 'var3'],
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
          id: 'collection1',
          name: 'Base Collection',
          modes: [
            { modeId: 'mode1', name: 'Light' },
            { modeId: 'mode2', name: 'Dark' },
          ],
          parentCollectionId: undefined,
          isExtended: false,
        },
        {
          id: 'collection2',
          name: 'Brand A Collection',
          modes: [
            { modeId: 'mode3', name: 'Light' },
          ],
          parentCollectionId: 'collection1',
          isExtended: true,
        },
      ],
    });
  });

  it('should handle collections without names', async () => {
    const mockCollections = [
      {
        id: 'collection1',
        name: '',
        modes: [
          { modeId: 'mode1', name: 'Default' },
        ],
        parentVariableCollectionId: undefined,
        variableIds: [],
      },
    ];

    global.figma = {
      variables: {
        getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue(mockCollections),
      },
    } as any;

    const result = await getAvailableVariableCollections();

    expect(result.collections[0].name).toBe('Collection collecti');
    expect(result.collections[0].isExtended).toBe(false);
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
