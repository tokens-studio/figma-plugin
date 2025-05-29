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
      collections: mockCollections,
    });
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
