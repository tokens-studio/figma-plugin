import { mockCreateVariable } from '../../tests/__mocks__/figmaMock';
import { SingleToken } from '@/types/tokens';
import setValuesOnVariable from './setValuesOnVariable';
import { TokenTypes } from '@/constants/TokenTypes';
import { SettingsState } from '@/app/store/models/settings';

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
    ] as SingleToken<true, { path: string; variableId: string }>[];
    setValuesOnVariable(variablesInFigma, tokens, collection, mode, {} as SettingsState);
    expect(mockSetValueForMode).toBeCalledWith(mode, 8);
  });

  it('when there is no variable which is connected to the token, we create new variable', () => {
    const tokens = [
      {
        name: 'button.primary.width',
        path: 'button/primary/width',
        rawValue: '{accent.onAccent}',
        value: '16',
        type: TokenTypes.SIZING,
      },
    ] as SingleToken<true, { path: string; variableId: string }>[];
    setValuesOnVariable(variablesInFigma, tokens, collection, mode, {} as SettingsState);
    expect(mockCreateVariable).toBeCalledWith('button/primary/width', 'VariableCollectionId:309:16430', 'FLOAT');
  });

  describe('ignoreFirstPartForVariables=true', () => {
    const variablesInFigma2 = [
      {
        id: 'VariableID:309:16431',
        key: '123',
        name: 'primary/borderRadius',
        setValueForMode: mockSetValueForMode,
      } as unknown as Variable,
      {
        id: 'VariableID:309:16432',
        key: '124',
        name: 'primary/height',
        setValueForMode: mockSetValueForMode,
      } as unknown as Variable,
    ] as Variable[];
    const settings = { ignoreFirstPartForVariables: true } as SettingsState;
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
      ] as SingleToken<true, { path: string; variableId: string }>[];
      setValuesOnVariable(variablesInFigma2, tokens, collection, mode, settings);
      expect(mockSetValueForMode).toBeCalledWith(mode, 8);
    });

    it('when there is no variable which is connected to the token, we create new variable', () => {
      const tokens = [
        {
          name: 'button.primary.width',
          path: 'button/primary/width',
          rawValue: '{accent.onAccent}',
          value: '16',
          type: TokenTypes.SIZING,
        },
      ] as SingleToken<true, { path: string; variableId: string }>[];
      setValuesOnVariable(variablesInFigma2, tokens, collection, mode, settings);
      expect(mockCreateVariable).toBeCalledWith('primary/width', 'VariableCollectionId:309:16430', 'FLOAT');
    });
  });
});
