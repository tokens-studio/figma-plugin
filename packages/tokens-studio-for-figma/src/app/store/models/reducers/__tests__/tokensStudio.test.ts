import { init, RematchStore } from '@rematch/core';
import { Graphql } from '@tokens-studio/sdk';
import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { RootModel } from '@/types/RootModel';
import { ColorModifier } from '@/types/Modifier';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { models } from '../../index';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  CREATE_THEME_GROUP_MUTATION, CREATE_TOKEN_MUTATION, CREATE_TOKEN_SET_MUTATION, DELETE_THEME_GROUP_MUTATION, DELETE_TOKEN_MUTATION, DELETE_TOKEN_SET_MUTATION, UPDATE_THEME_GROUP_MUTATION, UPDATE_TOKEN_MUTATION, UPDATE_TOKEN_SET_MUTATION, UPDATE_TOKEN_SET_ORDER_MUTATION,
} from '@/storage/tokensStudio/graphql';
import { DeleteTokenPayload, UpdateTokenPayload } from '@/types/payloads';
import * as notifiers from '@/plugin/notifiers';
import { middlewares } from '@/app/store/middlewares';

type Store = RematchStore<RootModel, Record<string, never>>;

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

jest.mock('../../../updateSources', () => jest.fn());

const notifyToUISpy = jest.spyOn(notifiers, 'notifyToUI');

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
      name: 'tokenWithUrn',
      value: '#000000',
      type: 'color',
      $extensions: {
        'studio.tokens': {
          urn: 'existingTokenUrn',
        },
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
    },
  ],
  options: [
    {
      name: 'background',
      value: '$primary',
    },
  ],
  colors: [
    {
      name: 'blue',
      value: '#0000FF',
    },
  ],
};

function delay(ms = 0) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

jest.mock('@tokens-studio/sdk', () => ({
  Graphql: {
    exec: jest.fn(),
    op: jest.fn(),
  },
  Configuration: {
    setAPIKey: jest.fn(),
  },
}));

const storeInitialState = {
  redux: {
    initialState: {
      tokenState: {
        tokens: initialTokens,
        tokenSetMetadata: {
          global: {
            id: 'globalUrn',
          },
          options: {
            id: 'optionsUrn',
          },
          colors: {
            id: 'colorsUrn',
          },
        },
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
          id: 'apiId',
          secret: 'apiSecret',
          provider: AVAILABLE_PROVIDERS.TOKENS_STUDIO as StorageProviderType.TOKENS_STUDIO,
        },
        storageType: {
          provider: AVAILABLE_PROVIDERS.TOKENS_STUDIO as StorageProviderType.TOKENS_STUDIO,
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
  let graphqlExecSpy: jest.SpyInstance;
  let graphqlOpSpy: jest.SpyInstance;

  beforeEach(() => {
    store = init<RootModel>(storeInitialState);

    graphqlExecSpy = jest.spyOn(Graphql, 'exec');
    graphqlOpSpy = jest.spyOn(Graphql, 'op');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      type: TokenTypes.COLOR,
      valueObj: {
        value: '#ff00000',
      },
      input: {
        name: 'brand.newColor',
        description: 'newColor description',
        parent: 'global',
        value: '#ff00000',
        $extensions: {
          'studio.tokens': {
            modify: {
              type: 'darken',
              value: '0.3',
              space: 'lch',
            } as ColorModifier,
          },
        },
        type: TokenTypes.COLOR,
      },
    },
    {
      type: TokenTypes.SIZING,
      valueObj: {
        value: '24px',
      },
      input: {
        name: 'brand.newSizing',
        description: 'newSizing description',
        parent: 'global',
        value: '24px',
        type: TokenTypes.SIZING,
      },
    },
    {
      type: TokenTypes.BOX_SHADOW,
      valueObj: {
        boxShadow: [{
          color: '#e63d3d',
          type: 'innerShadow',
          x: '2px',
          y: '2px',
        }],
      },
      input: {
        name: 'brand.newBoxShadow',
        description: 'newBoxShadow description',
        parent: 'global',
        value: [{
          color: '#e63d3d',
          type: 'innerShadow',
          x: '2px',
          y: '2px',
        }],
        type: TokenTypes.BOX_SHADOW,
      },
    },
    {
      type: TokenTypes.TYPOGRAPHY,
      valueObj: {
        typography: {
          fontFamily: 'Arial',
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1.4',
        },
      },
      input: {
        name: 'brand.newTypography',
        description: 'newTypography description',
        parent: 'global',
        value: {
          fontFamily: 'Arial',
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1.4',
        },
        type: TokenTypes.TYPOGRAPHY,
      },
    },
    {
      type: TokenTypes.COMPOSITION,
      valueObj: {
        composition: {
          width: '100px',
          height: '200px',
        },
      },
      input: {
        name: 'brand.newComposition',
        description: 'newComposition description',
        parent: 'global',
        value: {
          width: '100px',
          height: '200px',
        },
        type: TokenTypes.COMPOSITION,
      },
    },
  ])('Creates a new $type token and save its new URN', async ({ input, valueObj }) => {
    graphqlExecSpy.mockImplementation(() => Promise.resolve({
      data: {
        createToken: {
          ...input,
          urn: `createdTokenUrn-${input.name}`,
        },
      },
    }));

    await store.dispatch.tokenState.createToken(input as UpdateTokenPayload);

    expect(graphqlExecSpy).toHaveBeenCalled();
    expect(graphqlOpSpy).toHaveBeenCalledWith(CREATE_TOKEN_MUTATION, {
      set: 'globalUrn',
      input: {
        name: input.name,
        type: input.type,
        description: input.description,
        extensions: JSON.stringify(input.$extensions),
        ...valueObj,
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token pushed to Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    await delay();

    const { tokens } = store.getState().tokenState;
    const createdToken = tokens.global.find((token) => token.name === input.name);

    expect(createdToken).toBeDefined();
    expect(createdToken?.$extensions?.['studio.tokens']?.urn).toEqual(`createdTokenUrn-${input.name}`);
  });

  it('Gives an error when trying to create a new token on which the parent doesn\'t have an id', async () => {
    store = init<RootModel>({
      ...storeInitialState,
      redux: {
        ...storeInitialState.redux,
        initialState: {
          ...storeInitialState.redux.initialState,
          tokenState: {
            ...storeInitialState.redux.initialState.tokenState,
            tokenSetMetadata: {
              ...storeInitialState.redux.initialState.tokenState.tokenSetMetadata,
              options: undefined,
            },
          },
        },
      },
    });

    await store.dispatch.tokenState.createToken({
      name: 'brand.newColor',
      description: 'newColor description',
      parent: 'options',
      value: '#ff00000',
      type: TokenTypes.COLOR,
    });

    expect(graphqlExecSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('Updates an existing token', async () => {
    const tokenData = {
      name: 'tokenWithUrn',
      description: 'updated description',
      type: 'color',
      $extensions: {
        'studio.tokens': {
          urn: 'existingTokenUrn',
        },
      },
      value: '#ff00000',
      parent: 'global',
    };

    graphqlExecSpy.mockImplementation(() => Promise.resolve({
      data: {
        updateToken: tokenData,
      },
    }));

    await store.dispatch.tokenState.editToken({ ...tokenData, shouldUpdate: true } as UpdateTokenPayload);

    expect(graphqlExecSpy).toHaveBeenCalled();
    expect(graphqlOpSpy).toHaveBeenCalledWith(UPDATE_TOKEN_MUTATION, {
      urn: 'existingTokenUrn',
      input: {
        name: tokenData.name,
        description: tokenData.description,
        value: tokenData.value,
        extensions: JSON.stringify(tokenData.$extensions),
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token updated in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Deletes a token', async () => {
    graphqlExecSpy.mockImplementation(() => Promise.resolve({
      data: {
        deleteToken: null,
      },
    }));

    await store.dispatch.tokenState.deleteToken({ parent: 'global', sourceId: 'existingTokenUrn' } as DeleteTokenPayload);

    expect(graphqlExecSpy).toHaveBeenCalled();
    expect(graphqlOpSpy).toHaveBeenCalledWith(DELETE_TOKEN_MUTATION, {
      urn: 'existingTokenUrn',
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token removed from Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Creates a token set', async () => {
    graphqlExecSpy.mockImplementation(() => Promise.resolve({
      data: {
        createTokenSet: {
          name: 'newTokenSet',
          urn: 'newTokenSetUrn',
        },
      },
    }));

    await store.dispatch.tokenState.addTokenSet('newTokenSet');

    expect(graphqlExecSpy).toHaveBeenCalled();
    expect(graphqlOpSpy).toHaveBeenCalledWith(CREATE_TOKEN_SET_MUTATION, {
      project: 'apiId',
      input: {
        name: 'newTokenSet',
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set added in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    await delay();

    const { tokenSetMetadata } = store.getState().tokenState;

    expect(tokenSetMetadata.newTokenSet).toEqual({ id: 'newTokenSetUrn' });
  });

  it('Updates a token set', async () => {
    graphqlExecSpy.mockImplementation(() => Promise.resolve({
      data: {
        updateTokenSet: {
          name: 'newGlobal',
          urn: 'globalUrn',
        },
      },
    }));

    await store.dispatch.tokenState.renameTokenSet({
      oldName: 'global',
      newName: 'newGlobal',
    });

    expect(graphqlExecSpy).toHaveBeenCalled();
    expect(graphqlOpSpy).toHaveBeenCalledWith(UPDATE_TOKEN_SET_MUTATION, {
      urn: 'globalUrn',
      input: {
        name: 'newGlobal',
      },
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set updated in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    await delay();

    const { tokenSetMetadata } = store.getState().tokenState;

    expect(tokenSetMetadata.global).toBeUndefined();
    expect(tokenSetMetadata.newGlobal).toEqual({ id: 'globalUrn' });
  });

  it('Deletes a token set', async () => {
    graphqlExecSpy.mockImplementation(() => Promise.resolve({
      data: {
        deleteTokenSet: {
          name: 'global',
          urn: 'globalUrn',
        },
      },
    }));

    await store.dispatch.tokenState.deleteTokenSet('global');

    expect(graphqlExecSpy).toHaveBeenCalled();
    expect(graphqlOpSpy).toHaveBeenCalledWith(DELETE_TOKEN_SET_MUTATION, {
      urn: 'globalUrn',
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set deleted from Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    await delay();

    const { tokenSetMetadata } = store.getState().tokenState;

    expect(tokenSetMetadata.global).toBeUndefined();
  });

  it('Updates token set order', async () => {
    graphqlExecSpy.mockImplementation(() => Promise.resolve({
      data: {
        updateTokenSetOrder: null,
      },
    }));

    await store.dispatch.tokenState.setTokenSetOrder(['global', 'colors', 'options']);

    expect(graphqlExecSpy).toHaveBeenCalled();
    expect(graphqlOpSpy).toHaveBeenCalledWith(UPDATE_TOKEN_SET_ORDER_MUTATION, {
      input: [
        { urn: 'globalUrn', orderIndex: '0' },
        { urn: 'colorsUrn', orderIndex: '1' },
        { urn: 'optionsUrn', orderIndex: '2' }],
    });

    expect(notifyToUISpy).toHaveBeenCalledWith('Token set order updated in Tokens Studio', { error: false });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  describe('Theme group operations', () => {
    const existingTheme = {
      id: 'themeUrn',
      name: 'themeName',
      group: 'themeGroup',
      groupId: 'themeGroupUrn',
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

      graphqlExecSpy.mockImplementation(() => Promise.resolve({
        data: {
          createThemeGroup: {
            name: themeData.group,
            urn: 'newThemeGroupUrn',
            options: [{
              name: themeData.name,
              urn: 'newThemeUrn',
            }],
          },
        },
      }));

      await store.dispatch.tokenState.saveTheme(themeData);

      expect(graphqlExecSpy).toHaveBeenCalled();
      expect(graphqlOpSpy).toHaveBeenCalledWith(CREATE_THEME_GROUP_MUTATION, {
        project: 'apiId',
        input: {
          name: themeData.group,
          options: {
            name: themeData.name,
            selectedTokenSets: JSON.stringify(themeData.selectedTokenSets),
            figmaStyleReferences: '{}',
          },
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group created in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      const { themes } = store.getState().tokenState;
      const createdTheme = themes.find((theme) => theme.name === themeData.name);

      expect(createdTheme).toBeDefined();
      expect(createdTheme?.id).toEqual('newThemeUrn');
      expect(createdTheme?.groupId).toEqual('newThemeGroupUrn');
    });

    it('Creates a new theme in an existing theme group', async () => {
      const newThemeData = {
        name: 'newTheme',
        group: 'themeGroup',
        groupId: 'themeGroupUrn',
        selectedTokenSets: { options: TokenSetStatus.ENABLED },
      };

      graphqlExecSpy.mockImplementation(() => Promise.resolve({
        data: {
          updateThemeGroup: {
            name: newThemeData.group,
            urn: newThemeData.groupId,
            options: [{
              name: newThemeData.name,
              urn: 'newThemeUrn',
            }],
          },
        },
      }));

      await store.dispatch.tokenState.saveTheme(newThemeData);

      expect(graphqlExecSpy).toHaveBeenCalled();
      expect(graphqlOpSpy).toHaveBeenCalledWith(UPDATE_THEME_GROUP_MUTATION, {
        urn: newThemeData.groupId,
        input: {
          name: newThemeData.group,
          options: [
            {
              name: existingTheme.name,
              urn: existingTheme.id,
              selectedTokenSets: JSON.stringify(existingTheme.selectedTokenSets),
              figmaStyleReferences: undefined,
              figmaVariableReferences: undefined,
            },
            {
              name: newThemeData.name,
              selectedTokenSets: JSON.stringify(newThemeData.selectedTokenSets),
              figmaStyleReferences: '{}',
              figmaVariableReferences: undefined,
              urn: '',
            },
          ],
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group updated in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      const { themes } = store.getState().tokenState;

      expect(themes.length).toEqual(2);
      const createdTheme = themes.find((theme) => theme.name === newThemeData.name);

      expect(createdTheme).toBeDefined();
      expect(createdTheme?.id).toEqual('newThemeUrn');
    });

    it('Updates an existing theme', async () => {
      const updatedThemeData = {
        name: 'themeName',
        group: 'themeGroup',
        id: 'themeUrn',
        groupId: 'themeGroupUrn',
        selectedTokenSets: { options: TokenSetStatus.ENABLED },
      };

      graphqlExecSpy.mockImplementation(() => Promise.resolve({
        data: {
          updateThemeGroup: {
            name: updatedThemeData.group,
            urn: updatedThemeData.groupId,
            options: [{
              name: updatedThemeData.name,
              urn: existingTheme.id,
            }],
          },
        },
      }));

      await store.dispatch.tokenState.saveTheme(updatedThemeData);

      expect(graphqlExecSpy).toHaveBeenCalled();
      expect(graphqlOpSpy).toHaveBeenCalledWith(UPDATE_THEME_GROUP_MUTATION, {
        urn: updatedThemeData.groupId,
        input: {
          name: updatedThemeData.group,
          options: [{
            name: updatedThemeData.name,
            urn: existingTheme.id,
            selectedTokenSets: JSON.stringify(updatedThemeData.selectedTokenSets),
            figmaStyleReferences: '{}',
            figmaVariableReferences: undefined,
          }],
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
        id: 'themeUrn',
        selectedTokenSets: { options: TokenSetStatus.ENABLED },
      };

      graphqlExecSpy.mockImplementation(() => Promise.resolve({
        data: {
          createThemeGroup: {
            name: updatedThemeData.group,
            urn: 'newThemeGroupUrn',
            options: [{
              name: updatedThemeData.name,
              urn: existingTheme.id,
            }],
          },
        },
      }));

      await store.dispatch.tokenState.saveTheme(updatedThemeData);

      expect(graphqlExecSpy).toHaveBeenCalled();
      expect(graphqlOpSpy).toHaveBeenCalledWith(CREATE_THEME_GROUP_MUTATION, {
        project: 'apiId',
        input: {
          name: updatedThemeData.group,
          options: {
            name: updatedThemeData.name,
            selectedTokenSets: JSON.stringify(updatedThemeData.selectedTokenSets),
            figmaStyleReferences: '{}',
          },
        },
      });

      await delay();

      expect(graphqlOpSpy).toHaveBeenCalledWith(DELETE_THEME_GROUP_MUTATION, {
        urn: existingTheme.groupId,
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group created in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      const { themes } = store.getState().tokenState;

      expect(themes.length).toEqual(1);
      const updatedTheme = themes.find((theme) => theme.id === updatedThemeData.id);

      expect(updatedTheme).toBeDefined();
      expect(updatedTheme?.id).toEqual(existingTheme.id);
      expect(updatedTheme?.groupId).toEqual('newThemeGroupUrn');
    });

    it('Deleting the last theme in a theme group deletes the theme group', async () => {
      graphqlExecSpy.mockImplementation(() => Promise.resolve({
        data: {
          deleteThemeGroup: null,
        },
      }));

      await store.dispatch.tokenState.deleteTheme(existingTheme.id);

      expect(graphqlExecSpy).toHaveBeenCalled();
      expect(graphqlOpSpy).toHaveBeenCalledWith(DELETE_THEME_GROUP_MUTATION, {
        urn: existingTheme.groupId,
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
              themes: [existingTheme, {
                id: 'themeUrn2',
                name: 'themeName2',
                group: 'themeGroup',
                groupId: 'themeGroupUrn',
                selectedTokenSets: { options: TokenSetStatus.ENABLED },
                figmaVariableReferences: undefined,
                figmaStyleReferences: undefined,
              }],
            },
          },
        },
      });

      graphqlExecSpy.mockImplementation(() => Promise.resolve({
        data: {
          updateThemeGroup: null,
        },
      }));

      await store.dispatch.tokenState.deleteTheme('themeUrn2');

      expect(graphqlExecSpy).toHaveBeenCalled();
      expect(graphqlOpSpy).toHaveBeenCalledWith(UPDATE_THEME_GROUP_MUTATION, {
        urn: existingTheme.groupId,
        input: {
          name: existingTheme.group,
          options: [
            {
              name: existingTheme.name,
              urn: existingTheme.id,
              selectedTokenSets: JSON.stringify(existingTheme.selectedTokenSets),
              figmaStyleReferences: undefined,
              figmaVariableReferences: undefined,
            },
          ],
        },
      });

      await delay();

      expect(notifyToUISpy).toHaveBeenCalledWith('Theme group updated in Tokens Studio', { error: false });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      const { themes } = store.getState().tokenState;
      const deletedTheme = themes.find((theme) => theme.id === 'themeUrn2');

      expect(deletedTheme).toBeUndefined();
      expect(themes.length).toEqual(1);
    });
  });
});

describe('Tokens Studio sync - Api provider is not Tokens Studio', () => {
  let store: Store;
  let graphqlExecSpy: jest.SpyInstance;

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
              provider: AVAILABLE_PROVIDERS.LOCAL as StorageProviderType.LOCAL,
            },
          },
        },
      },
    });

    graphqlExecSpy = jest.spyOn(Graphql, 'exec');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Do not sync create token if provider is not Tokens Studio', async () => {
    await store.dispatch.tokenState.createToken({
      name: 'brand.newColor',
      description: 'newColor description',
      parent: 'global',
      value: '#ff00000',
      type: TokenTypes.COLOR,
    });

    expect(graphqlExecSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Do not sync create token set if provider is not Tokens Studio', async () => {
    await store.dispatch.tokenState.addTokenSet('newTokenSet');
    expect(graphqlExecSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
