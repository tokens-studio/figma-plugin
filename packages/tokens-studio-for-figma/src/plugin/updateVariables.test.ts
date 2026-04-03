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

  it('should resolve aliasBaseFontSize per theme when baseline token value is a plain number (not a string with px)', async () => {
    // This test covers the case where the baseFontSize token resolves to a plain
    // number (e.g., 16) rather than a string like '16px'. getAliasValue returns
    // a number in this case, which previously caused the per-theme baseFontSize
    // to be silently ignored.
    mockSetValueForMode.mockClear();

    // Create variable mocks with valuesByMode initialized so setNumberValuesOnVariable doesn't bail early
    const numericFontSizeMdVariable: Variable = {
      name: 'font-size/md',
      variableCollectionId: 'VariableCollectionId:1:0',
      resolvedType: 'FLOAT',
      setValueForMode: mockSetValueForMode,
      id: 'VariableID:numeric:1',
      key: 'VariableID:numeric:1',
      description: '',
      valuesByMode: { '1:0': 0, '1:1': 0 },
      remote: false,
      remove: jest.fn(),
    };

    const numericBaselineVariable: Variable = {
      name: 'typography/baseline',
      variableCollectionId: 'VariableCollectionId:1:0',
      resolvedType: 'FLOAT',
      setValueForMode: mockSetValueForMode,
      id: 'VariableID:numeric:2',
      key: 'VariableID:numeric:2',
      description: '',
      valuesByMode: { '1:0': 0, '1:1': 0 },
      remote: false,
      remove: jest.fn(),
    };

    figma.variables.createVariable = jest.fn().mockImplementation((name) => {
      if (name === 'font-size/md') return numericFontSizeMdVariable;
      return numericBaselineVariable;
    });
    figma.variables.getLocalVariables = jest.fn().mockReturnValue([]);

    // Mobile theme: baseline token has a plain numeric value (no 'px')
    const mobileThemeNumeric: ThemeObject = {
      id: 'ThemeId:mobile-numeric',
      name: 'Mobile',
      group: 'Device',
      selectedTokenSets: { mobileNumeric: TokenSetStatus.ENABLED },
    };

    const mobileNumericTokens = {
      mobileNumeric: [
        {
          name: 'typography.baseline',
          value: 16, // plain number, not '16px'
          type: TokenTypes.FONT_SIZES,
        },
        {
          name: 'font-size.md',
          value: '1rem',
          type: TokenTypes.FONT_SIZES,
        },
      ],
    };

    const settingsWithNumericAlias = {
      ...settings,
      baseFontSize: '10', // fallback value — should NOT be used
      aliasBaseFontSize: '{typography.baseline}',
    };

    await updateVariables({
      collection,
      mode: '1:0',
      theme: mobileThemeNumeric,
      tokens: mobileNumericTokens,
      settings: settingsWithNumericAlias,
      overallConfig: { mobileNumeric: TokenSetStatus.ENABLED },
    });

    // 1rem should be resolved using the per-theme baseline of 16 (not fallback of 10)
    expect(mockSetValueForMode).toHaveBeenCalledWith('1:0', 16);

    mockSetValueForMode.mockClear();

    // Desktop theme: baseline is 18 (plain number)
    const desktopThemeNumeric: ThemeObject = {
      id: 'ThemeId:desktop-numeric',
      name: 'Desktop',
      group: 'Device',
      selectedTokenSets: { desktopNumeric: TokenSetStatus.ENABLED },
    };

    const desktopNumericTokens = {
      desktopNumeric: [
        {
          name: 'typography.baseline',
          value: 18, // plain number, not '18px'
          type: TokenTypes.FONT_SIZES,
        },
        {
          name: 'font-size.md',
          value: '1rem',
          type: TokenTypes.FONT_SIZES,
        },
      ],
    };

    await updateVariables({
      collection,
      mode: '1:1',
      theme: desktopThemeNumeric,
      tokens: desktopNumericTokens,
      settings: settingsWithNumericAlias,
      overallConfig: { desktopNumeric: TokenSetStatus.ENABLED },
    });

    // 1rem should be resolved using the per-theme baseline of 18 (not fallback of 10)
    expect(mockSetValueForMode).toHaveBeenCalledWith('1:1', 18);
  });
});
