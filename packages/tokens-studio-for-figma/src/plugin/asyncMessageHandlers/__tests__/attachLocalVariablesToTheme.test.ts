import { mockGetLocalVariables, mockGetLocalVariableCollections } from '../../../../tests/__mocks__/figmaMock';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { attachLocalVariablesToTheme } from '../attachLocalVariablesToTheme';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

describe('AttachLocalVariablesToTheme', () => {
  const theme = {
    id: 'light',
    name: 'light',
    group: 'color',
    selectedTokenSets: {
      core: TokenSetStatus.SOURCE,
      light: TokenSetStatus.ENABLED,
    },
  };
  const tokens = {
    global: [
      {
        name: 'colors.black',
        value: '#000000',
        type: TokenTypes.COLOR,
      } as SingleToken,
      {
        name: 'colors.gray.100',
        value: '#f7fafc',
        type: TokenTypes.COLOR,
      } as SingleToken,
      {
        name: 'colors.gray.200',
        value: '#edf2f7',
        type: TokenTypes.COLOR,
      } as SingleToken,
    ],
    light: [
      {
        name: 'fg.default',
        value: '{colors.black}',
        type: TokenTypes.COLOR,
      } as SingleToken,
      {
        name: 'fg.muted',
        value: '{colors.gray.100}',
        type: TokenTypes.COLOR,
      } as SingleToken,
      {
        name: 'fg.subtle',
        value: '#ffffff',
        type: TokenTypes.COLOR,
      } as SingleToken,
    ],
  };

  it('should find matching variables and attach to the tokens', async () => {
    const mockLocalVariableCollections = [
      {
        id: 'VariableCollectionId:12:12345',
        modes: [
          {
            name: 'light',
            modeId: '123',
          },
        ],
        name: 'core',
      },
      {
        id: 'VariableCollectionId:23:23456',
        modes: [
          {
            name: 'light',
            modeId: '234',
          },
          {
            name: 'dark',
            modeId: '345',
          },
        ],
        name: 'color',
      },
    ];
    const mockLocalVariables = [
      {
        id: 'VariableID:365:16876',
        key: '12345',
        variableCollectionId: 'VariableCollectionId:12:12345',
        name: 'fg/default',
      },
      {
        id: 'VariableID:365:16877',
        key: '23456',
        variableCollectionId: 'VariableCollectionId:23:23456',
        name: 'fg/muted',
      },
      {
        id: 'VariableID:365:16878',
        key: '34567',
        variableCollectionId: 'VariableCollectionId:23:23456',
        name: 'fg/subtle',
      },
    ];
    mockGetLocalVariableCollections.mockImplementationOnce(() => mockLocalVariableCollections);
    mockGetLocalVariables.mockImplementationOnce(() => mockLocalVariables);
    expect(await attachLocalVariablesToTheme({
      type: AsyncMessageTypes.ATTACH_LOCAL_VARIABLES_TO_THEME,
      tokens,
      theme,
    })).toEqual({
      variableInfo: {
        collectionId: 'VariableCollectionId:23:23456',
        modeId: '234',
        variableIds: {
          'fg.muted': '23456',
          'fg.subtle': '34567',
        },
      },
    });
  });

  it('when there is no matching collection then should return null', async () => {
    const mockLocalVariableCollections = [
      {
        id: 'VariableCollectionId:12:12345',
        modes: [
          {
            name: 'light',
            modeId: '123',
          },
        ],
        name: 'core',
      },
    ];
    const mockLocalVariables = [
      {
        id: 'VariableID:365:16876',
        key: '12345',
        variableCollectionId: 'VariableCollectionId:12:12345',
        name: 'fg/default',
      },
      {
        id: 'VariableID:365:16877',
        key: '23456',
        variableCollectionId: 'VariableCollectionId:23:23456',
        name: 'fg/muted',
      },
      {
        id: 'VariableID:365:16878',
        key: '34567',
        variableCollectionId: 'VariableCollectionId:23:23456',
        name: 'fg/subtle',
      },
    ];
    mockGetLocalVariableCollections.mockImplementationOnce(() => mockLocalVariableCollections);
    mockGetLocalVariables.mockImplementationOnce(() => mockLocalVariables);
    expect(await attachLocalVariablesToTheme({
      type: AsyncMessageTypes.ATTACH_LOCAL_VARIABLES_TO_THEME,
      tokens,
      theme,
    })).toEqual({
      variableInfo: null,
    });
  });
});
