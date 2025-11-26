import { preResolveVariableReferences } from './preResolveVariableReferences';
import { ThemeObject } from '@/types';

describe('preResolveVariableReferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default behavior
    (figma.variables.getVariableByIdAsync as jest.Mock).mockResolvedValue(null);
    (figma.variables.importVariableByKeyAsync as jest.Mock).mockResolvedValue(null);
  });

  it('should resolve local variables using VariableID format', async () => {
    const mockLocalVariable = { id: 'VariableID:123:456', name: 'color/primary' };
    (figma.variables.getVariableByIdAsync as jest.Mock).mockResolvedValue(mockLocalVariable);

    const themes: ThemeObject[] = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaVariableReferences: {
          'color.primary': 'VariableID:123:456',
        },
      },
    ];

    const result = await preResolveVariableReferences(themes);

    expect(figma.variables.getVariableByIdAsync).toHaveBeenCalledWith('VariableID:123:456');
    expect(result.size).toBe(1);
    expect(result.get('VariableID:123:456')).toEqual(mockLocalVariable);
  });

  it('should resolve remote/library variables using variable key format', async () => {
    const mockRemoteVariable = { id: 'remote-var-id', name: 'colors/brand' };
    (figma.variables.importVariableByKeyAsync as jest.Mock).mockResolvedValue(mockRemoteVariable);

    const themes: ThemeObject[] = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaVariableReferences: {
          'colors.brand': 'V:remote-library-key',
        },
      },
    ];

    const result = await preResolveVariableReferences(themes);

    expect(figma.variables.importVariableByKeyAsync).toHaveBeenCalledWith('V:remote-library-key');
    expect(result.size).toBe(1);
    expect(result.get('V:remote-library-key')).toEqual(mockRemoteVariable);
  });

  it('should resolve both local and remote variables', async () => {
    const mockLocalVariable = { id: 'VariableID:123:456', name: 'color/primary' };
    const mockRemoteVariable = { id: 'remote-var-id', name: 'colors/brand' };

    (figma.variables.getVariableByIdAsync as jest.Mock).mockResolvedValue(mockLocalVariable);
    (figma.variables.importVariableByKeyAsync as jest.Mock).mockResolvedValue(mockRemoteVariable);

    const themes: ThemeObject[] = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaVariableReferences: {
          'color.primary': 'VariableID:123:456',
          'colors.brand': 'V:remote-library-key',
        },
      },
    ];

    const result = await preResolveVariableReferences(themes);

    expect(figma.variables.getVariableByIdAsync).toHaveBeenCalledWith('VariableID:123:456');
    expect(figma.variables.importVariableByKeyAsync).toHaveBeenCalledWith('V:remote-library-key');
    expect(result.size).toBe(2);
    expect(result.get('VariableID:123:456')).toEqual(mockLocalVariable);
    expect(result.get('V:remote-library-key')).toEqual(mockRemoteVariable);
  });

  it('should filter themes by selectedThemeIds when provided', async () => {
    const mockVariable = { id: 'VariableID:123:456', name: 'color/primary' };
    (figma.variables.getVariableByIdAsync as jest.Mock).mockResolvedValue(mockVariable);

    const themes: ThemeObject[] = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaVariableReferences: {
          'color.primary': 'VariableID:123:456',
        },
      },
      {
        id: 'theme2',
        name: 'Theme 2',
        selectedTokenSets: {},
        $figmaVariableReferences: {
          'color.secondary': 'VariableID:789:012',
        },
      },
    ];

    const result = await preResolveVariableReferences(themes, ['theme1']);

    expect(figma.variables.getVariableByIdAsync).toHaveBeenCalledTimes(1);
    expect(figma.variables.getVariableByIdAsync).toHaveBeenCalledWith('VariableID:123:456');
    expect(result.size).toBe(1);
  });

  it('should handle unresolvable variables gracefully', async () => {
    (figma.variables.getVariableByIdAsync as jest.Mock).mockRejectedValue(new Error('Not found'));
    (figma.variables.importVariableByKeyAsync as jest.Mock).mockRejectedValue(new Error('Not found'));

    const themes: ThemeObject[] = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaVariableReferences: {
          'color.primary': 'VariableID:nonexistent',
          'colors.brand': 'V:nonexistent-key',
        },
      },
    ];

    const result = await preResolveVariableReferences(themes);

    // Should not throw, but return empty cache
    expect(result.size).toBe(0);
  });

  it('should handle themes without $figmaVariableReferences', async () => {
    const themes: ThemeObject[] = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
      },
    ];

    const result = await preResolveVariableReferences(themes);

    expect(figma.variables.getVariableByIdAsync).not.toHaveBeenCalled();
    expect(figma.variables.importVariableByKeyAsync).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
  });

  it('should deduplicate variable references across themes', async () => {
    const mockVariable = { id: 'VariableID:123:456', name: 'color/primary' };
    (figma.variables.getVariableByIdAsync as jest.Mock).mockResolvedValue(mockVariable);

    const themes: ThemeObject[] = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaVariableReferences: {
          'color.primary': 'VariableID:123:456',
        },
      },
      {
        id: 'theme2',
        name: 'Theme 2',
        selectedTokenSets: {},
        $figmaVariableReferences: {
          'color.primary': 'VariableID:123:456', // Same reference
        },
      },
    ];

    const result = await preResolveVariableReferences(themes);

    // Should only call once due to deduplication
    expect(figma.variables.getVariableByIdAsync).toHaveBeenCalledTimes(1);
    expect(result.size).toBe(1);
  });
});
