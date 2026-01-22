import { createNecessaryVariableCollections } from './createNecessaryVariableCollections';
import { mockCreateVariableCollection, mockGetLocalVariableCollectionsAsync } from '../../tests/__mocks__/figmaMock';
import { ThemeObjectsList } from '@/types';

describe('createNecessaryVariableCollections', () => {
  const mockRenameMode = jest.fn();
  const mockAddMode = jest.fn();
  const mockExtend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  describe('extended collections', () => {
    it('creates base collection first, then extended collection using .extend()', async () => {
      const mockParentCollection = {
        id: 'Coll:parent',
        name: 'Base',
        modes: [{ modeId: 'M:parent', name: 'Light' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
        extend: mockExtend,
      };

      const mockChildCollection = {
        id: 'Coll:child',
        name: 'Brand A',
        modes: [{ modeId: 'M:child', name: 'Mode 1' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
        parentVariableCollectionId: 'Coll:parent',
      };

      mockGetLocalVariableCollectionsAsync.mockResolvedValue([]);
      mockCreateVariableCollection.mockReturnValue(mockParentCollection);
      mockExtend.mockReturnValue(mockChildCollection);

      const themes: ThemeObjectsList = [
        {
          id: 'child-theme',
          name: 'Light',
          group: 'Brand A',
          $extendsThemeId: 'parent-theme',
          selectedTokenSets: {},
        },
        {
          id: 'parent-theme',
          name: 'Light',
          group: 'Base',
          selectedTokenSets: {},
        },
      ];
      const selectedThemes = ['parent-theme', 'child-theme'];

      const updatedCollections = await createNecessaryVariableCollections(themes, selectedThemes);

      // Parent created first via createVariableCollection
      expect(mockCreateVariableCollection).toHaveBeenCalledWith('Base');
      // Child created via .extend()
      expect(mockExtend).toHaveBeenCalledWith('Brand A');
      expect(updatedCollections).toHaveLength(2);
    });

    it('stores $figmaParentCollectionId on child theme', async () => {
      const mockParentCollection = {
        id: 'Coll:parent',
        name: 'Base',
        modes: [{ modeId: 'M:parent', name: 'Light' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
        extend: mockExtend,
      };

      const mockChildCollection = {
        id: 'Coll:child',
        name: 'Brand A',
        modes: [{ modeId: 'M:child', name: 'Mode 1' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
        parentVariableCollectionId: 'Coll:parent',
      };

      mockGetLocalVariableCollectionsAsync.mockResolvedValue([]);
      mockCreateVariableCollection.mockReturnValue(mockParentCollection);
      mockExtend.mockReturnValue(mockChildCollection);

      const childTheme = {
        id: 'child-theme',
        name: 'Light',
        group: 'Brand A',
        $extendsThemeId: 'parent-theme',
        selectedTokenSets: {},
      };

      const themes: ThemeObjectsList = [
        childTheme,
        {
          id: 'parent-theme',
          name: 'Light',
          group: 'Base',
          selectedTokenSets: {},
        },
      ];
      const selectedThemes = ['parent-theme', 'child-theme'];

      await createNecessaryVariableCollections(themes, selectedThemes);

      // Child theme should have parent collection ID stored
      expect(childTheme.$figmaParentCollectionId).toBe('Coll:parent');
    });

    it('uses existing parent collection for extended theme', async () => {
      const mockParentCollection = {
        id: 'Coll:existing-parent',
        name: 'Base',
        modes: [{ modeId: 'M:parent', name: 'Light' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
        extend: mockExtend,
      };

      const mockChildCollection = {
        id: 'Coll:child',
        name: 'Brand A',
        modes: [{ modeId: 'M:child', name: 'Mode 1' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
        parentVariableCollectionId: 'Coll:existing-parent',
      };

      // Parent collection already exists in Figma
      mockGetLocalVariableCollectionsAsync.mockResolvedValue([mockParentCollection]);
      mockExtend.mockReturnValue(mockChildCollection);

      const themes: ThemeObjectsList = [
        {
          id: 'child-theme',
          name: 'Light',
          group: 'Brand A',
          $extendsThemeId: 'parent-theme',
          selectedTokenSets: {},
        },
        {
          id: 'parent-theme',
          name: 'Light',
          group: 'Base',
          $figmaCollectionId: 'Coll:existing-parent',
          selectedTokenSets: {},
        },
      ];
      const selectedThemes = ['child-theme'];

      const updatedCollections = await createNecessaryVariableCollections(themes, selectedThemes);

      // Should use .extend() on existing collection
      expect(mockExtend).toHaveBeenCalledWith('Brand A');
      // Should NOT create new collection for parent
      expect(mockCreateVariableCollection).not.toHaveBeenCalled();
      expect(updatedCollections).toHaveLength(1);
    });

    it('falls back to regular collection when .extend() is not available', async () => {
      const mockParentCollection = {
        id: 'Coll:parent',
        name: 'Base',
        modes: [{ modeId: 'M:parent', name: 'Light' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
        // No .extend() method - simulating older Figma API
      };

      const mockChildCollection = {
        id: 'Coll:child',
        name: 'Brand A',
        modes: [{ modeId: 'M:child', name: 'Mode 1' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
      };

      mockGetLocalVariableCollectionsAsync.mockResolvedValue([mockParentCollection]);
      mockCreateVariableCollection.mockReturnValue(mockChildCollection);

      const themes: ThemeObjectsList = [
        {
          id: 'child-theme',
          name: 'Light',
          group: 'Brand A',
          $extendsThemeId: 'parent-theme',
          selectedTokenSets: {},
        },
        {
          id: 'parent-theme',
          name: 'Light',
          group: 'Base',
          $figmaCollectionId: 'Coll:parent',
          selectedTokenSets: {},
        },
      ];
      const selectedThemes = ['child-theme'];

      const updatedCollections = await createNecessaryVariableCollections(themes, selectedThemes);

      // Should fall back to createVariableCollection
      expect(mockCreateVariableCollection).toHaveBeenCalledWith('Brand A');
      expect(updatedCollections).toHaveLength(1);
    });

    it('creates standalone collection when parent theme not found', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const mockChildCollection = {
        id: 'Coll:child',
        name: 'Brand A',
        modes: [{ modeId: 'M:child', name: 'Mode 1' }],
        renameMode: mockRenameMode,
        addMode: mockAddMode,
      };

      mockGetLocalVariableCollectionsAsync.mockResolvedValue([]);
      mockCreateVariableCollection.mockReturnValue(mockChildCollection);

      const themes: ThemeObjectsList = [
        {
          id: 'child-theme',
          name: 'Light',
          group: 'Brand A',
          $extendsThemeId: 'missing-parent-theme',
          selectedTokenSets: {},
        },
      ];
      const selectedThemes = ['child-theme'];

      const updatedCollections = await createNecessaryVariableCollections(themes, selectedThemes);

      // Should create regular collection as fallback
      expect(mockCreateVariableCollection).toHaveBeenCalledWith('Brand A');
      expect(updatedCollections).toHaveLength(1);

      consoleWarnSpy.mockRestore();
    });
  });
});
