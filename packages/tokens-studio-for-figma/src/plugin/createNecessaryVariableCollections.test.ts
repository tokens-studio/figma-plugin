import { createNecessaryVariableCollections } from './createNecessaryVariableCollections';
import { mockCreateVariableCollection, mockGetLocalVariableCollectionsAsync } from '../../tests/__mocks__/figmaMock';
import { ThemeObjectsList } from '@/types';

describe('createNecessaryVariableCollections', () => {
  const mockRenameMode = jest.fn();
  const mockAddMode = jest.fn();

  it('should create new collection if doesnt exist', async () => {
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([]);
    mockCreateVariableCollection.mockReturnValue({
      renameMode: mockRenameMode,
      addMode: mockAddMode,
      modes: [{ modeId: 'M:123', name: 'Default' }],
      name: 'Core',
    });
    const themes: ThemeObjectsList = [
      {
        id: 'C:123',
        name: 'Core',
        selectedTokenSets: {},
      },
    ];
    const selectedThemes = ['C:123'];
    const createdCollections = await createNecessaryVariableCollections(themes, selectedThemes);
    expect(createdCollections).toHaveLength(1);
    expect(mockRenameMode).toHaveBeenCalledWith('M:123', 'Core');
  });

  it('updates existing collection if theme group is passed and that is a match', async () => {
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([
      { name: 'Core', modes: [{ modeId: 'M:123', name: 'Default' }] },
    ]);

    mockCreateVariableCollection.mockReturnValue({
      renameMode: mockRenameMode,
      addMode: mockAddMode,
      modes: [{ modeId: 'M:123', name: 'Default' }],
      name: 'Mode',
    });
    const themes: ThemeObjectsList = [
      {
        id: 'C:124',
        name: 'Light',
        group: 'Mode',
        selectedTokenSets: {},
      },
      {
        id: 'C:125',
        name: 'Dark',
        group: 'Mode',
        selectedTokenSets: {},
      },
    ];
    const selectedThemes = ['C:124', 'C:125'];
    const createdCollections = await createNecessaryVariableCollections(themes, selectedThemes);
    expect(createdCollections).toHaveLength(1);
    expect(mockAddMode).toHaveBeenCalledWith('Dark');
  });

  it('creates new mode if found collection, but mode didnt exist', async () => {
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([
      { name: 'Mode', modes: [{ modeId: 'M:123', name: 'Default' }], addMode: mockAddMode },
    ]);

    const themes: ThemeObjectsList = [
      {
        id: 'C:124',
        name: 'Light',
        group: 'Mode',
        selectedTokenSets: {},
      },
    ];
    const selectedThemes = ['C:124'];
    await createNecessaryVariableCollections(themes, selectedThemes);
    expect(mockAddMode).toHaveBeenCalledWith('Light');
  });

  it('does not call addMode if a mode matches name of theme', async () => {
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([
      { name: 'Mode', modes: [{ modeId: 'M:123', name: 'Light' }], addMode: mockAddMode },
    ]);

    const themes: ThemeObjectsList = [
      {
        id: 'C:124',
        name: 'Light',
        group: 'Mode',
        selectedTokenSets: {},
      },
    ];
    const selectedThemes = ['C:124'];
    await createNecessaryVariableCollections(themes, selectedThemes);
    expect(mockAddMode).not.toHaveBeenCalled();
  });
});
