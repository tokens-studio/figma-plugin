/* eslint-disable import/prefer-default-export */
import { createModel } from '@rematch/core';
import * as tokenStateReducers from './reducers/tokenState';
import * as tokenStateEffects from './effects/tokenState';

import parseTokenValues from '@/utils/parseTokenValues';
import { notifyToUI } from '@/plugin/notifiers';
import { replaceReferences } from '@/utils/findReferences';
import parseJson from '@/utils/parseJson';
import updateTokensOnSources from '../updateSources';
import {
  AnyTokenList, ImportToken, SingleToken, TokenStore,
} from '@/types/tokens';
import {
  DeleteTokenPayload,
  SetTokenDataPayload,
  SetTokensFromStylesPayload,
  ToggleManyTokenSetsPayload,
  UpdateDocumentPayload,
  UpdateTokenPayload,
  RenameTokenGroupPayload,
  DuplicateTokenGroupPayload,
  DuplicateTokenPayload,
} from '@/types/payloads';
import { updateTokenPayloadToSingleToken } from '@/utils/updateTokenPayloadToSingleToken';
import { RootModel } from '@/types/RootModel';
import { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { isEqual } from '@/utils/isEqual';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { updateTokenSetsInState } from '@/utils/tokenset/updateTokenSetsInState';

export interface TokenState {
  tokens: Record<string, AnyTokenList>;
  themes: ThemeObjectsList;
  lastSyncedState: string; // @README for reference, at this time this is a JSON stringified representation of the tokens and themes ([tokens, themes])
  importedTokens: {
    newTokens: ImportToken[];
    updatedTokens: ImportToken[];
  };
  activeTheme: string | null;
  activeTokenSet: string;
  usedTokenSet: UsedTokenSetsMap;
  editProhibited: boolean;
  hasUnsavedChanges: boolean;
  modifiedTokenSet: string[];
}

export const tokenState = createModel<RootModel>()({
  state: {
    tokens: {
      global: [],
    },
    themes: [],
    lastSyncedState: JSON.stringify([{ global: [] }, []], null, 2),
    importedTokens: {
      newTokens: [],
      updatedTokens: [],
    },
    activeTheme: null,
    activeTokenSet: 'global',
    usedTokenSet: ['global'],
    editProhibited: false,
    hasUnsavedChanges: false,
    modifiedTokenSet: [],
  } as unknown as TokenState,
  reducers: {
    setEditProhibited(state, payload: boolean) {
      return {
        ...state,
        editProhibited: payload,
      };
    },
    toggleUsedTokenSet: (state, tokenSet: string) => ({
      ...state,
      activeTheme: null,
      usedTokenSet: {
        ...state.usedTokenSet,
        // @README it was decided the user can not simply toggle to the intermediate SOURCE state
        // this means for toggling we only switch between ENABLED and DISABLED
        // setting as source is a separate action
        [tokenSet]: state.usedTokenSet[tokenSet] === TokenSetStatus.DISABLED
          ? TokenSetStatus.ENABLED
          : TokenSetStatus.DISABLED,
      },
    }),
    toggleManyTokenSets: (state, data: ToggleManyTokenSetsPayload) => {
      const oldSetsWithoutInput = Object.fromEntries(
        Object.entries(state.usedTokenSet)
          .filter(([tokenSet]) => !data.sets.includes(tokenSet)),
      );

      if (data.shouldCheck) {
        return {
          ...state,
          activeTheme: null,
          usedTokenSet: {
            ...oldSetsWithoutInput,
            ...Object.fromEntries(data.sets.map((tokenSet) => ([tokenSet, TokenSetStatus.ENABLED]))),
          },
        };
      }

      return {
        ...state,
        activeTheme: null,
        usedTokenSet: {
          ...oldSetsWithoutInput,
          ...Object.fromEntries(data.sets.map((tokenSet) => ([tokenSet, TokenSetStatus.DISABLED]))),
          // @README see comment (1) - ensure that all token sets are always available
        },
      };
    },
    toggleTreatAsSource: (state, tokenSet: string) => ({
      ...state,
      usedTokenSet: {
        ...state.usedTokenSet,
        [tokenSet]: state.usedTokenSet[tokenSet] === TokenSetStatus.SOURCE
          ? TokenSetStatus.DISABLED
          : TokenSetStatus.SOURCE,
      },
    }),
    setActiveTokenSet: (state, data: string) => ({
      ...state,
      activeTokenSet: data,
    }),
    addTokenSet: (state, name: string): TokenState => {
      if (name in state.tokens) {
        notifyToUI('Token set already exists', { error: true });
        return state;
      }

      return updateTokenSetsInState(state, null, [name]);
    },
    duplicateTokenSet: (state, name: string): TokenState => {
      if (!(name in state.tokens)) {
        notifyToUI('Token set does not exist', { error: true });
        return state;
      }

      const newName = `${name}_Copy`;
      return updateTokenSetsInState(state, null, [newName]);
    },
    deleteTokenSet: (state, name: string) => updateTokenSetsInState(
      state,
      (setName, tokenSet) => (
        setName === name ? null : [setName, tokenSet]
      ),
    ),
    renameTokenSet: (state, data: { oldName: string; newName: string }) => {
      if (
        Object.keys(state.tokens).includes(data.newName)
        && data.oldName !== data.newName
      ) {
        notifyToUI('Token set already exists', { error: true });
        return state;
      }

      return updateTokenSetsInState(
        state,
        (setName, tokenSet) => (
          setName === data.oldName
            ? [data.newName, tokenSet]
            : [setName, tokenSet]
        ),
      );
    },
    setLastSyncedState: (state, data: string) => ({
      ...state,
      lastSyncedState: data,
    }),
    setModifiedTokenSet: (state, data: string | string[]) => ({
      ...state,
      modifiedTokenSet: [...state.modifiedTokenSet, ...data],
    }),
    resetModifiedTokenSet: (state) => ({
      ...state,
      modifiedTokenSet: [],
    }),

    setTokenSetOrder: (state, data: string[]) => {
      const newTokens = {};
      data.forEach((set) => {
        Object.assign(newTokens, { [set]: state.tokens[set] });
      });
      return {
        ...state,
        tokens: newTokens,
      };
    },
    resetImportedTokens: (state) => ({
      ...state,
      importedTokens: {
        newTokens: [],
        updatedTokens: [],
      },
    }),
    setJSONData(state, payload) {
      const parsedTokens = parseJson(payload);
      parseTokenValues(parsedTokens);
      const values = parseTokenValues({ [state.activeTokenSet]: parsedTokens });
      return {
        ...state,
        tokens: {
          ...state.tokens,
          ...values,
        },
      };
    },
    setHasUnsavedChanges(state, payload: boolean) {
      return {
        ...state,
        hasUnsavedChanges: payload,
      };
    },
    setTokens: (state, newTokens) => ({
      ...state,
      tokens: newTokens,
    }),
    createToken: (state, data: UpdateTokenPayload) => {
      let newTokens: TokenStore['values'] = {};
      const existingToken = state.tokens[data.parent].find((n) => n.name === data.name);
      if (!existingToken) {
        newTokens = {
          [data.parent]: [
            ...state.tokens[data.parent],
            updateTokenPayloadToSingleToken(data),
          ],
        };
      }
      return {
        ...state,
        tokens: {
          ...state.tokens,
          ...newTokens,
        },
      };
    },
    duplicateToken: (state, data: DuplicateTokenPayload) => {
      let newTokens: TokenStore['values'] = {};
      const existingTokenIndex = state.tokens[data.parent].findIndex((n) => n.name === data.name);
      if (existingTokenIndex > -1) {
        const newName = `${data.name}-copy`;
        const existingTokens = [...state.tokens[data.parent]];
        existingTokens.splice(existingTokenIndex + 1, 0, {
          ...state.tokens[data.parent][existingTokenIndex],
          name: newName,
        });

        newTokens = {
          [data.parent]: existingTokens,
        };
      }
      return {
        ...state,
        tokens: {
          ...state.tokens,
          ...newTokens,
        },
      };
    },
    // Imports received styles as tokens, if needed
    setTokensFromStyles: (state, receivedStyles: SetTokensFromStylesPayload): TokenState => {
      const newTokens: SingleToken[] = [];
      const existingTokens: SingleToken[] = [];
      const updatedTokens: SingleToken[] = [];

      // Iterate over received styles and check if they existed before or need updating
      Object.values(receivedStyles).forEach((values) => {
        values.forEach((token) => {
          const oldValue = state.tokens[state.activeTokenSet].find((t) => t.name === token.name);
          if (oldValue) {
            if (isEqual(oldValue.value, token.value)) {
              if (
                oldValue.description === token.description
                || (typeof token.description === 'undefined' && oldValue.description === '')
              ) {
                existingTokens.push(token);
              } else {
                updatedTokens.push({
                  ...token,
                  oldDescription: oldValue.description,
                });
              }
            } else {
              const updatedToken = { ...token };
              updatedToken.oldValue = oldValue.value;
              updatedTokens.push(updatedToken);
            }
          } else {
            newTokens.push(token);
          }
        });
      });

      return {
        ...state,
        importedTokens: {
          newTokens,
          updatedTokens,
        },
      } as TokenState;
    },
    editToken: (state, data: UpdateTokenPayload) => {
      const nameToFind = data.oldName ? data.oldName : data.name;
      const index = state.tokens[data.parent].findIndex((token) => token.name === nameToFind);
      const newArray = [...state.tokens[data.parent]];
      newArray[index] = {
        ...newArray[index],
        ...updateTokenPayloadToSingleToken(data),
      } as SingleToken;

      return {
        ...state,
        tokens: {
          ...state.tokens,
          [data.parent]: newArray,
        },
      };
    },
    deleteToken: (state, data: DeleteTokenPayload) => {
      const newState = {
        ...state,
        tokens: {
          ...state.tokens,
          [data.parent]: state.tokens[data.parent].filter((token) => token.name !== data.path),
        },
      };

      return newState;
    },
    deleteTokenGroup: (state, data: DeleteTokenPayload) => {
      const newState = {
        ...state,
        tokens: {
          ...state.tokens,
          [data.parent]: state.tokens[data.parent].filter((token) => !token.name.startsWith(data.path)),
        },
      };

      return newState;
    },

    renameTokenGroup: (state, data: RenameTokenGroupPayload) => {
      const {
        path, oldName, newName, type,
      } = data;

      const tokenSetsList = Object.keys(state.usedTokenSet);
      const newTokenGroupState = tokenSetsList.map((tokenSets) => {
        const newTokenGroups = state.tokens[tokenSets].map((token) => {
          if (token.name.startsWith(`${path}${oldName}.`) && token.type === type) {
            const { name, ...rest } = token;
            const newTokenName = name.replace(`${path}${oldName}`, `${path}${newName}`);
            return {
              ...rest,
              name: newTokenName,
            };
          }
          if (token.value.toString().startsWith(`{${path}${oldName}.`)) {
            const { value, ...rest } = token;
            const updatedNewTokenValue = value.toString().replace(`${path}${oldName}`, `${path}${newName}`);
            return {
              ...rest,
              value: updatedNewTokenValue,
            };
          }
          return token;
        });
        return {
          [tokenSets]: newTokenGroups,
        };
      });

      const newState = {
        ...state,
        tokens: newTokenGroupState.reduce((acc, cur) => ({ ...acc, ...cur }), {}),
      };
      return newState as TokenState;
    },

    duplicateTokenGroup: (state, data: DuplicateTokenGroupPayload) => {
      const {
        parent, path, oldName, type,
      } = data;
      const selectedTokenGroup = state.tokens[parent].filter((token) => (token.name.startsWith(`${path}${oldName}.`) && token.type === type));
      const newTokenGroup = selectedTokenGroup.map((token) => {
        const { name, ...rest } = token;
        const duplicatedTokenGroupName = token.name.replace(`${path}${oldName}`, `${path}${oldName}-copy`);
        return {
          name: duplicatedTokenGroupName,
          ...rest,
        };
      });

      return {
        ...state,
        tokens: {
          ...state.tokens,
          [parent]: [...state.tokens[parent], ...newTokenGroup],
        },
      };
    },
    updateAliases: (state, data: { oldName: string; newName: string }) => {
      const newTokens = Object.entries(state.tokens).reduce<TokenState['tokens']>(
        (acc, [key, values]) => {
          const newValues = values.map<SingleToken>((token) => {
            if (Array.isArray(token.value)) {
              return {
                ...token,
                value: token.value.map((t) => Object.entries(t).reduce<Record<string, string | number>>((a, [k, v]) => {
                  a[k] = replaceReferences(v.toString(), data.oldName, data.newName);
                  return a;
                }, {})),
              } as SingleToken;
            }
            if (typeof token.value === 'object') {
              return {
                ...token,
                value: Object.entries(token.value).reduce<Record<string, string | number>>((a, [k, v]) => {
                  a[k] = replaceReferences(v.toString(), data.oldName, data.newName);
                  return a;
                }, {}),
              } as SingleToken;
            }

            return {
              ...token,
              value: replaceReferences(token.value.toString(), data.oldName, data.newName),
            } as SingleToken;
          });

          acc[key] = newValues;
          return acc;
        },
        {},
      );

      return {
        ...state,
        tokens: newTokens,
      };
    },
    ...tokenStateReducers,
  },
  effects: (dispatch) => ({
    editToken(payload: UpdateTokenPayload, rootState) {
      if (payload.oldName && payload.oldName !== payload.name) {
        dispatch.tokenState.updateAliases({ oldName: payload.oldName, newName: payload.name });
      }

      if (payload.shouldUpdate && rootState.settings.updateOnChange) {
        dispatch.tokenState.updateDocument();
      }
    },
    deleteToken() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    deleteTokenGroup() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    addTokenSet() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    duplicateTokenSet() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    renameTokenSet() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    deleteTokenSet() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    setTokenSetOrder() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    setJSONData() {
      dispatch.tokenState.updateDocument();
    },
    setTokenData(payload: SetTokenDataPayload) {
      if (payload.shouldUpdate) {
        dispatch.tokenState.updateDocument();
      }
    },
    toggleUsedTokenSet() {
      dispatch.tokenState.updateDocument({ updateRemote: false });
    },
    toggleManyTokenSets() {
      dispatch.tokenState.updateDocument({ updateRemote: false });
    },
    toggleTreatAsSource() {
      dispatch.tokenState.updateDocument({ updateRemote: false });
    },
    duplicateToken(payload: DuplicateTokenPayload, rootState) {
      if (payload.shouldUpdate && rootState.settings.updateOnChange) {
        dispatch.tokenState.updateDocument();
      }
    },
    createToken(payload: UpdateTokenPayload, rootState) {
      if (payload.shouldUpdate && rootState.settings.updateOnChange) {
        dispatch.tokenState.updateDocument();
      }
    },
    updateCheckForChanges(checkForChanges: boolean) {
      dispatch.tokenState.updateDocument({ checkForChanges, shouldUpdateNodes: false });
    },
    updateDocument(options?: UpdateDocumentPayload, rootState?) {
      const defaults = { shouldUpdateNodes: true, updateRemote: true };
      const params = { ...defaults, ...options };
      try {
        updateTokensOnSources({
          tokens: params.shouldUpdateNodes ? rootState.tokenState.tokens : null,
          tokenValues: rootState.tokenState.tokens,
          usedTokenSet: rootState.tokenState.usedTokenSet,
          themes: rootState.tokenState.themes,
          activeTheme: rootState.tokenState.activeTheme,
          settings: rootState.settings,
          updatedAt: new Date().toISOString(),
          lastUpdatedAt: rootState.uiState.lastUpdatedAt ?? new Date().toISOString(),
          isLocal: rootState.uiState.storageType.provider === StorageProviderType.LOCAL,
          editProhibited: rootState.tokenState.editProhibited,
          api: rootState.uiState.api,
          storageType: rootState.uiState.storageType,
          shouldUpdateRemote: params.updateRemote && rootState.settings.updateRemote,
          checkForChanges: params.checkForChanges || false,
          modifiedTokenSet: rootState.tokenState.modifiedTokenSet,
        });
      } catch (e) {
        console.error('Error updating document', e);
      }
    },
    ...Object.fromEntries(
      (Object.entries(tokenStateEffects).map(([key, factory]) => (
        [key, factory(dispatch)]
      ))),
    ),
  }),
});
