import { UpdateMode } from '@/constants/UpdateMode';
import { swapFigmaModes } from '../swapFigmaModes';

// Mock figma API
const mockSetExplicitVariableModeForCollection = jest.fn();
const mockCurrentPage = {
  children: [
    { name: 'Frame 1', setExplicitVariableModeForCollection: mockSetExplicitVariableModeForCollection },
    { name: 'Frame 2', setExplicitVariableModeForCollection: mockSetExplicitVariableModeForCollection },
  ],
  selection: [
    { name: 'Selected Frame', setExplicitVariableModeForCollection: mockSetExplicitVariableModeForCollection },
  ],
};

const mockRoot = {
  children: [
    {
      children: [
        { name: 'Document Frame 1', setExplicitVariableModeForCollection: mockSetExplicitVariableModeForCollection },
        { name: 'Document Frame 2', setExplicitVariableModeForCollection: mockSetExplicitVariableModeForCollection },
      ],
    },
  ],
};

global.figma = {
  currentPage: mockCurrentPage,
  root: mockRoot,
} as any;

describe('swapFigmaModes', () => {
  beforeEach(() => {
    mockSetExplicitVariableModeForCollection.mockClear();
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

  it('should set variable mode for PAGE update mode', async () => {
    await swapFigmaModes(activeTheme, themes, UpdateMode.PAGE);

    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(2);
    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith('collection-123', 'mode-456');
  });

  it('should set variable mode for SELECTION update mode', async () => {
    await swapFigmaModes(activeTheme, themes, UpdateMode.SELECTION);

    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(1);
    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith('collection-123', 'mode-456');
  });

  it('should set variable mode for DOCUMENT update mode', async () => {
    await swapFigmaModes(activeTheme, themes, UpdateMode.DOCUMENT);

    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledTimes(2);
    expect(mockSetExplicitVariableModeForCollection).toHaveBeenCalledWith('collection-123', 'mode-456');
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

  it('should handle errors gracefully', async () => {
    mockSetExplicitVariableModeForCollection.mockImplementation(() => {
      throw new Error('Mock error');
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    await swapFigmaModes(activeTheme, themes, UpdateMode.PAGE);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to set variable mode for node'),
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
