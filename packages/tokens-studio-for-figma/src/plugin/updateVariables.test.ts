import { mockSetValueForMode } from '../../tests/__mocks__/figmaMock';
import updateVariables from './updateVariables';
import { TokenTypes } from '@/constants/TokenTypes';
import { ThemeObject } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

const newVariable: Variable = {
  name: 'primary/500',
  variableCollectionId: 'VariableCollectionId:1:0',
  resolvedType: 'COLOR',
  setValueForMode: mockSetValueForMode,
  id: 'VariableID:1:0',
  key: 'VariableID:1:0',
  description: '',
  valuesByMode: {},
};

describe('updateVariables', () => {
  figma.variables.getLocalVariablesAsync = jest.fn().mockResolvedValue([{
    name: 'existing/color',
    remote: false,
    resolvedType: 'COLOR',
    setValueForMode: mockSetValueForMode,
    remove: jest.fn(),
    description: '',
    key: 'VariableID:1:toremove',
    variableCollectionId: 'VariableCollectionId:1:0',
    valuesByMode: {},
  }]);

  figma.variables.getLocalVariables = jest.fn().mockReturnValue([{
    name: 'existing/color',
    remote: false,
    resolvedType: 'COLOR',
    setValueForMode: mockSetValueForMode,
    remove: jest.fn(),
    description: '',
    key: 'VariableID:1:toremove',
    variableCollectionId: 'VariableCollectionId:1:0',
    valuesByMode: {},
  }]);

  figma.variables.getLocalVariableCollectionsAsync = jest.fn().mockResolvedValue([{
    id: 'VariableCollectionId:1:0',
    name: 'Collection 1',
    remote: false,
    modes: [
      { name: 'Default', modeId: '1:0' },
      { name: 'Dark', modeId: '1:1' },
      { name: 'Light', modeId: '1:2' },
    ],
  }]);

  figma.variables.getVariableCollectionById = jest.fn().mockResolvedValue({
    id: 'VariableCollectionId:1:0',
    name: 'Collection 1',
    remote: false,
    modes: [
      { name: 'Default', modeId: '1:0' },
      { name: 'Dark', modeId: '1:1' },
      { name: 'Light', modeId: '1:2' },
    ],
  });
  figma.variables.createVariable = jest.fn().mockReturnValue(newVariable);

  const collection = { id: 'VariableCollectionId:1:0' };
  const theme: ThemeObject = {
    id: 'ThemeId:1:2',
    name: 'Light',
    group: 'Modes',
    selectedTokenSets: { core: TokenSetStatus.ENABLED },
  };
  const tokens = {
    core: [
      {
        name: 'primary.500',
        value: '#ff0000',
        type: TokenTypes.COLOR,
      },
      {
        name: 'invalid.type',
        value: '14',
        type: 'invalid-type',
      },
    ],
  };
  const settings = {
    variablesColor: true,
    variablesNumber: true,
    variablesString: true,
    variablesBoolean: true,
    renameExistingStylesAndVariables: true,
    removeStylesAndVariablesWithoutConnection: true,
  };

  it('creates variables for eligible token and ignores invalid token types', async () => {
    const result = await updateVariables({
      collection,
      mode: '1:2', // Use the correct mode ID for 'Light' mode
      theme,
      tokens,
      settings,
      overallConfig: { core: TokenSetStatus.ENABLED },
    });

    expect(result.variableIds).toEqual({ 'primary.500': 'VariableID:1:0' });
  });

  it('should handle tokens that reference another token', async () => {
    const tokensWithReference = {
      core: [
        {
          name: 'fg.accent',
          value: '{primary.500}',
          type: TokenTypes.COLOR,
        },
        {
          name: 'primary.500',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
      ],
    };
    const result = await updateVariables({
      collection,
      mode: '1:2', // Use the correct mode ID for 'Light' mode
      theme,
      tokens: tokensWithReference,
      settings,
      overallConfig: { core: TokenSetStatus.ENABLED },
    });
    expect(result.referenceVariableCandidate).toEqual([
      {
        variable: newVariable,
        modeId: '1:2', // Use the correct mode ID for 'Light' mode
        referenceVariable: 'primary.500',
      },
    ]);
  });

  it('should remove existing variables that were not handled', async () => {
    const result = await updateVariables({
      collection,
      mode: '1:2', // Use the correct mode ID for 'Light' mode
      theme,
      tokens,
      settings,
      overallConfig: { core: TokenSetStatus.ENABLED },
    });
    expect(result.removedVariables).toEqual(['VariableID:1:toremove']);
  });

  it('should use theme-specific base font size for rem conversion', async () => {
    // Clear the mock before starting
    mockSetValueForMode.mockClear();

    // Mock variables for font size tokens
    const fontSizeVariable1rem: Variable = {
      name: 'font-size/1rem',
      variableCollectionId: 'VariableCollectionId:1:0',
      resolvedType: 'FLOAT',
      setValueForMode: mockSetValueForMode,
      id: 'VariableID:1:1',
      key: 'VariableID:1:1',
      description: '',
      valuesByMode: { '1:0': 0, '1:1': 0 }, // Initialize with 0 for both modes
      remote: false,
      remove: jest.fn(),
    };

    const fontSizeVariable2rem: Variable = {
      name: 'font-size/2rem',
      variableCollectionId: 'VariableCollectionId:1:0',
      resolvedType: 'FLOAT',
      setValueForMode: mockSetValueForMode,
      id: 'VariableID:1:2',
      key: 'VariableID:1:2',
      description: '',
      valuesByMode: { '1:0': 0, '1:1': 0 }, // Initialize with 0 for both modes
      remote: false,
      remove: jest.fn(),
    };

    const baselineVariable: Variable = {
      name: 'typography/baseline',
      variableCollectionId: 'VariableCollectionId:1:0',
      resolvedType: 'FLOAT',
      setValueForMode: mockSetValueForMode,
      id: 'VariableID:1:3',
      key: 'VariableID:1:3',
      description: '',
      valuesByMode: { '1:0': 0, '1:1': 0 }, // Initialize with 0 for both modes
      remote: false,
      remove: jest.fn(),
    };

    // Mock createVariable to return different variables based on name
    figma.variables.createVariable = jest.fn().mockImplementation((name) => {
      if (name === 'font-size/1rem') return fontSizeVariable1rem;
      if (name === 'font-size/2rem') return fontSizeVariable2rem;
      if (name === 'typography/baseline') return baselineVariable;
      return newVariable;
    });

    // Mock getLocalVariables to return empty array (no existing variables)
    figma.variables.getLocalVariables = jest.fn().mockReturnValue([]);

    // Mobile theme with 16px baseline
    const mobileTheme: ThemeObject = {
      id: 'ThemeId:mobile',
      name: 'Mobile',
      group: 'Responsive',
      selectedTokenSets: { mobile: TokenSetStatus.ENABLED },
    };

    const mobileTokens = {
      mobile: [
        {
          name: 'typography.baseline',
          value: '16px',
          type: TokenTypes.FONT_SIZES,
        },
        {
          name: 'font-size.1rem',
          value: '1rem',
          type: TokenTypes.FONT_SIZES,
        },
        {
          name: 'font-size.2rem',
          value: '2rem',
          type: TokenTypes.FONT_SIZES,
        },
      ],
    };

    const settingsWithAlias = {
      ...settings,
      baseFontSize: '16px',
      aliasBaseFontSize: '{typography.baseline}',
    };

    await updateVariables({
      collection,
      mode: '1:0',
      theme: mobileTheme,
      tokens: mobileTokens,
      settings: settingsWithAlias,
      overallConfig: { mobile: TokenSetStatus.ENABLED },
    });

    // Verify that 1rem was converted to 16px (1 * 16)
    expect(mockSetValueForMode).toHaveBeenCalledWith('1:0', 16);
    // Verify that 2rem was converted to 32px (2 * 16)
    expect(mockSetValueForMode).toHaveBeenCalledWith('1:0', 32);

    // Tablet theme with 15px baseline
    const tabletTheme: ThemeObject = {
      id: 'ThemeId:tablet',
      name: 'Tablet',
      group: 'Responsive',
      selectedTokenSets: { tablet: TokenSetStatus.ENABLED },
    };

    const tabletTokens = {
      tablet: [
        {
          name: 'typography.baseline',
          value: '15px',
          type: TokenTypes.FONT_SIZES,
        },
        {
          name: 'font-size.1rem',
          value: '1rem',
          type: TokenTypes.FONT_SIZES,
        },
        {
          name: 'font-size.2rem',
          value: '2rem',
          type: TokenTypes.FONT_SIZES,
        },
      ],
    };

    mockSetValueForMode.mockClear();

    await updateVariables({
      collection,
      mode: '1:1',
      theme: tabletTheme,
      tokens: tabletTokens,
      settings: settingsWithAlias,
      overallConfig: { tablet: TokenSetStatus.ENABLED },
    });

    // Verify that 1rem was converted to 15px (1 * 15)
    expect(mockSetValueForMode).toHaveBeenCalledWith('1:1', 15);
    // Verify that 2rem was converted to 30px (2 * 15)
    expect(mockSetValueForMode).toHaveBeenCalledWith('1:1', 30);
  });

  it('should handle numeric baseFontSize results from getAliasValue (math evaluated)', async () => {
    mockSetValueForMode.mockClear();

    const baselineVariable = {
      name: 'typography/baseline',
      variableCollectionId: 'VariableCollectionId:1:0',
      resolvedType: 'FLOAT',
      setValueForMode: mockSetValueForMode,
      id: 'VariableID:1:3',
      key: 'VariableID:1:3',
      description: '',
      valuesByMode: { '1:0': 16 },
      remote: false,
      remove: jest.fn(),
    };

    const newVarForTest = {
      name: 'sizing/test',
      variableCollectionId: 'VariableCollectionId:1:0',
      resolvedType: 'FLOAT',
      setValueForMode: mockSetValueForMode,
      id: 'VariableID:1:new',
      key: 'VariableID:1:new',
      description: '',
      valuesByMode: { '1:0': 0 },
      remote: false,
      remove: jest.fn(),
    };

    figma.variables.createVariable = jest.fn().mockImplementation((name) => {
      if (name === 'typography/baseline') return baselineVariable;
      if (name === 'sizing/test') return newVarForTest;
      return newVariable;
    });

    figma.variables.getLocalVariables = jest.fn().mockReturnValue([]);

    const theme = {
      id: 'ThemeId:test',
      name: 'Test',
      group: 'Test group',
      selectedTokenSets: { core: TokenSetStatus.ENABLED },
    };

    const tokens = {
      core: [
        {
          name: 'typography.baseline',
          value: '16', 
          type: TokenTypes.FONT_SIZES,
        },
        {
          name: 'sizing.test',
          value: '1.5rem',
          type: TokenTypes.SIZING,
        },
      ],
    };

    const settingsWithAlias = {
      ...settings,
      aliasBaseFontSize: '{typography.baseline}',
    };

    await updateVariables({
      collection: { id: 'VariableCollectionId:1:0' } as any,
      mode: '1:0',
      theme,
      tokens,
      settings: settingsWithAlias,
      overallConfig: { core: TokenSetStatus.ENABLED },
    });

    // 1.5rem * 16 = 24
    expect(mockSetValueForMode).toHaveBeenCalledWith('1:0', 24);
  });

  it('should apply different baseFontSize for different modes in the same collection', async () => {
    mockSetValueForMode.mockClear();
    const mockSpacingSetValueForMode = jest.fn();
    const mockBaseFontSizeSetValueForMode = jest.fn();

    const collection: any = {
      id: 'collection1',
      modes: [
        { modeId: 'mode-a', name: 'Mode A' },
        { modeId: 'mode-b', name: 'Mode B' },
      ],
    };

    const tokens: any = {
      core: [
        { name: 'base.font-size', value: '16', type: TokenTypes.NUMBER },
        { name: 'spacing.small', value: '1rem', type: TokenTypes.SPACING },
      ],
      dark: [
        { name: 'base.font-size', value: '20', type: TokenTypes.NUMBER },
      ],
    };

    const settings: any = {
      aliasBaseFontSize: '{base.font-size}',
      variablesNumber: true,
      variablesColor: false,
      variablesString: false,
      variablesBoolean: false,
      renameExistingStylesAndVariables: false,
      removeStylesAndVariablesWithoutConnection: false,
    };

    const themeA: any = {
      id: 'theme-a',
      name: 'Theme A',
      selectedTokenSets: { core: TokenSetStatus.ENABLED },
      $figmaModeId: 'mode-a',
    };

    const themeB: any = {
      id: 'theme-b',
      name: 'Theme B',
      selectedTokenSets: {
        core: TokenSetStatus.ENABLED,
        dark: TokenSetStatus.ENABLED,
      },
      $figmaModeId: 'mode-b',
    };

    const mockSpacingVariable: any = {
      id: 'var1',
      key: 'var1-key',
      name: 'spacing/small',
      resolvedType: 'FLOAT',
      variableCollectionId: 'collection1',
      valuesByMode: { 'mode-a': 0, 'mode-b': 0 }, // Initial values changed to 0
      setValueForMode: mockSpacingSetValueForMode,
    };

    const mockBaseFontSizeVariable: any = {
      id: 'var2',
      key: 'var2-key',
      name: 'base/font-size',
      resolvedType: 'FLOAT',
      variableCollectionId: 'collection1',
      valuesByMode: { 'mode-a': 0, 'mode-b': 0 }, // Initial values changed to 0
      setValueForMode: mockBaseFontSizeSetValueForMode,
    };

    (figma.variables.getLocalVariables as jest.Mock).mockReturnValue([
      mockSpacingVariable,
      mockBaseFontSizeVariable,
    ]);
    (figma.variables.getVariableByIdAsync as jest.Mock).mockImplementation(async (id: string) => {
      if (id === mockSpacingVariable.id) return mockSpacingVariable;
      if (id === mockBaseFontSizeVariable.id) return mockBaseFontSizeVariable;
      return null;
    });

    // Call updateVariables for Theme A (Mode A)
    await updateVariables({
      collection,
      mode: 'mode-a',
      theme: themeA,
      tokens,
      settings,
      overallConfig: { core: TokenSetStatus.ENABLED },
    });

    // Call updateVariables for Theme B (Mode B)
    await updateVariables({
      collection,
      mode: 'mode-b',
      theme: themeB,
      tokens,
      settings,
      overallConfig: {
        core: TokenSetStatus.ENABLED,
        dark: TokenSetStatus.ENABLED,
      },
    });

    // Verify spacing/small got 16px for Mode A (1rem * 16)
    // Note: It might not be called if value is already 16, but we check consistency
    expect(mockSpacingSetValueForMode).toHaveBeenCalledWith('mode-a', 16);
    // Verify spacing/small got 20px for Mode B (1rem * 20)
    expect(mockSpacingSetValueForMode).toHaveBeenCalledWith('mode-b', 20);

    // Verify base/font-size updates
    expect(mockBaseFontSizeSetValueForMode).toHaveBeenCalledWith('mode-a', 16);
    expect(mockBaseFontSizeSetValueForMode).toHaveBeenCalledWith('mode-b', 20);
  });
});
