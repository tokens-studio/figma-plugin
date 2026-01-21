import { UpdateMode } from '@/constants/UpdateMode';
import { swapFigmaModes } from '../swapFigmaModes';
import * as notifiers from '../../notifiers';

// Mock notifiers
jest.mock('../../notifiers', () => ({
  notifyUI: jest.fn(),
  notifyException: jest.fn(),
}));

// Mock figma API
const mockSetExplicitVariableModeForCollection = jest.fn();
const mockGetVariableCollectionByIdAsync = jest.fn();

const mockCurrentPage = {
  name: 'Page 1',
  type: 'PAGE',
  setExplicitVariableModeForCollection: mockSetExplicitVariableModeForCollection,
  selection: [
    { name: 'Selected Frame', type: 'FRAME', setExplicitVariableModeForCollection: mockSetExplicitVariableModeForCollection },
  ],
};

const mockPage2 = {
  name: 'Page 2',
  type: 'PAGE',
  setExplicitVariableModeForCollection: mockSetExplicitVariableModeForCollection,
};

const mockRoot = {
  children: [mockCurrentPage, mockPage2],
};

global.figma = {
  currentPage: mockCurrentPage,
  root: mockRoot,
  variables: {
    getVariableCollectionByIdAsync: mockGetVariableCollectionByIdAsync,
  },
} as any;

describe('swapFigmaModes', () => {
  beforeEach(() => {
    mockSetExplicitVariableModeForCollection.mockClear();
    mockGetVariableCollectionByIdAsync.mockClear();
    jest.clearAllMocks();
  });

  const activeTheme = { 'no-group': 'dark' };
  const themes = [
    {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {},
      $figmaCollectionId: 'collection-123',
      $figmaModeId: 'mode-456',
    },
    {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaCollectionId: 'collection-123',
      $figmaModeId: 'mode-789',
    },
  ];

  const mockCollection = {
    id: 'collection-123',
    name: 'My Collection',
    modes: [
      { modeId: 'mode-456', name: 'Dark' },
      { modeId: 'mode-789', name: 'Light' },
    ],
  };

  it('should set variable mode for PAGE update mode on the page itself', async () => {
    mockGetVariableCollectionByIdAsync.mockResolvedValue(mockCollection);

    await swapFigmaModes(activeTheme, themes, UpdateMode.PAGE);

    // Should only call once for the page itself, not its children
    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(1);
    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockCollection, 'mode-456');
    expect(notifiers.notifyUI).not.toHaveBeenCalled();
  });

  it('should set variable mode for SELECTION update mode', async () => {
    mockGetVariableCollectionByIdAsync.mockResolvedValue(mockCollection);

    await swapFigmaModes(activeTheme, themes, UpdateMode.SELECTION);

    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(1);
    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockCollection, 'mode-456');
    expect(notifiers.notifyUI).not.toHaveBeenCalled();
  });

  it('should set variable mode for DOCUMENT update mode on all pages', async () => {
    mockGetVariableCollectionByIdAsync.mockResolvedValue(mockCollection);

    await swapFigmaModes(activeTheme, themes, UpdateMode.DOCUMENT);

    // Should call once for each page (2 pages)
    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(2);
    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockCollection, 'mode-456');
    expect(notifiers.notifyUI).not.toHaveBeenCalled();
  });

  it('should handle theme without Figma collection/mode info', async () => {
    const themesWithoutFigmaInfo = [
      {
        id: 'incomplete',
        name: 'Incomplete',
        selectedTokenSets: {},
        // Missing $figmaCollectionId and $figmaModeId
      },
    ];
    const activeThemeIncomplete = { 'no-group': 'incomplete' };

    await swapFigmaModes(activeThemeIncomplete, themesWithoutFigmaInfo, UpdateMode.PAGE);

    expect(mockSetExplicitVariableModeForCollection).not.toHaveBeenCalled();
  });

  it('should handle missing active theme', async () => {
    const activeThemeNonExistent = { 'no-group': 'nonexistent' };

    await swapFigmaModes(activeThemeNonExistent, themes, UpdateMode.PAGE);

    expect(mockSetExplicitVariableModeForCollection).not.toHaveBeenCalled();
  });

  it('should notify and return early when collection does not exist', async () => {
    mockGetVariableCollectionByIdAsync.mockResolvedValue(null);

    // Mock teamLibrary to return empty array (no remote collections)
    (global.figma as any).teamLibrary = {
      getAvailableLibraryVariableCollectionsAsync: jest.fn().mockResolvedValue([]),
    };

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    await swapFigmaModes(activeTheme, themes, UpdateMode.PAGE);

    expect(notifiers.notifyUI).toHaveBeenCalledWith(
      'One of the variable collections linked to this theme no longer exists',
      { error: true },
    );
    expect(mockSetExplicitVariableModeForCollection).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('not found in local file or remote libraries'),
    );

    consoleSpy.mockRestore();
  });

  it('should notify and return early when mode does not exist in collection', async () => {
    const collectionWithoutMode = {
      ...mockCollection,
      modes: [
        { modeId: 'mode-789', name: 'Light' }, // Only has Light mode, not Dark
      ],
    };
    mockGetVariableCollectionByIdAsync.mockResolvedValue(collectionWithoutMode);
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    await swapFigmaModes(activeTheme, themes, UpdateMode.PAGE);

    expect(notifiers.notifyUI).toHaveBeenCalledWith(
      'One of the modes linked to this theme no longer exists in collection "My Collection"',
      { error: true },
    );
    expect(mockSetExplicitVariableModeForCollection).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Mode mode-456 no longer exists in collection My Collection'),
    );

    consoleSpy.mockRestore();
  });

  it('should send Sentry exception for unexpected errors', async () => {
    mockGetVariableCollectionByIdAsync.mockResolvedValue(mockCollection);
    mockSetExplicitVariableModeForCollection.mockImplementation(() => {
      throw new Error('Unexpected mock error');
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    await swapFigmaModes(activeTheme, themes, UpdateMode.PAGE);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to set variable mode for node'),
      expect.any(Error),
    );

    expect(notifiers.notifyException).toHaveBeenCalledWith(
      'Unexpected error in swapFigmaModes for node Page 1: Unexpected mock error',
      {
        collectionId: 'collection-123',
        modeId: 'mode-456',
        nodeType: 'PAGE',
      },
    );

    consoleSpy.mockRestore();
  });

  describe('multi-dimensional themes', () => {
    const mockBrandCollection = {
      id: 'collection-brand',
      name: 'Brand Collection',
      modes: [
        { modeId: 'mode-acme', name: 'Acme' },
        { modeId: 'mode-techco', name: 'TechCo' },
      ],
    };

    const mockModeCollection = {
      id: 'collection-mode',
      name: 'Mode Collection',
      modes: [
        { modeId: 'mode-light', name: 'Light' },
        { modeId: 'mode-dark', name: 'Dark' },
      ],
    };

    const multiDimensionalThemes = [
      {
        id: 'acme-dark',
        name: 'Acme Dark',
        selectedTokenSets: {},
        group: 'brand',
        $figmaCollectionId: 'collection-brand',
        $figmaModeId: 'mode-acme',
      },
      {
        id: 'dark-mode',
        name: 'Dark Mode',
        selectedTokenSets: {},
        group: 'mode',
        $figmaCollectionId: 'collection-mode',
        $figmaModeId: 'mode-dark',
      },
      {
        id: 'techco-light',
        name: 'TechCo Light',
        selectedTokenSets: {},
        group: 'brand',
        $figmaCollectionId: 'collection-brand',
        $figmaModeId: 'mode-techco',
      },
      {
        id: 'light-mode',
        name: 'Light Mode',
        selectedTokenSets: {},
        group: 'mode',
        $figmaCollectionId: 'collection-mode',
        $figmaModeId: 'mode-light',
      },
    ];

    it('should apply all dimensions of a multi-dimensional theme', async () => {
      const multiDimensionalActiveTheme = {
        brand: 'acme-dark',
        mode: 'dark-mode',
      };

      mockGetVariableCollectionByIdAsync.mockImplementation(async (id: string) => {
        if (id === 'collection-brand') return mockBrandCollection;
        if (id === 'collection-mode') return mockModeCollection;
        return null;
      });

      await swapFigmaModes(multiDimensionalActiveTheme, multiDimensionalThemes, UpdateMode.PAGE);

      // Should call twice: once for brand collection, once for mode collection
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(2);
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockBrandCollection, 'mode-acme');
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockModeCollection, 'mode-dark');
      expect(notifiers.notifyUI).not.toHaveBeenCalled();
    });

    it('should apply all dimensions across multiple nodes in DOCUMENT mode', async () => {
      const multiDimensionalActiveTheme = {
        brand: 'techco-light',
        mode: 'light-mode',
      };

      mockGetVariableCollectionByIdAsync.mockImplementation(async (id: string) => {
        if (id === 'collection-brand') return mockBrandCollection;
        if (id === 'collection-mode') return mockModeCollection;
        return null;
      });

      await swapFigmaModes(multiDimensionalActiveTheme, multiDimensionalThemes, UpdateMode.DOCUMENT);

      // Should call 4 times: 2 collections × 2 pages
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(4);
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockBrandCollection, 'mode-techco');
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockModeCollection, 'mode-light');
      expect(notifiers.notifyUI).not.toHaveBeenCalled();
    });

    it('should skip invalid dimensions but still apply valid ones', async () => {
      const multiDimensionalActiveTheme = {
        brand: 'acme-dark',
        mode: 'dark-mode',
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Brand collection exists, but mode collection doesn't
      mockGetVariableCollectionByIdAsync.mockImplementation(async (id: string) => {
        if (id === 'collection-brand') return mockBrandCollection;
        return null; // Mode collection doesn't exist
      });

      // Mock teamLibrary to return empty array (no remote collections)
      (global.figma as any).teamLibrary = {
        getAvailableLibraryVariableCollectionsAsync: jest.fn().mockResolvedValue([]),
      };

      await swapFigmaModes(multiDimensionalActiveTheme, multiDimensionalThemes, UpdateMode.PAGE);

      // Should still call once for the valid brand collection
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(1);
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockBrandCollection, 'mode-acme');

      // Should notify about the missing collection
      expect(notifiers.notifyUI).toHaveBeenCalledWith(
        'One of the variable collections linked to this theme no longer exists',
        { error: true },
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not found in local file or remote libraries'),
      );

      consoleSpy.mockRestore();
    });

    it('should skip dimensions with missing modes but still apply valid ones', async () => {
      const multiDimensionalActiveTheme = {
        brand: 'acme-dark',
        mode: 'dark-mode',
      };

      const collectionWithMissingMode = {
        ...mockModeCollection,
        modes: [
          { modeId: 'mode-light', name: 'Light' }, // Only has Light mode, Dark is missing
        ],
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockGetVariableCollectionByIdAsync.mockImplementation(async (id: string) => {
        if (id === 'collection-brand') return mockBrandCollection;
        if (id === 'collection-mode') return collectionWithMissingMode;
        return null;
      });

      await swapFigmaModes(multiDimensionalActiveTheme, multiDimensionalThemes, UpdateMode.PAGE);

      // Should still call once for the valid brand collection
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(1);
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockBrandCollection, 'mode-acme');

      // Should notify about the missing mode
      expect(notifiers.notifyUI).toHaveBeenCalledWith(
        'One of the modes linked to this theme no longer exists in collection "Mode Collection"',
        { error: true },
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mode mode-dark no longer exists in collection Mode Collection'),
      );

      consoleSpy.mockRestore();
    });

    it('should handle multi-dimensional theme with some dimensions missing Figma metadata', async () => {
      const themesWithPartialMetadata = [
        {
          id: 'acme-dark',
          name: 'Acme Dark',
          selectedTokenSets: {},
          group: 'brand',
          $figmaCollectionId: 'collection-brand',
          $figmaModeId: 'mode-acme',
        },
        {
          id: 'dark-mode',
          name: 'Dark Mode',
          selectedTokenSets: {},
          group: 'mode',
          // Missing $figmaCollectionId and $figmaModeId
        },
      ];

      const multiDimensionalActiveTheme = {
        brand: 'acme-dark',
        mode: 'dark-mode',
      };

      mockGetVariableCollectionByIdAsync.mockResolvedValue(mockBrandCollection);

      await swapFigmaModes(multiDimensionalActiveTheme, themesWithPartialMetadata, UpdateMode.PAGE);

      // Should only call once for the dimension with metadata
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(1);
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(mockBrandCollection, 'mode-acme');
      expect(notifiers.notifyUI).not.toHaveBeenCalled();
    });

    it('should return early if all dimensions lack Figma metadata', async () => {
      const themesWithoutMetadata = [
        {
          id: 'acme-dark',
          name: 'Acme Dark',
          selectedTokenSets: {},
          group: 'brand',
          // Missing $figmaCollectionId and $figmaModeId
        },
        {
          id: 'dark-mode',
          name: 'Dark Mode',
          selectedTokenSets: {},
          group: 'mode',
          // Missing $figmaCollectionId and $figmaModeId
        },
      ];

      const multiDimensionalActiveTheme = {
        brand: 'acme-dark',
        mode: 'dark-mode',
      };

      await swapFigmaModes(multiDimensionalActiveTheme, themesWithoutMetadata, UpdateMode.PAGE);

      expect(mockSetExplicitVariableModeForCollection).not.toHaveBeenCalled();
      expect(mockGetVariableCollectionByIdAsync).not.toHaveBeenCalled();
    });
  });

  describe('remote/external library collections', () => {
    const mockImportVariableByKeyAsync = jest.fn();
    const mockGetAvailableLibraryVariableCollectionsAsync = jest.fn();
    const mockGetVariablesInLibraryCollectionAsync = jest.fn();

    beforeEach(() => {
      // Add team library methods to figma mock
      (global.figma as any).teamLibrary = {
        getAvailableLibraryVariableCollectionsAsync: mockGetAvailableLibraryVariableCollectionsAsync,
        getVariablesInLibraryCollectionAsync: mockGetVariablesInLibraryCollectionAsync,
      };
      (global.figma as any).variables.importVariableByKeyAsync = mockImportVariableByKeyAsync;

      mockImportVariableByKeyAsync.mockClear();
      mockGetAvailableLibraryVariableCollectionsAsync.mockClear();
      mockGetVariablesInLibraryCollectionAsync.mockClear();
    });

    const remoteCollection = {
      id: 'remote-collection-123',
      name: 'Remote Collection',
      modes: [
        { modeId: 'remote-mode-dark', name: 'Dark' },
        { modeId: 'remote-mode-light', name: 'Light' },
      ],
    };

    it('should import and use remote variable collection when local collection not found', async () => {
      const remoteTheme = {
        id: 'remote-dark',
        name: 'Remote Dark',
        selectedTokenSets: {},
        $figmaCollectionId: 'remote-collection-123',
        $figmaModeId: 'remote-mode-dark',
      };
      const remoteActiveTheme = { 'no-group': 'remote-dark' };

      // First call returns null (not found locally)
      // Second call (after import) returns the collection
      mockGetVariableCollectionByIdAsync
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(remoteCollection);

      mockGetAvailableLibraryVariableCollectionsAsync.mockResolvedValue([
        { key: 'lib-collection-key-1', name: 'Remote Collection' },
      ]);

      mockGetVariablesInLibraryCollectionAsync.mockResolvedValue([
        { key: 'var-key-1', name: 'color/primary' },
        { key: 'var-key-2', name: 'color/secondary' },
      ]);

      mockImportVariableByKeyAsync.mockResolvedValue({
        key: 'var-key-1',
        variableCollectionId: 'remote-collection-123',
      });

      await swapFigmaModes(remoteActiveTheme, [remoteTheme], UpdateMode.PAGE);

      // Should attempt to import the remote collection
      expect(mockGetAvailableLibraryVariableCollectionsAsync).toHaveBeenCalled();
      expect(mockGetVariablesInLibraryCollectionAsync).toHaveBeenCalledWith('lib-collection-key-1');
      expect(mockImportVariableByKeyAsync).toHaveBeenCalledWith('var-key-1');

      // Should successfully set the mode
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(remoteCollection, 'remote-mode-dark');
      expect(notifiers.notifyUI).not.toHaveBeenCalled();
    });

    it('should use cached remote collection on subsequent calls', async () => {
      const remoteTheme = {
        id: 'remote-dark',
        name: 'Remote Dark',
        selectedTokenSets: {},
        $figmaCollectionId: 'remote-collection-456',
        $figmaModeId: 'remote-mode-dark',
      };
      const remoteActiveTheme = { 'no-group': 'remote-dark' };

      const cachedCollection = {
        id: 'remote-collection-456',
        name: 'Cached Remote Collection',
        modes: [{ modeId: 'remote-mode-dark', name: 'Dark' }],
      };

      // Setup: First call to populate cache
      mockGetVariableCollectionByIdAsync
        .mockResolvedValueOnce(null) // Not found locally
        .mockResolvedValueOnce(cachedCollection) // After import
        .mockResolvedValueOnce(null); // Second invocation - still not local

      mockGetAvailableLibraryVariableCollectionsAsync.mockResolvedValue([
        { key: 'lib-collection-key-456', name: 'Cached Remote Collection' },
      ]);

      mockGetVariablesInLibraryCollectionAsync.mockResolvedValue([
        { key: 'var-key-cache', name: 'color/primary' },
      ]);

      mockImportVariableByKeyAsync.mockResolvedValue({
        key: 'var-key-cache',
        variableCollectionId: 'remote-collection-456',
      });

      // First call - should import
      await swapFigmaModes(remoteActiveTheme, [remoteTheme], UpdateMode.PAGE);

      expect(mockImportVariableByKeyAsync).toHaveBeenCalledTimes(1);
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(1);

      // Reset mocks for second call
      mockImportVariableByKeyAsync.mockClear();
      mockGetAvailableLibraryVariableCollectionsAsync.mockClear();
      mockGetVariablesInLibraryCollectionAsync.mockClear();

      // Second call - should use cache without importing
      await swapFigmaModes(remoteActiveTheme, [remoteTheme], UpdateMode.PAGE);

      // Should NOT call import functions again (using cache)
      expect(mockImportVariableByKeyAsync).not.toHaveBeenCalled();
      expect(mockGetAvailableLibraryVariableCollectionsAsync).not.toHaveBeenCalled();
      expect(mockGetVariablesInLibraryCollectionAsync).not.toHaveBeenCalled();

      // Should still set the mode successfully
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(2);
    });

    it('should handle remote collection not found in any library', async () => {
      const remoteTheme = {
        id: 'missing-remote',
        name: 'Missing Remote',
        selectedTokenSets: {},
        $figmaCollectionId: 'non-existent-collection',
        $figmaModeId: 'some-mode',
      };
      const remoteActiveTheme = { 'no-group': 'missing-remote' };

      mockGetVariableCollectionByIdAsync.mockResolvedValue(null);
      mockGetAvailableLibraryVariableCollectionsAsync.mockResolvedValue([]);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await swapFigmaModes(remoteActiveTheme, [remoteTheme], UpdateMode.PAGE);

      expect(notifiers.notifyUI).toHaveBeenCalledWith(
        'One of the variable collections linked to this theme no longer exists',
        { error: true },
      );
      expect(mockSetExplicitVariableModeForCollection).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not found in local file or remote libraries'),
      );

      consoleSpy.mockRestore();
    });

    it('should handle remote collection with empty variables list', async () => {
      const remoteTheme = {
        id: 'empty-remote',
        name: 'Empty Remote',
        selectedTokenSets: {},
        $figmaCollectionId: 'empty-collection',
        $figmaModeId: 'some-mode',
      };
      const remoteActiveTheme = { 'no-group': 'empty-remote' };

      mockGetVariableCollectionByIdAsync.mockResolvedValue(null);
      mockGetAvailableLibraryVariableCollectionsAsync.mockResolvedValue([
        { key: 'empty-lib-key', name: 'Empty Collection' },
      ]);
      mockGetVariablesInLibraryCollectionAsync.mockResolvedValue([]);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await swapFigmaModes(remoteActiveTheme, [remoteTheme], UpdateMode.PAGE);

      expect(notifiers.notifyUI).toHaveBeenCalledWith(
        'One of the variable collections linked to this theme no longer exists',
        { error: true },
      );
      expect(mockImportVariableByKeyAsync).not.toHaveBeenCalled();
      expect(mockSetExplicitVariableModeForCollection).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle mixed local and remote collections in multi-dimensional theme', async () => {
      const localCollection = {
        id: 'local-collection-123',
        name: 'Local Collection',
        modes: [{ modeId: 'local-mode-brand', name: 'Brand A' }],
      };

      const mixedThemes = [
        {
          id: 'local-brand',
          name: 'Local Brand',
          selectedTokenSets: {},
          group: 'brand',
          $figmaCollectionId: 'local-collection-123',
          $figmaModeId: 'local-mode-brand',
        },
        {
          id: 'remote-mode',
          name: 'Remote Mode',
          selectedTokenSets: {},
          group: 'mode',
          $figmaCollectionId: 'remote-collection-789',
          $figmaModeId: 'remote-mode-dark',
        },
      ];

      const mixedActiveTheme = {
        brand: 'local-brand',
        mode: 'remote-mode',
      };

      const remoteCollectionObj = {
        id: 'remote-collection-789',
        name: 'Remote Mode Collection',
        modes: [{ modeId: 'remote-mode-dark', name: 'Dark' }],
      };

      // First call for local collection succeeds
      // Second call for remote collection fails locally
      // Third call after import succeeds
      mockGetVariableCollectionByIdAsync
        .mockResolvedValueOnce(localCollection)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(remoteCollectionObj);

      mockGetAvailableLibraryVariableCollectionsAsync.mockResolvedValue([
        { key: 'remote-lib-key', name: 'Remote Mode Collection' },
      ]);

      mockGetVariablesInLibraryCollectionAsync.mockResolvedValue([
        { key: 'remote-var-key', name: 'theme/dark' },
      ]);

      mockImportVariableByKeyAsync.mockResolvedValue({
        key: 'remote-var-key',
        variableCollectionId: 'remote-collection-789',
      });

      await swapFigmaModes(mixedActiveTheme, mixedThemes, UpdateMode.PAGE);

      // Should set both local and remote modes
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(2);
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(localCollection, 'local-mode-brand');
      expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith(remoteCollectionObj, 'remote-mode-dark');
      expect(notifiers.notifyUI).not.toHaveBeenCalled();
    });
  });
});
