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
      'The variable collection linked to this theme no longer exists',
      { error: true }
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
      'The mode linked to this theme no longer exists in collection "My Collection"',
      { error: true }
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
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

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
      }
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[SENTRY] Exception sent to Sentry:',
      {
        error: 'Unexpected mock error',
        collectionId: 'collection-123',
        modeId: 'mode-456',
        nodeType: 'PAGE',
        nodeName: 'Page 1',
      }
    );

    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
