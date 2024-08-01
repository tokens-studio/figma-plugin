import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';
import { mockImportVariableByKeyAsync } from '../../tests/__mocks__/figmaMock';
import { tryApplyVariableId } from './tryApplyVariableId';
import { TokenTypes } from '@/constants/TokenTypes';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

describe('tryApplyVariableId', () => {
  const mockSetBoundVariable = jest.fn();
  const mockResolveForConsumer = jest.fn();
  const node = {
    setBoundVariable: mockSetBoundVariable,
    width: '8',
    boundVariables: {
      width: {
        id: 'VariableID:519:32875',
        type: 'VARIABLE_ALIAS',
      },
    },
  } as unknown as SceneNode;
  const mockVariable = {
    id: 'VariableID:519:32875',
    key: '12345',
    variableCollectionId: 'VariableCollectionId:12:12345',
    name: 'token',
    value: '8',
    resolveForConsumer: mockResolveForConsumer,
  };

  afterEach(() => {
    defaultTokenValueRetriever.clearCache();
  });

  it('exits early if variable application is turned off', async () => {
    const variableReferences = new Map();
    defaultTokenValueRetriever.initiate({
      tokens: [{ name: 'token', value: '8', type: TokenTypes.NUMBER }], variableReferences, applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.RAW_VALUES,
    });
    expect(await tryApplyVariableId(node, 'width', 'token')).toBe(false);
  });

  it('when there is no matching variable, should not apply variable and return false', async () => {
    const variableReferences = new Map();
    defaultTokenValueRetriever.initiate({
      tokens: [{ name: 'token', value: '8', type: TokenTypes.NUMBER }], variableReferences,
    });
    expect(await tryApplyVariableId(node, 'width', 'token')).toBe(false);
  });

  it('when there is a matching variable, should try to apply variable', async () => {
    mockImportVariableByKeyAsync.mockImplementationOnce(() => mockVariable);
    mockResolveForConsumer.mockImplementationOnce(() => mockVariable);
    const variableReferences = new Map();
    variableReferences.set('token', 'VariableID:519:32875');
    defaultTokenValueRetriever.initiate({
      tokens: [{ name: 'token', value: '8', type: TokenTypes.NUMBER }], variableReferences,
    });
    expect(await tryApplyVariableId(node, 'width', 'token')).toBe(true);
    expect(mockImportVariableByKeyAsync).toBeCalledWith('VariableID:519:32875');
    expect(mockSetBoundVariable).toBeCalledWith('width', mockVariable);
  });
});
