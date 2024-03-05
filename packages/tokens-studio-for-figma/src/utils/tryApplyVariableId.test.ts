import { mockImportVariableByKeyAsync } from '../../tests/__mocks__/figmaMock';
import { tryApplyVariableId } from './tryApplyVariableId';

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

  it('when there is no matching variable, should not apply variable and return false', async () => {
    const variableReferences = new Map();
    expect(await tryApplyVariableId(node, 'width', 'token', variableReferences)).toBe(false);
  });

  it('when there is a matching variable, should try to apply variable', async () => {
    const mockVariable = {
      id: 'VariableID:519:32875',
      key: '12345',
      variableCollectionId: 'VariableCollectionId:12:12345',
      name: 'token',
      value: '8',
      resolveForConsumer: mockResolveForConsumer,
    };
    mockImportVariableByKeyAsync.mockImplementationOnce(() => mockVariable);
    mockResolveForConsumer.mockImplementationOnce(() => mockVariable);
    const variableReferences = new Map();
    variableReferences.set('token', 'VariableID:519:32875');
    expect(await tryApplyVariableId(node, 'width', 'token', variableReferences)).toBe(true);
    expect(mockImportVariableByKeyAsync).toBeCalledWith('VariableID:519:32875');
    expect(mockSetBoundVariable).toBeCalledWith('width', 'VariableID:519:32875');
  });
});
