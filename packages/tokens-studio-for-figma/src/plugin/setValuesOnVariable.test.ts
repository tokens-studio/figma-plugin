import { mockCreateVariable } from '../../tests/__mocks__/figmaMock';
import { SingleToken } from '@/types/tokens';
import setValuesOnVariable from './setValuesOnVariable';
import { TokenTypes } from '@/constants/TokenTypes';

// TODO: A lot of these tests could be rearranged and grouped follow the order of logic of each file, to see better what happy / sad paths are being covered.

describe('SetValuesOnVariable', () => {
  const mockSetValueForMode = jest.fn();
  const variablesInFigma = [
    {
      id: 'VariableID:309:16431',
      key: '123',
      name: 'button/primary/borderRadius',
      setValueForMode: mockSetValueForMode,
    } as unknown as Variable,
    {
      id: 'VariableID:309:16432',
      key: '124',
      name: 'button/primary/height',
      setValueForMode: mockSetValueForMode,
    } as unknown as Variable,
  ] as Variable[];
  const mode = '309';
  const collection = {
    id: 'VariableCollectionId:309:16430',
  } as VariableCollection;
  it('when there is a variable which is connected to the token, we just update the value', () => {
    const tokens = [
      {
        name: 'button.primary.borderRadius',
        path: 'button/primary/borderRadius',
        rawValue: '{accent.default}',
        value: '8',
        type: TokenTypes.BORDER_RADIUS,
        variableId: '123',
      },
    ] as SingleToken<true, { path: string, variableId: string }>[];
    setValuesOnVariable(variablesInFigma, tokens, collection, mode);
    expect(mockSetValueForMode).toBeCalledWith(mode, 8);
  });

  it('should create a new variable when there is no variable which is connected to the token', () => {
    const tokens = [
      {
        name: 'button.primary.width',
        path: 'button/primary/width',
        rawValue: '{accent.onAccent}',
        value: '16',
        type: TokenTypes.SIZING,
      },
    ] as SingleToken<true, { path: string, variableId: string }>[];
    setValuesOnVariable(variablesInFigma, tokens, collection, mode);
    expect(mockCreateVariable).toBeCalledWith('button/primary/width', collection, 'FLOAT');
  });

  it('should rename variable if name and path differ and shouldRename is given', async () => {
    const tokens = [
      {
        name: 'button.primary.height',
        path: 'button/primary/height',
        rawValue: 16,
        value: '16',
        type: TokenTypes.NUMBER,
        variableId: '123',
      },
    ];
    const result = await setValuesOnVariable(variablesInFigma, tokens, collection, mode, true);
    expect(result.renamedVariableKeys).toEqual(['123']);
    expect(variablesInFigma[0].name).toEqual('button/primary/height');
    expect(mockCreateVariable).not.toBeCalled();
  });

  it('should apply fontWeight token with numeric value', async () => {
    const tokens = [{
      name: 'global.fontWeight',
      path: 'global/fontWeight',
      value: 300,
      rawValue: 300,
      type: TokenTypes.FONT_WEIGHTS,
      variableId: '1234'
    }];
    await setValuesOnVariable(variablesInFigma, tokens, collection, mode);
    expect(mockCreateVariable).toBeCalledWith('global/fontWeight', collection, 'FLOAT');
  })
});
