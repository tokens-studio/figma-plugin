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
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    await swapFigmaModes(activeTheme, themes, UpdateMode.PAGE);

    expect(notifiers.notifyUI).toHaveBeenCalledWith(
      'One of the variable collections linked to this theme no longer exists',
      { error: true },
    );
    expect(mockSetExplicitVariableModeForCollection).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Variable collection with ID collection-123 no longer exists'),
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
        expect.stringContaining('Variable collection with ID collection-mode no longer exists'),
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
});
