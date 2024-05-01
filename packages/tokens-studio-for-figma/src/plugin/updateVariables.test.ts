import { mockSetValueForMode } from '../../tests/__mocks__/figmaMock';
import updateVariables from './updateVariables';
import { CreateVariableTypes } from '@/types/variables';
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
};

describe('updateVariables', () => {
  figma.variables.getLocalVariables = jest.fn().mockReturnValue([{
    name: 'existing/color',
    remote: false,
    resolvedType: 'COLOR',
    setValueForMode: mockSetValueForMode,
    remove: jest.fn(),
    description: '',
    key: 'VariableID:1:toremove',
    variableCollectionId: 'VariableCollectionId:1:0',
  }]);

  figma.variables.getVariableCollectionById = jest.fn().mockReturnValue({
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

  it('creates variables for eligible token and ignores invalid token types', () => {
    const result = updateVariables({
      collection,
      mode: 'light',
      theme,
      tokens,
      settings,
    });

    expect(result.variableIds).toEqual({ 'primary.500': 'VariableID:1:0' });
  });

  it('handles tokens that reference another token', () => {
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
    const result = updateVariables({
      collection,
      mode: 'light',
      theme,
      tokens: tokensWithReference,
      settings,
    });
    expect(result.referenceVariableCandidate).toEqual([
      {
        variable: newVariable,
        modeId: 'light',
        referenceVariable: 'primary/500',
      },
    ]);
  });

  it('removes existing variables that were not handled', () => {
    const result = updateVariables({
      collection,
      mode: 'light',
      theme,
      tokens,
      settings,
    });
    expect(result.removedVariables).toEqual(['VariableID:1:toremove']);
  });
});
