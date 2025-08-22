import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { ColorModifier } from '@/types/Modifier';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { models } from '../../index';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  CREATE_THEME_GROUP_MUTATION,
  CREATE_TOKEN_SET_MUTATION,
  DELETE_THEME_GROUP_MUTATION,
  DELETE_TOKEN_SET_MUTATION,
  UPDATE_THEME_GROUP_MUTATION,
  UPDATE_TOKEN_SET_MUTATION,
  UPDATE_TOKEN_SET_ORDER_MUTATION,
} from '@/storage/tokensStudio/graphql';
import { DeleteTokenPayload, UpdateTokenPayload } from '@/types/payloads';
import * as notifiers from '@/plugin/notifiers';
import { middlewares } from '@/app/store/middlewares';

const DEFAULT_BRANCH = 'main';

type Store = RematchStore<RootModel, Record<string, never>>;

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

jest.mock('../../../updateSources', () => jest.fn());

const notifyToUISpy = jest.spyOn(notifiers, 'notifyToUI');

const initialTokens = {
  global: [
    {
      name: 'primary',
      value: '1',
      type: 'sizing',
      description: 'primary description',
      $extensions: undefined,
    },
    {
      name: 'alias',
      value: '$primary',
      type: 'sizing',
      description: 'alias description',
      $extensions: undefined,
    },
    {
      name: 'header',
      type: 'typography',
      value: {
        fontWeight: '400',
        fontSize: '16',
      },
      description: 'header description',
      $extensions: undefined,
    },
    {
      name: 'colors.blue.50',
      type: 'color',
      value: '#FCFDFF',
      $extensions: {
        'studio.tokens': {
          modify: {
            space: 'hsl',
            type: 'darken',
            value: '{colors.modifier-ramp.10}',
          },
        },
      },
      description: 'blue 50 description',
    },
  ],
  options: [
    {
      name: 'background',
      value: '$primary',
      type: 'sizing',
      description: 'background description',
      $extensions: undefined,
    },
  ],
  colors: [
    {
      name: 'blue',
      value: '#0000FF',
      type: 'color',
      description: 'blue description',
      $extensions: undefined,
    },
  ],
};

const initialRawTokensDTCG = {
  global: {
    alias: {
      $name: 'alias',
      $value: '$primary',
      $type: 'sizing',
      $description: 'alias description',
      $extensions: undefined,
    },
    colors: {
      blue: {
        50: {
          $name: 'colors.blue.50',
          $type: 'color',
          $value: '#FCFDFF',
          $description: 'blue 50 description',
          $extensions: {
            'studio.tokens': {
              modify: {
                space: 'hsl',
                type: 'darken',
                value: '{colors.modifier-ramp.10}',
              },
            },
          },
        },
      },
    },
    header: {
      $name: 'header',
      $type: 'typography',
      $value: {
        fontWeight: '400',
        fontSize: '16',
      },
      $extensions: undefined,
      $description: 'header description',
    },
    primary: {
      $name: 'primary',
      $value: '1',
      $type: 'sizing',
      $description: 'primary description',
      $extensions: undefined,
    },
  },
  options: {
    background: {
      $name: 'background',
      $value: '$primary',
      $type: 'sizing',
      $description: 'background description',
      $extensions: undefined,
    },
  },
  colors: {
    blue: {
      $name: 'blue',
      $value: '#0000FF',
      $type: 'color',
      $description: 'blue description',
      $extensions: undefined,
    },
  },
};

function delay(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const mockQuery = jest.fn();
const mockMutate = jest.fn(() => Promise.resolve({ data: {} }));

jest.mock('@tokens-studio/sdk', () => ({
  create: jest.fn(() => ({
    query: mockQuery,
    mutate: mockMutate,
  })),
  Configuration: {
    setAPIKey: jest.fn(),
  },
  gql: jest.fn(),
}));

// Mock StudioConfigurationService to prevent network calls during testing
jest.mock('@/storage/tokensStudio/StudioConfigurationService', () => ({
  StudioConfigurationService: {
    getInstance: jest.fn(() => ({
      getGraphQLHost: jest.fn().mockResolvedValue('graphql.app.tokens.studio'),
      discoverConfiguration: jest.fn().mockResolvedValue({
        legacy_graphql_endpoint: 'graphql.app.tokens.studio',
        auth_domain: 'https://auth.app.tokens.studio',
        frontend_base_url: 'https://app.tokens.studio',
      }),
    })),
  },
}));

// Mock shouldUseSecureConnection utility
jest.mock('@/utils/shouldUseSecureConnection', () => ({
  shouldUseSecureConnection: jest.fn().mockReturnValue(true),
}));

// Mock Sentry to prevent transaction errors
jest.mock('@sentry/react', () => ({
  Replay: jest.fn().mockImplementation(() => ({})),
  init: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('@sentry/browser', () => ({
  startTransaction: jest.fn(() => ({
    startChild: jest.fn(() => ({
      finish: jest.fn(),
      setStatus: jest.fn(),
    })),
    finish: jest.fn(),
    setMeasurement: jest.fn(),
  })),
  getCurrentHub: jest.fn(() => ({
    configureScope: jest.fn(),
  })),
}));

const storeInitialState = {
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
      uiState: {
        api: {
          id: 'projectId',
          orgId: 'orgId',
          provider: StorageProviderType.TOKENS_STUDIO,
        },
        storageType: {
          provider: StorageProviderType.TOKENS_STUDIO,
        },
      },
      settings: {
        updateRemote: true,
        updateOnChange: true,
        storeTokenIdInJsonEditor: false,
      },
    },
    middlewares,
  },
  models,
};

describe('Tokens Studio sync', () => {
  let store: Store;

  beforeEach(() => {
    store = init<RootModel>(storeInitialState);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      parent: 'global',
      name: 'secondary',
      description: 'secondary description',
      value: '#ff00000',
      type: TokenTypes.COLOR,
      $extensions: {
        'studio.tokens': {
          modify: {
            type: 'darken',
            value: '0.3',
            space: 'lch',
          } as ColorModifier,
        },
      },
    },
    {
      parent: 'global',
      name: 'newSizing',
      description: 'newSizing description',
      value: '24px',
      type: TokenTypes.SIZING,
    },
    {
      parent: 'global',
      name: 'newBoxShadow',
      description: 'newBoxShadow description',
      value: [
        {
          color: '#e63d3d',
          type: 'innerShadow',
          x: '2px',
          y: '2px',
        },
      ],
      type: TokenTypes.BOX_SHADOW,
    },
    {
      parent: 'global',
      name: 'newTypography',
      description: 'newTypography description',
      value: {
        fontFamily: 'Arial',
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.4',
      },
      type: TokenTypes.TYPOGRAPHY,
    },
    {
      parent: 'global',
      name: 'newComposition',
      description: 'newComposition description',
      value: {
        width: '100px',
        height: '200px',
      },
      type: TokenTypes.COMPOSITION,
    },
  ])('Creates a new $type token', async (input) => {
    store.dispatch.tokenState.createToken(input as UpdateTokenPayload);

    await delay(500);

    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: UPDATE_TOKEN_SET_MUTATION,
      variables: {
        project: 'projectId',
        organization: 'orgId',
        input: {
          newPath: undefined,
          path: input.parent,
          raw: {
            ...initialRawTokensDTCG[input.parent],
            [input.name]: {
              $name: input.name,
              $description: input.description,
              $value: input.value,
              $type: input.type,
              $extensions: input.$extensions,
            },
          },
        },
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set updated in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    await delay();

    const { tokens } = store.getState().tokenState;
    const createdToken = tokens.global.find((token) => token.name === input.name);

    expect(createdToken).toBeDefined();
  });

  it('Updates an existing token', async () => {
    const tokenData = {
      name: 'primary',
      description: 'updated description for primary',
      type: 'sizing',
      value: '22px',
      parent: 'global',
      $extensions: undefined,
    };

    store.dispatch.tokenState.editToken({ ...tokenData, shouldUpdate: true } as UpdateTokenPayload);

    await delay(500);

    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: UPDATE_TOKEN_SET_MUTATION,
      variables: {
        project: 'projectId',
        organization: 'orgId',
        input: {
          newPath: undefined,
          path: tokenData.parent,
          raw: {
            ...initialRawTokensDTCG[tokenData.parent],
            [tokenData.name]: {
              $name: tokenData.name,
              $description: tokenData.description,
              $value: tokenData.value,
              $type: tokenData.type,
              $extensions: {
                'studio.tokens': {},
              },
            },
          },
        },
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set updated in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Deletes a token', async () => {
    const deleteTokenPayload = { parent: 'global', path: 'header' } as DeleteTokenPayload;
    store.dispatch.tokenState.deleteToken(deleteTokenPayload);

    await delay(500);

    const newSetRaw = {
      ...initialRawTokensDTCG[deleteTokenPayload.parent],
    };
    delete newSetRaw[deleteTokenPayload.path];

    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: UPDATE_TOKEN_SET_MUTATION,
      variables: {
        project: 'projectId',
        organization: 'orgId',
        input: {
          newPath: undefined,
          path: deleteTokenPayload.parent,
          raw: newSetRaw,
        },
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set updated in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Creates a token set', async () => {
    store.dispatch.tokenState.addTokenSet('newTokenSet');

    await delay(500);

    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: CREATE_TOKEN_SET_MUTATION,
      variables: {
        project: 'projectId',
        organization: 'orgId',
        input: {
          path: 'newTokenSet',
          orderIndex: 4,
        },
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set added in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Renames a token set', async () => {
    store.dispatch.tokenState.renameTokenSet({
      oldName: 'global',
      newName: 'newGlobal',
    });

    await delay(500);

    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: UPDATE_TOKEN_SET_MUTATION,
      variables: {
        project: 'projectId',
        organization: 'orgId',
        input: {
          path: 'global',
          newPath: 'newGlobal',
        },
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set updated in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Deletes a token set', async () => {
    store.dispatch.tokenState.deleteTokenSet('global');

    await delay(500);

    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: DELETE_TOKEN_SET_MUTATION,
      variables: {
        project: 'projectId',
        organization: 'orgId',
        path: 'global',
        branch: DEFAULT_BRANCH,
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set deleted from Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Updates token set order', async () => {
    store.dispatch.tokenState.setTokenSetOrder(['global', 'colors', 'options']);

    await delay(500);

    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: UPDATE_TOKEN_SET_ORDER_MUTATION,
      variables: {
        project: 'projectId',
        organization: 'orgId',
        updates: [
          { path: 'global', orderIndex: 0 },
          { path: 'colors', orderIndex: 1 },
          { path: 'options', orderIndex: 2 },
        ],
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set order updated in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  describe('Theme group operations', () => {
    const existingTheme = {
      id: 'themeId',
      name: 'themeName',
      group: 'themeGroup',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      figmaVariableReferences: undefined,
      figmaStyleReferences: undefined,
    };

    beforeEach(() => {
      store = init<RootModel>({
        ...storeInitialState,
        redux: {
          ...storeInitialState.redux,
          initialState: {
            ...storeInitialState.redux.initialState,
            tokenState: {
              ...storeInitialState.redux.initialState.tokenState,
              themes: [existingTheme],
            },
          },
        },
      });
    });

    it('Creates theme group', async () => {
      const themeData = {
        name: 'newTheme',
        group: 'newThemeGroup',
        selectedTokenSets: { global: TokenSetStatus.ENABLED },
      };

      store.dispatch.tokenState.saveTheme(themeData);

      await delay(500);

      expect(mockMutate).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith({
        mutation: CREATE_THEME_GROUP_MUTATION,
        variables: {
          project: 'projectId',
          organization: 'orgId',
          branch: DEFAULT_BRANCH,
          input: {
            name: themeData.group,
            options: [
              {
                name: themeData.name,
                selectedTokenSets: themeData.selectedTokenSets,
                figmaStyleReferences: {},
                figmaVariableReferences: undefined,
              },
            ],
          },
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group created in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      const { themes } = store.getState().tokenState;
      const createdTheme = themes.find((theme) => theme.name === themeData.name);

      expect(createdTheme).toBeDefined();
    });

    it('Creates a new theme in an existing theme group', async () => {
      const newThemeData = {
        name: 'newTheme',
        group: 'themeGroup',
        selectedTokenSets: { options: TokenSetStatus.ENABLED },
      };

      store.dispatch.tokenState.saveTheme(newThemeData);

      await delay(500);

      expect(mockMutate).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith({
        mutation: UPDATE_THEME_GROUP_MUTATION,
        variables: {
          project: 'projectId',
          organization: 'orgId',
          input: {
            name: newThemeData.group,
            options: [
              {
                name: existingTheme.name,
                selectedTokenSets: existingTheme.selectedTokenSets,
                figmaStyleReferences: undefined,
                figmaVariableReferences: undefined,
              },
              {
                name: newThemeData.name,
                selectedTokenSets: newThemeData.selectedTokenSets,
                figmaStyleReferences: {},
                figmaVariableReferences: undefined,
              },
            ],
          },
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group updated in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      const { themes } = store.getState().tokenState;

      expect(themes.length).toEqual(2);
      const createdTheme = themes.find((theme) => theme.name === newThemeData.name);

      expect(createdTheme).toBeDefined();
    });

    it('Updates an existing theme', async () => {
      const updatedThemeData = {
        name: 'themeName',
        id: 'themeId',
        group: 'themeGroup',
        meta: {
          oldName: 'themeName',
          oldGroup: 'themeGroup',
        },
        selectedTokenSets: { options: TokenSetStatus.ENABLED },
      };

      store.dispatch.tokenState.saveTheme(updatedThemeData);

      await delay(500);

      expect(mockMutate).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith({
        mutation: UPDATE_THEME_GROUP_MUTATION,
        variables: {
          project: 'projectId',
          organization: 'orgId',
          input: {
            name: updatedThemeData.group,
            options: [
              {
                name: updatedThemeData.name,
                selectedTokenSets: updatedThemeData.selectedTokenSets,
                figmaStyleReferences: {},
                figmaVariableReferences: undefined,
              },
            ],
          },
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group updated in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('Moving a theme to a new theme group creates the new theme group and removes the old one', async () => {
      const updatedThemeData = {
        name: 'themeName',
        group: 'newThemeGroup',
        id: 'themeId',
        meta: {
          oldName: 'themeName',
          oldGroup: 'themeGroup',
        },
        selectedTokenSets: { options: TokenSetStatus.ENABLED },
      };

      store.dispatch.tokenState.saveTheme(updatedThemeData);

      await delay(500);

      expect(mockMutate).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith({
        mutation: CREATE_THEME_GROUP_MUTATION,
        variables: {
          project: 'projectId',
          organization: 'orgId',
          branch: DEFAULT_BRANCH,
          input: {
            name: updatedThemeData.group,
            options: [
              {
                name: updatedThemeData.name,
                selectedTokenSets: updatedThemeData.selectedTokenSets,
                figmaStyleReferences: {},
              },
            ],
          },
        },
      });

      await delay(100);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: DELETE_THEME_GROUP_MUTATION,
        variables: {
          project: 'projectId',
          organization: 'orgId',
          branch: DEFAULT_BRANCH,
          themeGroupName: existingTheme.group,
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group created in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('Deleting the last theme in a theme group deletes the theme group', async () => {
      store.dispatch.tokenState.deleteTheme(existingTheme.id);

      await delay(500);

      expect(mockMutate).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith({
        mutation: DELETE_THEME_GROUP_MUTATION,
        variables: {
          project: 'projectId',
          organization: 'orgId',
          branch: DEFAULT_BRANCH,
          themeGroupName: existingTheme.group,
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group deleted from Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      const { themes } = store.getState().tokenState;

      expect(themes.length).toEqual(0);
    });

    it('Deletes a theme from a theme group', async () => {
      store = init<RootModel>({
        ...storeInitialState,
        redux: {
          ...storeInitialState.redux,
          initialState: {
            ...storeInitialState.redux.initialState,
            tokenState: {
              ...storeInitialState.redux.initialState.tokenState,
              themes: [
                existingTheme,
                {
                  id: 'themeId2',
                  name: 'themeName2',
                  group: 'themeGroup',
                  selectedTokenSets: { options: TokenSetStatus.ENABLED },
                  figmaVariableReferences: undefined,
                  figmaStyleReferences: undefined,
                },
              ],
            },
          },
        },
      });

      store.dispatch.tokenState.deleteTheme('themeId2');

      await delay(500);

      expect(mockMutate).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith({
        mutation: UPDATE_THEME_GROUP_MUTATION,
        variables: {
          project: 'projectId',
          organization: 'orgId',
          input: {
            name: existingTheme.group,
            options: [
              {
                name: existingTheme.name,
                selectedTokenSets: existingTheme.selectedTokenSets,
                figmaStyleReferences: undefined,
                figmaVariableReferences: undefined,
              },
            ],
          },
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group updated in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      const { themes } = store.getState().tokenState;
      const deletedTheme = themes.find((theme) => theme.id === 'themeId2');

      expect(deletedTheme).toBeUndefined();
      expect(themes.length).toEqual(1);
    });
  });
});

describe('Tokens Studio sync - Api provider is not Tokens Studio', () => {
  let store: Store;

  beforeEach(() => {
    store = init<RootModel>({
      ...storeInitialState,
      redux: {
        initialState: {
          ...storeInitialState.redux.initialState,
          uiState: {
            ...storeInitialState.redux.initialState.uiState,
            api: {
              ...storeInitialState.redux.initialState.uiState.api,
              provider: StorageProviderType.LOCAL,
            },
          },
        },
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Do not sync create token if provider is not Tokens Studio', async () => {
    store.dispatch.tokenState.createToken({
      name: 'brand.newColor',
      description: 'newColor description',
      parent: 'global',
      value: '#ff00000',
      type: TokenTypes.COLOR,
    });

    await delay(500);

    expect(mockMutate).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Do not sync create token set if provider is not Tokens Studio', async () => {
    store.dispatch.tokenState.addTokenSet('newTokenSet');

    await delay(500);

    expect(mockMutate).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
