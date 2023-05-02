import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import * as notifiers from '@/plugin/notifiers';
import updateTokensOnSources from '../updateSources';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

const mockedUpdateTokensOnSources = updateTokensOnSources as jest.MockedFunction<typeof updateTokensOnSources>;

jest.mock('../updateSources', () => jest.fn());

// Hide errors unless they are expected
const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

const shadowArray = [
  {
    type: 'innerShadow',
    color: '#00000080',
    x: '0',
    y: '0',
    blur: '2',
    spread: '4',
  },
  {
    type: 'dropShadow',
    color: '#000000',
    x: '0',
    y: '4',
    blur: '4',
    spread: '4',
  },
];

type Store = RematchStore<RootModel, Record<string, never>>;

const initialTokens = {
  global: [
    {
      name: 'primary',
      value: '1',
    },
    {
      name: 'alias',
      value: '$primary',
    },
    {
      name: 'primary50',
      value: '0.50',
    },
    {
      name: 'alias50',
      value: '$primary50',
    },
    {
      name: 'header 1',
      type: 'typography',
      value: {
        fontWeight: '400',
        fontSize: '16',
      },
    },
    {
      name: 'header 1',
      type: 'typography',
      value: {
        fontWeight: '400',
        fontSize: '16',
      },
    },
    {
      name: 'shadow.mixed',
      type: 'boxShadow',
      description: 'the one with mixed shadows',
      value: shadowArray,
    },
    {
      name: 'font.big',
      type: 'sizing',
      value: '24px',
    },
    {
      name: 'font.small',
      type: 'sizing',
      value: '12px',
    },
    {
      name: 'font.medium',
      type: 'fontSizes',
      value: '18px',
    },
    {
      name: 'font.alias',
      type: 'sizing',
      value: '$font.small',
    },
  ],
  options: [
    {
      name: 'background',
      value: '$primary',
    },
  ],
};

describe('editToken', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            tokens: initialTokens,
            usedTokenSet: {
              global: TokenSetStatus.ENABLED,
            },
            importedTokens: {
              newTokens: [],
              updatedTokens: [],
            },
            themes: [],
            activeTheme: {},
            activeTokenSet: 'global',
            collapsedTokens: [],
            remoteData: {
              tokens: {},
              themes: [],
              metadata: null,
            },
          },
          settings: {
            updateRemote: true,
            updateOnChange: true,
          },
        },
      },
      models,
    });
    jest.clearAllMocks();
  });
  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('calls updateAliases if old name differs from new name', async () => {
    await store.dispatch.tokenState.editToken({
      parent: 'global',
      oldName: 'primary',
      name: 'brand.primary',
      value: '1',
      options: {
        type: TokenTypes.COLOR,
      },
    });

    const { tokens } = store.getState().tokenState;
    expect(tokens.global[1].value).toEqual('$brand.primary');
  });

  it('doesnt interfere with tokens that have a similar name', async () => {
    await store.dispatch.tokenState.editToken({
      parent: 'global',
      oldName: 'primary',
      name: 'secondary',
      value: '1',
      options: {
        type: TokenTypes.COLOR,
      },
    });

    const { tokens } = store.getState().tokenState;
    expect(tokens.global[1].value).toEqual('$secondary');
    expect(tokens.global[3].value).toEqual('$primary50');
    expect(tokens.global[3].value).toEqual('$primary50');
  });

  it('doesnt interfere with other tokens', async () => {
    await store.dispatch.tokenState.editToken({
      parent: 'global',
      oldName: 'primary',
      name: 'secondary',
      value: '1',
      options: {
        type: TokenTypes.COLOR,
      },
    });

    const { tokens } = store.getState().tokenState;
    expect(tokens.global[6].value).toEqual(shadowArray);
  });

  it('also updates tokens from other sets', async () => {
    await store.dispatch.tokenState.editToken({
      parent: 'global',
      oldName: 'primary',
      name: 'secondary',
      value: '1',
      options: {
        type: TokenTypes.COLOR,
      },
    });

    const { tokens } = store.getState().tokenState;
    expect(tokens.options[0].value).toEqual('$secondary');
  });

  it('does a deep equality check on object values', async () => {
    await store.dispatch.tokenState.setTokensFromStyles({
      colors: [
        {
          type: TokenTypes.COLOR,
          name: 'primary',
          value: '2',
        },
        {
          type: TokenTypes.COLOR,
          name: 'secondary',
          value: '3',
        },
      ],
      typography: [
        {
          name: 'header 1',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontWeight: '400',
            fontSize: '16',
          },
        },
        {
          name: 'header 2',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontWeight: '400',
            fontSize: '14',
          },
        },
      ],
    });

    const { importedTokens } = store.getState().tokenState;
    expect(importedTokens.newTokens).toEqual([
      {
        type: TokenTypes.COLOR,
        name: 'secondary',
        value: '3',
      },
      {
        name: 'header 2',
        type: TokenTypes.TYPOGRAPHY,
        value: {
          fontWeight: '400',
          fontSize: '14',
        },
      },
    ]);
    expect(importedTokens.updatedTokens).toEqual([
      {
        type: TokenTypes.COLOR,
        name: 'primary',
        oldValue: '1',
        value: '2',
      },
    ]);
  });

  it('can toggle many token sets (disabled)', () => {
    store.dispatch.tokenState.toggleManyTokenSets({
      sets: ['global'],
      shouldCheck: false,
    });
    const { usedTokenSet } = store.getState().tokenState;
    expect(usedTokenSet).toEqual({
      global: TokenSetStatus.DISABLED,
    });
  });

  it('can toggle many token sets (enabled)', () => {
    store.dispatch.tokenState.toggleManyTokenSets({
      sets: ['global'],
      shouldCheck: true,
    });
    const { usedTokenSet } = store.getState().tokenState;
    expect(usedTokenSet).toEqual({
      global: TokenSetStatus.ENABLED,
    });
  });

  it('can toggle editProhibited', () => {
    store.dispatch.tokenState.setEditProhibited(true);
    const { editProhibited } = store.getState().tokenState;
    expect(editProhibited).toBe(true);
  });

  it('can set token data', () => {
    store.dispatch.tokenState.setTokenData({
      values: {},
      activeTheme: { [INTERNAL_THEMES_NO_GROUP]: 'base' },
      usedTokenSet: {
        global: TokenSetStatus.ENABLED,
      },
      themes: [
        {
          id: 'base',
          name: 'Base',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
          },
        },
      ],
    });
    const {
      tokens, themes, usedTokenSet,
    } = store.getState().tokenState;
    expect(tokens).toEqual({});
    expect(themes).toEqual([
      {
        id: 'base',
        name: 'Base',
        selectedTokenSets: {
        },
      },
    ]);
    expect(usedTokenSet).toEqual({});
  });

  it('delete all tokens in a group', async () => {
    await store.dispatch.tokenState.deleteTokenGroup({
      parent: 'global',
      path: 'font',
      type: 'sizing',
    });

    const { tokens } = store.getState().tokenState;
    expect(tokens.global).not.toContain({
      name: 'font.big',
      type: 'sizing',
      value: '24px',
    });
    expect(tokens.global).not.toContain({
      name: 'font.small',
      type: 'sizing',
      value: '12px',
    });
  });

  it('can delete a token set', () => {
    store.dispatch.tokenState.deleteTokenSet('global');
    const {
      tokens, usedTokenSet,
    } = store.getState().tokenState;

    const expectedTokens = {
      options: [
        {
          name: 'background',
          value: '$primary',
        },
      ],
    };
    expect(tokens).toEqual(expectedTokens);
    expect(usedTokenSet).toEqual({});

    // Expect that we indicate that the remote should update
    expect(mockedUpdateTokensOnSources).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTokensOnSources.mock.calls[0][0]).toMatchObject({
      tokenValues: expectedTokens,
      shouldUpdateRemote: true,
    });
  });

  it('can treat set a token set as source', () => {
    store.dispatch.tokenState.toggleTreatAsSource('global');
    const { usedTokenSet } = store.getState().tokenState;
    expect(usedTokenSet).toEqual({
      global: TokenSetStatus.SOURCE,
    });
  });

  it('can duplicate token set', () => {
    store.dispatch.tokenState.duplicateTokenSet('global_Copy', 'global');
    const { tokens, usedTokenSet } = store.getState().tokenState;

    const expectedTokens = [
      {
        name: 'primary',
        value: '1',
      },
      {
        name: 'alias',
        value: '$primary',
      },
      {
        name: 'primary50',
        value: '0.50',
      },
      {
        name: 'alias50',
        value: '$primary50',
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'shadow.mixed',
        type: 'boxShadow',
        description: 'the one with mixed shadows',
        value: shadowArray,
      },
      {
        name: 'font.big',
        type: 'sizing',
        value: '24px',
      },
      {
        name: 'font.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font.medium',
        type: 'fontSizes',
        value: '18px',
      },
      {
        name: 'font.alias',
        type: 'sizing',
        value: '$font.small',
      },
    ];

    expect(tokens.global_Copy).toEqual(expectedTokens);
    expect(usedTokenSet).toEqual({
      global: TokenSetStatus.ENABLED,
      global_Copy: TokenSetStatus.DISABLED,
    });
    // Expect that we indicate that the remote should update
    expect(mockedUpdateTokensOnSources).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTokensOnSources.mock.calls[0][0]).toMatchObject({
      tokenValues: {
        ...initialTokens,
        global_Copy: expectedTokens,
      },
      shouldUpdateRemote: true,
    });
  });

  it('will notify the UI if the token set to duplicate does not exist', () => {
    const notifyToUISpy = jest.spyOn(notifiers, 'notifyToUI');
    notifyToUISpy.mockReturnValueOnce();
    store.dispatch.tokenState.duplicateTokenSet('nonexistant_Copy', 'nonexistant');
    expect(notifyToUISpy).toBeCalledWith('Token set does not exist', { error: true });
  });

  it('can reset imported tokens', () => {
    store.dispatch.tokenState.setTokensFromStyles({
      colors: [
        {
          type: TokenTypes.COLOR,
          name: 'primary',
          value: '2',
        },
      ],
    });
    store.dispatch.tokenState.resetImportedTokens();
    const { importedTokens } = store.getState().tokenState;
    expect(importedTokens).toEqual({
      newTokens: [],
      updatedTokens: [],
    });
  });

  it('can create token', () => {
    store.dispatch.tokenState.createToken({
      name: 'test',
      parent: 'global',
      type: TokenTypes.COLOR,
      value: '#000000',
    });
    const { tokens } = store.getState().tokenState;
    const expectedTokens = [
      {
        name: 'primary',
        value: '1',
      },
      {
        name: 'alias',
        value: '$primary',
      },
      {
        name: 'primary50',
        value: '0.50',
      },
      {
        name: 'alias50',
        value: '$primary50',
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'shadow.mixed',
        type: 'boxShadow',
        description: 'the one with mixed shadows',
        value: shadowArray,
      },
      {
        name: 'font.big',
        type: 'sizing',
        value: '24px',
      },
      {
        name: 'font.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font.medium',
        type: 'fontSizes',
        value: '18px',
      },
      {
        name: 'font.alias',
        type: 'sizing',
        value: '$font.small',
      },
      {
        name: 'test',
        type: TokenTypes.COLOR,
        value: '#000000',
      },
    ];
    expect(tokens.global).toEqual(expectedTokens);

    // Expect that we indicate that the remote should update
    expect(mockedUpdateTokensOnSources).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTokensOnSources.mock.calls[0][0]).toMatchObject({
      tokenValues: {
        ...initialTokens,
        global: expectedTokens,
      },
      shouldUpdateRemote: true,
    });
  });

  it('can create a token with extensions', () => {
    store.dispatch.tokenState.createToken({
      name: 'test',
      parent: 'global',
      type: TokenTypes.COLOR,
      value: '#000000',
      $extensions: {
        'studio.tokens': {
          modify: {
            type: 'lighten',
            value: '0.5',
            space: 'sRGB',
          },
        },
      },
    });
    const { tokens } = store.getState().tokenState;
    const expectedTokens = [
      {
        name: 'primary',
        value: '1',
      },
      {
        name: 'alias',
        value: '$primary',
      },
      {
        name: 'primary50',
        value: '0.50',
      },
      {
        name: 'alias50',
        value: '$primary50',
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'shadow.mixed',
        type: 'boxShadow',
        description: 'the one with mixed shadows',
        value: shadowArray,
      },
      {
        name: 'font.big',
        type: 'sizing',
        value: '24px',
      },
      {
        name: 'font.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font.medium',
        type: 'fontSizes',
        value: '18px',
      },
      {
        name: 'font.alias',
        type: 'sizing',
        value: '$font.small',
      },
      {
        name: 'test',
        type: TokenTypes.COLOR,
        value: '#000000',
        $extensions: {
          'studio.tokens': {
            modify: {
              type: 'lighten',
              value: '0.5',
              space: 'sRGB',
            },
          },
        },
      },
    ];
    expect(tokens.global).toEqual(expectedTokens);

    // Expect that we indicate that the remote should update
    expect(mockedUpdateTokensOnSources).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTokensOnSources.mock.calls[0][0]).toMatchObject({
      tokenValues: {
        ...initialTokens,
        global: expectedTokens,
      },
      shouldUpdateRemote: true,
    });
  });

  it('should save tokens from json data', () => {
    store.dispatch.tokenState.setJSONData(JSON.stringify(
      {
        1: {
          value: 1,
          type: 'sizing',
        },
        header: {
          value: 3,
          type: 'borderRadius',
        },
        black: {
          100: {
            value: '#0b0101',
          },
          500: {
            value: '#130c0c',
          },
          type: 'color',
        },
      },
    ));
    const { tokens } = store.getState().tokenState;
    expect(tokens.global).toEqual([
      {
        name: '1',
        type: 'sizing',
        value: 1,
      },
      {
        name: 'header',
        type: 'borderRadius',
        value: 3,
      },
      {
        inheritTypeLevel: 2,
        name: 'black.100',
        type: 'color',
        value: '#0b0101',
      },
      {
        inheritTypeLevel: 2,
        name: 'black.500',
        type: 'color',
        value: '#130c0c',
      },
    ]);
  });

  it('can duplicate token', () => {
    store.dispatch.tokenState.duplicateToken({
      newName: 'primary-copy',
      oldName: 'primary',
      parent: 'global',
      value: '1',
      type: 'sizing',
      tokenSets: ['global', 'options'],
      $extensions: {
        'studio.tokens': {
          modify: {
            type: 'lighten',
            value: '0.5',
            space: 'sRGB',
          },
        },
      },
      shouldUpdate: true,
    });
    const { tokens } = store.getState().tokenState;
    const expectedGlobal = [
      {
        name: 'primary',
        value: '1',
      },
      {
        name: 'primary-copy',
        value: '1',
        type: 'sizing',
        $extensions: {
          'studio.tokens': {
            modify: {
              type: 'lighten',
              value: '0.5',
              space: 'sRGB',
            },
          },
        },
      },
      {
        name: 'alias',
        value: '$primary',
      },
      {
        name: 'primary50',
        value: '0.50',
      },
      {
        name: 'alias50',
        value: '$primary50',
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'shadow.mixed',
        type: 'boxShadow',
        description: 'the one with mixed shadows',
        value: shadowArray,
      },
      {
        name: 'font.big',
        type: 'sizing',
        value: '24px',
      },
      {
        name: 'font.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font.medium',
        type: 'fontSizes',
        value: '18px',
      },
      {
        name: 'font.alias',
        type: 'sizing',
        value: '$font.small',
      },
    ];
    const expectedOptions = [
      {
        name: 'background',
        value: '$primary',
      },
      {
        name: 'primary-copy',
        value: '1',
        type: 'sizing',
        $extensions: {
          'studio.tokens': {
            modify: {
              type: 'lighten',
              value: '0.5',
              space: 'sRGB',
            },
          },
        },
      },
    ];

    expect(tokens.global).toEqual(expectedGlobal);
    expect(tokens.options).toEqual(expectedOptions);

    // Expect that we indicate that the remote should update
    expect(mockedUpdateTokensOnSources).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTokensOnSources.mock.calls[0][0]).toMatchObject({
      tokenValues: {
        options: expectedOptions,
        global: expectedGlobal,
      },
      shouldUpdateRemote: true,
    });
  });

  it('can duplicate token without extension', () => {
    store.dispatch.tokenState.duplicateToken({
      newName: 'primary-copy',
      oldName: 'primary',
      parent: 'global',
      value: '1',
      type: 'sizing',
      tokenSets: ['global'],
    });
    const { tokens } = store.getState().tokenState;
    expect(tokens.global).toEqual([
      {
        name: 'primary',
        value: '1',
      },
      {
        name: 'primary-copy',
        value: '1',
        type: 'sizing',
      },
      {
        name: 'alias',
        value: '$primary',
      },
      {
        name: 'primary50',
        value: '0.50',
      },
      {
        name: 'alias50',
        value: '$primary50',
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'shadow.mixed',
        type: 'boxShadow',
        description: 'the one with mixed shadows',
        value: shadowArray,
      },
      {
        name: 'font.big',
        type: 'sizing',
        value: '24px',
      },
      {
        name: 'font.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font.medium',
        type: 'fontSizes',
        value: '18px',
      },
      {
        name: 'font.alias',
        type: 'sizing',
        value: '$font.small',
      },
    ]);
  });

  it('can delete token', () => {
    store.dispatch.tokenState.deleteToken({
      parent: 'global',
      path: 'font.big',
    });
    const { tokens } = store.getState().tokenState;
    const expectedTokens = [
      {
        name: 'primary',
        value: '1',
      },
      {
        name: 'alias',
        value: '$primary',
      },
      {
        name: 'primary50',
        value: '0.50',
      },
      {
        name: 'alias50',
        value: '$primary50',
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'shadow.mixed',
        type: 'boxShadow',
        description: 'the one with mixed shadows',
        value: shadowArray,
      },
      {
        name: 'font.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font.medium',
        type: 'fontSizes',
        value: '18px',
      },
      {
        name: 'font.alias',
        type: 'sizing',
        value: '$font.small',
      },
    ];
    expect(tokens.global).toEqual(expectedTokens);

    // Expect that we indicate that the remote should update
    expect(mockedUpdateTokensOnSources).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTokensOnSources.mock.calls[0][0]).toMatchObject({
      tokenValues: {
        ...initialTokens,
        global: expectedTokens,
      },
      shouldUpdateRemote: true,
    });
  });

  it('can rename token group', () => {
    store.dispatch.tokenState.renameTokenGroup({
      newName: 'text',
      oldName: 'font',
      parent: 'global',
      path: '',
      type: 'sizing',
    });
    const { tokens } = store.getState().tokenState;
    const expectedTokens = [
      {
        name: 'primary',
        value: '1',
      },
      {
        name: 'alias',
        value: '$primary',
      },
      {
        name: 'primary50',
        value: '0.50',
      },
      {
        name: 'alias50',
        value: '$primary50',
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'shadow.mixed',
        type: 'boxShadow',
        description: 'the one with mixed shadows',
        value: shadowArray,
      },
      {
        name: 'text.big',
        type: 'sizing',
        value: '24px',
      },
      {
        name: 'text.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font.medium',
        type: 'fontSizes',
        value: '18px',
      },
      {
        name: 'text.alias',
        type: 'sizing',
        value: '$text.small',
      },
    ];
    expect(tokens.global).toEqual(expectedTokens);
  });

  it('can duplicate token group', () => {
    store.dispatch.tokenState.duplicateTokenGroup({
      oldName: 'font',
      parent: 'global',
      newName: 'font-copy',
      type: 'sizing',
      tokenSets: ['global'],
    });
    const { tokens } = store.getState().tokenState;
    const expectedTokens = [
      {
        name: 'primary',
        value: '1',
      },
      {
        name: 'alias',
        value: '$primary',
      },
      {
        name: 'primary50',
        value: '0.50',
      },
      {
        name: 'alias50',
        value: '$primary50',
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'header 1',
        type: 'typography',
        value: {
          fontWeight: '400',
          fontSize: '16',
        },
      },
      {
        name: 'shadow.mixed',
        type: 'boxShadow',
        description: 'the one with mixed shadows',
        value: shadowArray,
      },
      {
        name: 'font.big',
        type: 'sizing',
        value: '24px',
      },
      {
        name: 'font.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font.medium',
        type: 'fontSizes',
        value: '18px',
      },
      {
        name: 'font.alias',
        type: 'sizing',
        value: '$font.small',
      },
      {
        name: 'font-copy.big',
        type: 'sizing',
        value: '24px',
      },
      {
        name: 'font-copy.small',
        type: 'sizing',
        value: '12px',
      },
      {
        name: 'font-copy.alias',
        type: 'sizing',
        value: '$font.small',
      },
    ];
    expect(tokens.global).toEqual(expectedTokens);

    // Expect that we indicate that the remote should update
    expect(mockedUpdateTokensOnSources).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTokensOnSources.mock.calls[0][0]).toMatchObject({
      tokenValues: {
        ...initialTokens,
        global: expectedTokens,
      },
      shouldUpdateRemote: true,
    });
  });

  it('should be able to update checkForChanges', () => {
    store.dispatch.tokenState.updateCheckForChanges(true);
    const { checkForChanges } = store.getState().tokenState;
    expect(checkForChanges).toEqual(true);
  });

  it('should be able to set collapsedTokens', () => {
    store.dispatch.tokenState.setCollapsedTokens(['color.gray', 'color.zinc', 'size']);
    const { collapsedTokens } = store.getState().tokenState;
    expect(collapsedTokens).toEqual(['color.gray', 'color.zinc', 'size']);
  });

  it('should be able to keep theme selected when there is a matching theme in themeList', () => {
    store.dispatch.tokenState.setTokenData({
      values: {
        global: [
          {
            name: 'primary',
            value: '1',
          },
        ],
      },
      themes: [
        {
          id: 'default',
          name: 'root',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
          },
        },
      ],
      activeTheme: { [INTERNAL_THEMES_NO_GROUP]: 'default' },
    });
    const { activeTheme } = store.getState().tokenState;
    expect(activeTheme).toEqual({ [INTERNAL_THEMES_NO_GROUP]: 'default' });
  });

  it('should be able to set activeTheme as null when there is no matching theme in themeList', () => {
    store.dispatch.tokenState.setTokenData({
      values: {
        global: [
          {
            name: 'primary',
            value: '1',
          },
        ],
      },
      themes: [
        {
          id: 'secondary',
          name: 'root',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
          },
        },
      ],
      activeTheme: { [INTERNAL_THEMES_NO_GROUP]: 'default' },
    });
    const { activeTheme } = store.getState().tokenState;
    expect(activeTheme).toEqual({});
  });

  it('should be able to keep activeTokenSet when there is a matching tokenSet in tokenList', () => {
    store.dispatch.tokenState.setTokenData({
      values: {
        global: [
          {
            name: 'primary',
            value: '1',
          },
        ],
      },
      themes: [
        {
          id: 'default',
          name: 'root',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
          },
        },
      ],
    });
    const { activeTokenSet } = store.getState().tokenState;
    expect(activeTokenSet).toBe('global');
  });

  it('should be able to set activeTheme as global when there is no tokenSet', () => {
    store.dispatch.tokenState.setTokenData({
      values: [
        {
          name: 'primary',
          value: '1',
        },
      ],
      themes: [
        {
          id: 'default',
          name: 'root',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
          },
        },
      ],
      shouldUpdate: true,
    });
    const { activeTokenSet } = store.getState().tokenState;
    expect(activeTokenSet).toBe('global');
  });

  it('can set tokens', () => {
    store.dispatch.tokenState.setTokens({
      global: [
        {
          type: TokenTypes.COLOR,
          value: '#ff0000',
          name: 'red',
        },
        {
          type: TokenTypes.COLOR,
          value: '#000000',
          name: 'black',
        },
        {
          type: TokenTypes.BORDER_RADIUS,
          value: '12px',
          name: 'rounded.md',
        },
      ],
    });
    const { tokens } = store.getState().tokenState;
    const expectedTokens = [
      {
        type: TokenTypes.COLOR,
        value: '#ff0000',
        name: 'red',
      },
      {
        type: TokenTypes.COLOR,
        value: '#000000',
        name: 'black',
      },
      {
        type: TokenTypes.BORDER_RADIUS,
        value: '12px',
        name: 'rounded.md',
      },
    ];
    expect(tokens.global).toEqual(expectedTokens);
  });

  it('can set usedTokenSets', async () => {
    await store.dispatch.tokenState.setUsedTokenSet({
      global: TokenSetStatus.DISABLED,
    });

    const { usedTokenSet } = store.getState().tokenState;
    expect(usedTokenSet).toEqual({
      global: 'disabled',
    });
  });

  it('can set themes', async () => {
    await store.dispatch.tokenState.setThemes([
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {
          global: TokenSetStatus.ENABLED,
        },
        $figmaStyleReferences: {},
      },
    ]);

    const { themes } = store.getState().tokenState;
    expect(themes).toEqual([
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {
          global: TokenSetStatus.ENABLED,
        },
        $figmaStyleReferences: {},
      },
    ]);
  });

  it('should be able to set changedState', () => {
    store.dispatch.tokenState.setChangedState({
      tokens: {
        global: [
          {
            name: 'primary',
            value: '1',
          },
          {
            name: 'alias',
            value: '$primary',
          },
          {
            name: 'primary50',
            value: '0.50',
          },
          {
            name: 'alias50',
            value: '$primary50',
          },
          {
            name: 'header 1',
            type: 'typography',
            value: {
              fontWeight: '400',
              fontSize: '16',
            },
          },
          {
            name: 'header 1',
            type: 'typography',
            value: {
              fontWeight: '400',
              fontSize: '16',
            },
          },
          {
            name: 'shadow.mixed',
            type: 'boxShadow',
            description: 'the one with mixed shadows',
            value: shadowArray,
          },
          {
            name: 'font.big',
            type: 'sizing',
            value: '24px',
          },
          {
            name: 'font.small',
            type: 'sizing',
            value: '14px',
          },
          {
            name: 'font.medium-update',
            type: 'fontSizes',
            value: '18px',
          },
        ],
      },
      themes: [],
    });
    const { changedState } = store.getState().tokenState;
    expect(changedState).toEqual({
      tokens: {
        global: [
          {
            importType: 'NEW',
            name: 'font.medium-update',
            type: 'fontSizes',
            value: '18px',
          },
          {
            importType: 'UPDATE',
            name: 'font.small',
            oldValue: '12px',
            type: 'sizing',
            value: '14px',
          },
          {
            importType: 'REMOVE',
            name: 'font.medium',
            type: 'fontSizes',
            value: '18px',
          },
          {
            importType: 'REMOVE',
            name: 'font.alias',
            type: 'sizing',
            value: '$font.small',
          },
        ],
        options: [
          {
            importType: 'REMOVE',
            name: 'background',
            value: '$primary',
          },
        ],
      },
      themes: [],
      metadata: null,
    });
  });

  it('should be able to reset changedState', () => {
    store.dispatch.tokenState.resetChangedState();
    const { changedState } = store.getState().tokenState;
    expect(changedState).toEqual({
      tokens: {},
      themes: [],
    });
  });

  it('should be able to set remoteData', () => {
    store.dispatch.tokenState.setRemoteData({
      tokens: {
        global: [
          {
            importType: 'NEW',
            name: 'font.medium-update',
            type: 'fontSizes',
            value: '18px',
          },
          {
            importType: 'UPDATE',
            name: 'font.small',
            oldValue: '12px',
            type: 'sizing',
            value: '14px',
          },
          {
            importType: 'REMOVE',
            name: 'font.medium',
            type: 'fontSizes',
            value: '18px',
          },
          {
            importType: 'REMOVE',
            name: 'font.alias',
            type: 'sizing',
            value: '$font.small',
          },
        ],
      },
      themes: [],
      metadata: null,
    });
    const { remoteData } = store.getState().tokenState;
    expect(remoteData).toEqual({
      tokens: {
        global: [
          {
            importType: 'NEW',
            name: 'font.medium-update',
            type: 'fontSizes',
            value: '18px',
          },
          {
            importType: 'UPDATE',
            name: 'font.small',
            oldValue: '12px',
            type: 'sizing',
            value: '14px',
          },
          {
            importType: 'REMOVE',
            name: 'font.medium',
            type: 'fontSizes',
            value: '18px',
          },
          {
            importType: 'REMOVE',
            name: 'font.alias',
            type: 'sizing',
            value: '$font.small',
          },
        ],
      },
      themes: [],
      metadata: null,

    });
  });
});
