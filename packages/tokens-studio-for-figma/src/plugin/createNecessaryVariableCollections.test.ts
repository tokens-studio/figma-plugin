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
    const updatedCollections = await createNecessaryVariableCollections(themes, selectedThemes);
    expect(updatedCollections).toHaveLength(1);
    expect(mockRenameMode).toHaveBeenCalledWith('M:123', 'Core');
  });

  it('updates existing collection if theme group is passed and that is a match', async () => {
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([
      { name: 'Core', modes: [{ modeId: 'M:123', name: 'Default' }], renameMode: mockRenameMode },
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
        $figmaCollectionId: 'Coll:124',
        $figmaModeId: 'M:124',
        selectedTokenSets: {},
      },
      {
        id: 'C:125',
        name: 'Dark',
        group: 'Mode',
        $figmaCollectionId: 'Coll:125',
        $figmaModeId: 'M:125',
        selectedTokenSets: {},
      },
    ];
    const selectedThemes = ['C:124', 'C:125'];
    const updatedCollections = await createNecessaryVariableCollections(themes, selectedThemes);
    expect(updatedCollections).toHaveLength(2);
    expect(mockAddMode).toHaveBeenCalledWith('Dark');
  });

  it('creates new mode if found collection, but mode didnt exist', async () => {
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([
      {
        name: 'Mode', modes: [{ modeId: 'M:123', name: 'Default' }], addMode: mockAddMode, renameMode: mockRenameMode,
      },
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
      {
        name: 'Mode', modes: [{ modeId: 'M:123', name: 'Light' }], addMode: mockAddMode, renameMode: mockRenameMode,
      },
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

  it('renames existing collection if id is a match but name is not', async () => {
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([
      {
        name: 'OldCollectionName', id: 'Coll:124', modes: [{ modeId: 'M:123', name: 'Light' }], addMode: mockAddMode, renameMode: mockRenameMode,
      },
    ]);

    const themes: ThemeObjectsList = [
      {
        id: 'C:124',
        name: 'Light',
        group: 'NewCollectionName',
        $figmaCollectionId: 'Coll:124',
        selectedTokenSets: {},
      },
    ];
    const selectedThemes = ['C:124'];
    const updatedCollections = await createNecessaryVariableCollections(themes, selectedThemes);
    expect(updatedCollections[0].name).toBe('NewCollectionName');
  });

  it('renames existing mode if id is a match but name isnt', async () => {
    mockGetLocalVariableCollectionsAsync.mockResolvedValue([
      {
        name: 'Collection', id: 'Coll:124', modes: [{ modeId: 'M:123', name: 'OldModeName' }], addMode: mockAddMode, renameMode: mockRenameMode,
      },
    ]);

    const themes: ThemeObjectsList = [
      {
        id: 'C:124',
        name: 'NewModeName',
        group: 'Collection',
        $figmaModeId: 'M:123',
        selectedTokenSets: {},
      },
    ];
    const selectedThemes = ['C:124'];
    await createNecessaryVariableCollections(themes, selectedThemes);
    expect(mockRenameMode).toHaveBeenCalledWith('M:123', 'NewModeName');
  });
});
