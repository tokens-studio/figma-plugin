import { mockImportVariableByKeyAsync } from '../../tests/__mocks__/figmaMock';
import { ColorPaintType, tryApplyColorVariableId } from './tryApplyColorVariableId';

describe('tryApplyColorVariableId', () => {
  const mockSetBoundVariable = jest.fn();
  const node = {
    setBoundVariable: mockSetBoundVariable,
    fills: [],
    boundVariables: {
      fills: [
        {
          id: 'VariableID:519:32875',
        },
      ],
    },
  } as unknown as SceneNode;

  it('when there is no matching variable, should not apply variable and return false', async () => {
    const variableReferences = new Map();
    expect(await tryApplyColorVariableId(node, 'token', variableReferences, ColorPaintType.FILLS)).toBe(false);
  });

  it('when there is a matching variable, should try to apply variable', async () => {
    const mockVariable = {
      id: 'VariableID:519:32875',
      key: '12345',
      variableCollectionId: 'VariableCollectionId:12:12345',
      name: 'token',
      value: '8',
    };
    mockImportVariableByKeyAsync.mockImplementationOnce(() => mockVariable);
    const variableReferences = new Map();
    variableReferences.set('token', 'VariableID:519:32875');
    expect(await tryApplyColorVariableId(node, 'token', variableReferences, ColorPaintType.FILLS)).toBe(true);
    expect(mockImportVariableByKeyAsync).toBeCalledWith('VariableID:519:32875');
  });
});
