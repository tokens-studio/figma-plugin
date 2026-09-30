import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';
import { mockImportVariableByKeyAsync } from '../../tests/__mocks__/figmaMock';
import { ColorPaintType, tryApplyColorVariableId } from './tryApplyColorVariableId';
import { SingleToken } from '@/types/tokens';
import { RawVariableReferenceMap } from '@/types/RawVariableReferenceMap';
import { TokenTypes } from '@/constants/TokenTypes';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

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

  it('exits early if variable application is turned off', async () => {
    const tokens: SingleToken[] = [{ name: 'token', value: '8', type: TokenTypes.COLOR }];
    const figmaVariableReferences: RawVariableReferenceMap = new Map([]);
    await defaultTokenValueRetriever.initiate({
      tokens,
      variableReferences: figmaVariableReferences,
      applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.RAW_VALUES,
    });
    expect(await tryApplyColorVariableId(node, 'token', ColorPaintType.FILLS)).toBe(false);
  });

  it('when there is no matching variable, should not apply variable and return false', async () => {
    const tokens: SingleToken[] = [{ name: 'token', value: '8', type: TokenTypes.COLOR }];
    const figmaVariableReferences: RawVariableReferenceMap = new Map([]);
    await defaultTokenValueRetriever.initiate({
      tokens,
      variableReferences: figmaVariableReferences,
    });
    expect(await tryApplyColorVariableId(node, 'token', ColorPaintType.FILLS)).toBe(false);
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
    defaultTokenValueRetriever.initiate({
      tokens: [{ name: 'token', value: '8', type: TokenTypes.COLOR }],
      variableReferences,
    });
    expect(await tryApplyColorVariableId(node, 'token', ColorPaintType.FILLS)).toBe(true);
    expect(mockImportVariableByKeyAsync).toBeCalledWith('VariableID:519:32875');
  });

  it('does not reassign a fill already bound to the same variable', async () => {
    const variable = { id: 'VariableID:519:32875', key: '12345' };
    mockImportVariableByKeyAsync.mockResolvedValueOnce(variable);
    defaultTokenValueRetriever.initiate({
      tokens: [{ name: 'token', value: '#ff0000', type: TokenTypes.COLOR }],
      variableReferences: new Map([['token', '12345']]),
    });
    const setFills = jest.fn();
    const target = {
      boundVariables: { fills: [{ id: variable.id }] },
      get fills() {
        return [];
      },
      set fills(value: readonly Paint[]) {
        setFills(value);
      },
    } as unknown as RectangleNode;

    expect(await tryApplyColorVariableId(target, 'token', ColorPaintType.FILLS)).toBe(true);
    expect(setFills).not.toHaveBeenCalled();
    expect(figma.variables.setBoundVariableForPaint).not.toHaveBeenCalled();
  });
});
