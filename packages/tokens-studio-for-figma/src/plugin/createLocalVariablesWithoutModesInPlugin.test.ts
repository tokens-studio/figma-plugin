import { mockCreateVariableCollection, mockGetLocalVariableCollections } from '../../tests/__mocks__/figmaMock';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import createLocalVariablesWithoutModesInPlugin from './createLocalVariablesWithoutModesInPlugin';
import { SingleToken } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';

describe('createLocalVariablesWithoutModesInPlugin', () => {
  const mockRenameMode = jest.fn();

  const tokens = {
    global: [
      {
        name: 'button.primary.borderRadius',
        value: '8',
        type: TokenTypes.BORDER_RADIUS,
      } as SingleToken,
      {
        name: 'button.primary.width',
        value: '16',
        type: TokenTypes.SIZING,
      } as SingleToken,
    ],
  };
  const settings = {
    baseFontSize: '16',
  } as SettingsState;

  it('when there is no collection which correspond to the theme, then we create a new collection', async () => {
    const mockLocalVariableCollections = [
      {
        id: 'VariableCollectionId:334:16746',
        modes: [
          {
            name: 'light',
            modeId: '123',
          },
        ],
        name: 'core',
      },
    ];
    const mockNewCollection = {
      id: 'VariableCollectionId:334:16723',
      modes: [
        {
          name: 'new Mode',
          modeId: '123',
        },
      ],
      name: 'color',
      renameMode: mockRenameMode,
    } as unknown as VariableCollection;
    mockGetLocalVariableCollections.mockImplementationOnce(() => mockLocalVariableCollections);
    mockCreateVariableCollection.mockImplementationOnce(() => mockNewCollection);
    const selectedSets = [{
      set: 'global',
      status: TokenSetStatus.ENABLED,
    }];
    expect(await createLocalVariablesWithoutModesInPlugin(tokens, settings, selectedSets)).toEqual({
      allVariableCollectionIds: {},
      totalVariables: 0,
    });
  });
});
