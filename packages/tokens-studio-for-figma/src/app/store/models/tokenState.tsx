/* eslint-disable import/prefer-default-export */
import { compressToUTF16 } from 'lz-string';
import omit from 'just-omit';
import { createModel } from '@rematch/core';
import extend from 'just-extend';
import { v4 as uuidv4 } from 'uuid';
import * as tokenStateReducers from './reducers/tokenState';
import * as tokenStateEffects from './effects/tokenState';
import parseTokenValues from '@/utils/parseTokenValues';
import { notifyToUI } from '@/plugin/notifiers';
import parseJson from '@/utils/parseJson';
import { TokenData } from '@/types/SecondScreen';
import updateTokensOnSources from '../updateSources';
import {
  AnyTokenList, ImportToken, SingleToken, TokenStore, TokenToRename,
} from '@/types/tokens';
import { updateCheckForChangesAtomic } from './effects/updateCheckForChangesAtomic';
import {
  DeleteTokenPayload,
  SetTokenDataPayload,
  SetTokensFromStylesPayload,
  UpdateDocumentPayload,
  UpdateTokenPayload,
  RenameTokenGroupPayload,
  DuplicateTokenGroupPayload,
  DuplicateTokenPayload,
  DeleteTokenGroupPayload,
  StyleToCreateToken,
  VariableToCreateToken,
  SetTokensFromVariablesPayload,
} from '@/types/payloads';
import { updateTokenPayloadToSingleToken } from '@/utils/updateTokenPayloadToSingleToken';
import { RootModel } from '@/types/RootModel';
import { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { isEqual } from '@/utils/isEqual';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { updateTokenSetsInState } from '@/utils/tokenset/updateTokenSetsInState';
import { TokenTypes } from '@/constants/TokenTypes';
import tokenTypes from '@/config/tokenType.defs.json';
import { CompareStateType, findDifferentState } from '@/utils/findDifferentState';
import { RenameTokensAcrossSetsPayload } from '@/types/payloads/RenameTokensAcrossSets';
import { wrapTransaction } from '@/profiling/transaction';
import addIdPropertyToTokens from '@/utils/addIdPropertyToTokens';
import { TokenFormat, TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';
import { pushToTokensStudio } from '../providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import {
  createTokenInTokensStudio,
  duplicateTokenInTokensStudio,
  createTokenSetInTokensStudio,
  updateTokenSetInTokensStudio,
} from '@/storage/tokensStudio';
import { deleteTokenSetFromTokensStudio } from '@/storage/tokensStudio/deleteTokenSetFromTokensStudio';
import { updateAliasesInState } from '../utils/updateAliasesInState';
import { CreateSingleTokenData, EditSingleTokenData } from '../useManageTokens';
import { singleTokensToRawTokenSet } from '@/utils/convert';
import { checkStorageSize } from '@/utils/checkStorageSize';
import { compareLastSyncedState } from '@/utils/compareLastSyncedState';

export interface TokenState {
  tokens: Record<string, AnyTokenList>;
  stringTokens: string;
  themes: ThemeObjectsList;
  lastSyncedState: string; // @README for reference, at this time this is a JSON stringified representation of the tokens and themes ([tokens, themes])
  importedTokens: {
    newTokens: ImportToken[];
    updatedTokens: ImportToken[];
  };
  activeTheme: Record<string, string>;
  activeTokenSet: string;
  usedTokenSet: UsedTokenSetsMap;
  editProhibited: boolean;
  hasUnsavedChanges: boolean;
  collapsedTokenSets: string[];
  collapsedTokenTypeObj: Record<TokenTypes, boolean>;
  checkForChanges: boolean;
  collapsedTokens: string[];
  changedState: CompareStateType;
  remoteData: CompareStateType;
  tokenFormat: TokenFormatOptions;
  tokenSetMetadata: Record<string, { isDynamic?: boolean }>;
  importedThemes: {
    newThemes: ThemeObjectsList;
    updatedThemes: ThemeObjectsList;
  };
  compressedTokens: string;
  compressedThemes: string;
  tokensSize: number;
  themesSize: number;
  renamedCollections: [string, string][] | null;
}

export const tokenState = createModel<RootModel>()({
  state: {
    tokens: {
      global: [],
    },
    stringTokens: '',
    themes: [],
    lastSyncedState: JSON.stringify([{ global: [] }, []], null, 2),
    importedTokens: {
      newTokens: [],
      updatedTokens: [],
    },
    activeTheme: {},
    activeTokenSet: 'global',
    usedTokenSet: {
      global: TokenSetStatus.ENABLED,
    },
    editProhibited: false,
    hasUnsavedChanges: false,
    collapsedTokenSets: [],
    collapsedTokenTypeObj: Object.keys(tokenTypes).reduce<Partial<Record<TokenTypes, boolean>>>((acc, tokenType) => {
      acc[tokenType as TokenTypes] = false;
      return acc;
    }, {}),
    checkForChanges: false,
    collapsedTokens: [],
    changedState: {},
    remoteData: {
      tokens: {},
      themes: [],
      metadata: null,
    },
    tokenFormat: TokenFormatOptions.Legacy,
    tokenSetMetadata: {},
    importedThemes: {
      newThemes: [],
      updatedThemes: [],
    },
    compressedTokens: '',
    compressedThemes: '',
    tokensSize: 0,
    themesSize: 0,
    renamedCollections: null,
  } as unknown as TokenState,
  reducers: {
    setTokensSize: (state, size: number) => ({
      ...state,
      tokensSize: size,
    }),
    setThemesSize: (state, size: number) => ({
      ...state,
      themesSize: size,
    }),
    setStringTokens: (state, payload: string) => ({
      ...state,
      stringTokens: payload,
    }),
    setEditProhibited(state, payload: boolean) {
      return {
        ...state,
        editProhibited: payload,
      };
    },
    toggleTreatAsSource: (state, tokenSet: string) => ({
      ...state,
      usedTokenSet: {
        ...state.usedTokenSet,
        [tokenSet]:
          state.usedTokenSet[tokenSet] === TokenSetStatus.SOURCE ? TokenSetStatus.DISABLED : TokenSetStatus.SOURCE,
      },
    }),
    setActiveTokenSet: (state, data: string) => ({
      ...state,
      activeTokenSet: data,
    }),
    setUsedTokenSet: (state, data: UsedTokenSetsMap) => ({
      ...state,
      usedTokenSet: data,
    }),
    setThemes: (state, data: ThemeObjectsList) => {
      const { newThemes = [], updatedThemes = [] } = state.importedThemes || { newThemes: [], updatedThemes: [] };

      return {
        ...state,
        themes: [
          ...(newThemes.length === 0 && updatedThemes.length === 0 ? data : []),
          ...state.themes.map((existingTheme) => {
            const updateTheme = updatedThemes.find((importedTheme) => importedTheme.$figmaCollectionId === existingTheme.$figmaCollectionId && importedTheme.$figmaModeId === existingTheme.$figmaModeId);
            return updateTheme ? { ...existingTheme, ...updateTheme } : existingTheme;
          }),
          ...newThemes,
        ],
      };
    },
    setNewTokenData: (state, data: TokenData['synced_data']) => ({
      ...state,
      usedTokenSet: data.usedTokenSets || state.usedTokenSet,
      themes: data.themes || state.themes,
      activeTheme: data.activeTheme || state.activeTheme,
      tokens: addIdPropertyToTokens(data.sets ?? {}) || addIdPropertyToTokens(state.tokens),
    }),
    addTokenSet: (state, name: string): TokenState => {
      if (name in state.tokens) {
        notifyToUI('Token set already exists', { error: true });
        return state;
      }

      return updateTokenSetsInState(state, null, [name]);
    },
    duplicateTokenSet: (state, newName: string, oldName: string): TokenState => {
      if (!(oldName in state.tokens)) {
        notifyToUI('Token set does not exist', { error: true });
        return state;
      }
      const indexOf = Object.keys(state.tokens).indexOf(oldName);
      return updateTokenSetsInState(state, null, [
        newName,
        state.tokens[oldName].map((token) => extend(true, {}, token) as typeof token),
        indexOf + 1,
      ]);
    },
    deleteTokenSet: (state, name: string) => updateTokenSetsInState(state, (setName, tokenSet) => (setName === name ? null : [setName, tokenSet])),
    setLastSyncedState: (state, data: string) => ({
      ...state,
      lastSyncedState: data,
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
    setTokenSetMetadata: (state, data: TokenState['tokenSetMetadata']) => ({
      ...state,
      tokenSetMetadata: data,
    }),
    replaceThemes: (state, themes: ThemeObjectsList) => ({
      ...state,
      themes,
    }),
    setRenamedCollections: (state, renamedCollections: [string, string][] | null) => ({
      ...state,
      renamedCollections,
    }),
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
          ...addIdPropertyToTokens(values),
        },
      };
    },
    setHasUnsavedChanges(state, payload: boolean) {
      return {
        ...state,
        hasUnsavedChanges: payload,
      };
    },
    setTokens: (state, newTokens: Record<string, AnyTokenList>) => ({
      ...state,
      tokens: addIdPropertyToTokens(newTokens),
    }),
    createToken: (state, data: UpdateTokenPayload) => {
      let newTokens: TokenStore['values'] = {};

      const existingToken = state.tokens[data.parent].find((n) => n.name === data.name);
      if (!existingToken) {
        newTokens = {
          [data.parent]: [...state.tokens[data.parent], updateTokenPayloadToSingleToken(data, uuidv4())],
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
    createMultipleTokens: (state, data: CreateSingleTokenData[]) => {
      // This is a deep clone of the tokens so that we force an update in the UI even if just the value changes
      const newTokens: TokenStore['values'] = JSON.parse(JSON.stringify(state.tokens));
      data.forEach((token) => {
        if (!newTokens[token.parent]) {
          newTokens[token.parent] = [];
        }
        const existingTokenIndex = newTokens[token.parent].findIndex((n) => n.name === token.name);
        if (existingTokenIndex === -1) {
          newTokens[token.parent].push(updateTokenPayloadToSingleToken(token as UpdateTokenPayload, uuidv4()));
        }
      });

      return {
        ...state,
        tokens: newTokens,
      };
    },
    editMultipleTokens: (state, data: EditSingleTokenData[]) => {
      // This is a deep clone of the tokens so that we force an update in the UI even if just the value changes
      const newTokens: TokenStore['values'] = JSON.parse(JSON.stringify(state.tokens));
      data.forEach((token) => {
        const existingTokenIndex = newTokens[token.parent].findIndex((n) => n.name === token.name);
        if (existingTokenIndex > -1) {
          newTokens[token.parent] = [
            ...newTokens[token.parent].slice(0, existingTokenIndex),
            updateTokenPayloadToSingleToken(token as UpdateTokenPayload, uuidv4()),
            ...newTokens[token.parent].slice(existingTokenIndex + 1),
          ];
        }
      });

      return {
        ...state,
        tokens: newTokens,
      };
    },
    duplicateToken: (state, data: DuplicateTokenPayload) => {
      const newTokens: TokenStore['values'] = {};
      Object.keys(state.tokens).forEach((tokenSet) => {
        if (tokenSet === data.parent) {
          const existingTokenIndex = state.tokens[tokenSet].findIndex((n) => n.name === data?.oldName);
          if (existingTokenIndex > -1) {
            const existingTokens = [...state.tokens[tokenSet]];
            existingTokens.splice(existingTokenIndex + 1, 0, {
              ...omit(state.tokens[tokenSet][existingTokenIndex], 'description', '$extensions'),
              ...updateTokenPayloadToSingleToken(
                {
                  parent: data.parent,
                  name: data.newName,
                  type: data.type,
                  value: data.value,
                  description: data.description,
                  oldName: data.oldName,
                  $extensions: data.$extensions,
                } as UpdateTokenPayload,
                uuidv4(),
              ),
            } as SingleToken);
            newTokens[tokenSet] = existingTokens;
          }
        } else if (data.tokenSets.includes(tokenSet)) {
          const existingTokenIndex = state.tokens[tokenSet].findIndex((n) => n.name === data?.newName);
          if (existingTokenIndex < 0) {
            const newToken = updateTokenPayloadToSingleToken(
              {
                name: data.newName,
                type: data.type,
                value: data.value,
                description: data.description,
                $extensions: data.$extensions,
              } as UpdateTokenPayload,
              uuidv4(),
            );
            newTokens[tokenSet] = [...state.tokens[tokenSet], newToken as SingleToken];
          }
        }
      });

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
      const newTokens: StyleToCreateToken[] = [];
      const existingTokens: StyleToCreateToken[] = [];
      const updatedTokens: StyleToCreateToken[] = [];

      // Create a map of token names to tokens once, outside the loop
      const tokenMap = new Map();
      Object.values(state.tokens).forEach((tokenSet) => {
        tokenSet.forEach((token) => {
          if (!tokenMap.has(token.name)) { // Only store first occurrence
            tokenMap.set(token.name, token);
          }
        });
      });

      // Iterate over received styles and check if they existed before or need updating
      Object.values(receivedStyles).forEach((values) => {
        values.forEach((token) => {
          const oldValue = tokenMap.get(token.name);
          if (oldValue) {
            if (isEqual(oldValue.value, token.value)) {
              const normalizedOldValueDescription = oldValue.description ?? '';
              const normalizedTokenDescription = token.description ?? '';
              if (isEqual(normalizedOldValueDescription, normalizedTokenDescription)) {
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
            // Token doesn't exist in any token set
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
    // Imports received variables as tokens, if needed
    setTokensFromVariables: (state, receivedVariables: SetTokensFromVariablesPayload): TokenState => {
      const newTokens: VariableToCreateToken[] = [];
      const existingTokens: VariableToCreateToken[] = [];
      const updatedTokens: VariableToCreateToken[] = [];

      // Iterate over received styles and check if they existed before or need updating
      Object.values(receivedVariables).forEach((values) => {
        values.forEach((token) => {
          // If a set exists for the token
          if (state.tokens[token.parent]) {
            const oldValue = state.tokens[token.parent].find((t) => t.name === token.name);
            // If the token already exists
            if (oldValue) {
              const normalizedOldValueDescription = oldValue.description ?? '';
              const normalizedTokenDescription = token.description ?? '';
              if (
                isEqual(oldValue.value, token.value)
                && isEqual(normalizedOldValueDescription, normalizedTokenDescription)
              ) {
                existingTokens.push(token);
              } else {
                const updatedToken = { ...token };
                updatedToken.oldValue = oldValue.value;
                updatedTokens.push(updatedToken);
              }
            } else {
              newTokens.push(token);
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
        ...omit(newArray[index], 'description'),
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
    deleteDuplicateTokens: (state, data: DeleteTokenPayload) => {
      let i = 0;
      const newState = {
        ...state,
        tokens: {
          ...state.tokens,
          [data.parent]:
            typeof data.index === 'number'
              ? state.tokens[data.parent].filter((token) => {
                if (token.name === data.path) {
                  if (i === data.index) {
                    i += 1;
                    return true;
                  }
                  i += 1;
                  return false;
                }
                return token.name !== data.path;
              })
              : state.tokens[data.parent].filter((token) => token.name !== data.path),
        },
      };

      return newState;
    },
    deleteTokenGroup: (state, data: DeleteTokenGroupPayload) => {
      const newState = {
        ...state,
        tokens: {
          ...state.tokens,
          [data.parent]: state.tokens[data.parent].filter(
            (token) => !(token.name.startsWith(`${data.path}.`) && token.type === data.type),
          ),
        },
      };

      return newState;
    },

    renameTokenGroup: (state, data: RenameTokenGroupPayload) => {
      const {
        oldName, newName, type, parent,
      } = data;
      const tokensInParent = state.tokens[parent] ?? [];
      const renamedTokensInParent = tokensInParent.map((token) => {
        if (token.name.startsWith(`${oldName}.`) && token.type === type) {
          const { name, ...rest } = token;
          const newTokenName = name.replace(`${oldName}`, `${newName}`);
          return {
            ...rest,
            name: newTokenName,
          };
        }
        return token;
      }) as AnyTokenList;

      const newState = {
        ...state,
        tokens: {
          ...state.tokens,
          [parent]: renamedTokensInParent,
        },
      };
      return newState as TokenState;
    },

    duplicateTokenGroup: (state, data: DuplicateTokenGroupPayload) => {
      const {
        parent, oldName, newName, tokenSets, type,
      } = data;
      const selectedTokenGroup = state.tokens[parent].filter(
        (token) => token.name.startsWith(`${oldName}.`) && token.type === type,
      );
      const newTokenGroup = selectedTokenGroup.map((token) => {
        const { name, ...rest } = token;
        const duplicatedTokenGroupName = token.name.replace(oldName, newName);
        return {
          name: duplicatedTokenGroupName,
          ...rest,
        };
      });

      const newTokens = Object.keys(state.tokens).reduce<Record<string, AnyTokenList>>((acc, key) => {
        if (tokenSets.includes(key)) {
          acc[key] = [...state.tokens[key], ...newTokenGroup];
        } else {
          acc[key] = state.tokens[key];
        }
        return acc;
      }, {});

      return {
        ...state,
        tokens: newTokens,
      };
    },
    setUpdatedAliases: (state, newTokens: TokenStore['values']) => ({
      ...state,
      tokens: newTokens,
    }),
    setCollapsedTokenSets: (state, data: string[]) => ({
      ...state,
      collapsedTokenSets: data,
    }),
    setCollapsedTokenTypeObj: (state, data: Record<TokenTypes, boolean>) => ({
      ...state,
      collapsedTokenTypeObj: data,
    }),
    updateCheckForChanges: (state, data: boolean) => ({
      ...state,
      checkForChanges: data,
    }),
    setCollapsedTokens: (state, data: string[]) => ({
      ...state,
      collapsedTokens: data,
    }),
    setChangedState: (
      state,
      receivedState: { tokens: Record<string, AnyTokenList>; themes: ThemeObjectsList },
    ): TokenState => {
      const localState = {
        tokens: state.tokens,
        themes: state.themes,
      };
      return {
        ...state,
        changedState: findDifferentState(localState, receivedState),
      } as TokenState;
    },
    resetChangedState: (state) => ({
      ...state,
      changedState: {
        tokens: {},
        themes: [],
        tokensSize: 0,
      },
    }),
    setRemoteData: (state, data: CompareStateType): TokenState => ({
      ...state,
      remoteData: data,
    }),
    setTokenFormat: (state, data: TokenFormatOptions): TokenState => ({
      ...state,
      tokenFormat: data,
    }),
    renameTokenAcrossSets: (state, data: RenameTokensAcrossSetsPayload) => {
      const {
        oldName, newName, type, tokenSets,
      } = data;
      const newTokens: TokenStore['values'] = {};
      Object.keys(state.tokens).forEach((tokenSet) => {
        if (tokenSets.includes(tokenSet)) {
          const existingTokenIndex = state.tokens[tokenSet].findIndex((n) => n.name === oldName && n.type === type);
          if (existingTokenIndex > -1) {
            const existingTokens = [...state.tokens[tokenSet]];
            existingTokens.splice(existingTokenIndex, 1, {
              ...state.tokens[tokenSet][existingTokenIndex],
              name: newName,
            } as SingleToken);
            newTokens[tokenSet] = existingTokens;
          }
        }
      });

      return {
        ...state,
        tokens: {
          ...state.tokens,
          ...newTokens,
        },
      };
    },
    setThemesFromVariables: (state, themes: ThemeObjectsList): TokenState => {
      const newThemes: ThemeObjectsList = [];
      const updatedThemes: ThemeObjectsList = [];

      themes.forEach((theme) => {
        // Use figmaCollectionId and figmaModeId to identify themes, not just figmaCollectionId
        const existingTheme = state.themes.find((t) => t.$figmaCollectionId === theme.$figmaCollectionId
          && t.$figmaModeId === theme.$figmaModeId);

        if (existingTheme) {
          // Check if anything has changed that requires an update
          const needsUpdate = !isEqual(existingTheme.selectedTokenSets, theme.selectedTokenSets)
                              || !isEqual(existingTheme.name, theme.name)
                              || !isEqual(existingTheme.group, theme.group);

          if (needsUpdate) {
            updatedThemes.push({
              ...existingTheme, // Keep existing properties
              ...theme, // Apply updates
              // Ensure we preserve the existing selectedTokenSets and add new ones
              selectedTokenSets: {
                ...existingTheme.selectedTokenSets,
                ...theme.selectedTokenSets,
              },
            });
          }
        } else {
          newThemes.push(theme);
        }
      });

      return {
        ...state,
        importedThemes: {
          newThemes,
          updatedThemes,
        },
      };
    },
    setCompressedData: (state, payload: { compressedTokens: string; compressedThemes: string }) => ({
      ...state,
      compressedTokens: payload.compressedTokens,
      compressedThemes: payload.compressedThemes,
    }),
    ...tokenStateReducers,
  },
  effects: (dispatch) => ({
    editToken(payload: UpdateTokenPayload, rootState) {
      if (payload.oldName && payload.oldName !== payload.name) {
        dispatch.tokenState.updateAliases({ oldName: payload.oldName, newName: payload.name });
      }

      if (payload.shouldUpdate && rootState.settings.updateMode !== 'document') {
        dispatch.tokenState.updateDocument({ shouldUpdateNodes: rootState.settings.updateOnChange });
      }

      if (payload.shouldUpdate && rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        const tokenSet = rootState.tokenState.tokens[payload.parent];
        if (tokenSet) {
          const updatedSet = tokenSet.map((token) => {
            if (token.name === payload.oldName) {
              return {
                name: payload.name,
                description: payload.description,
                value: payload.value,
                type: payload.type,
                $extensions: payload.$extensions,
              } as SingleToken;
            }
            return token;
          });

          const rawSet = singleTokensToRawTokenSet(updatedSet, true);

          pushToTokensStudio({
            context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
            action: 'UPDATE_TOKEN_SET',
            data: {
              raw: rawSet,
              name: payload.parent,
            },
          });
        }
      }
    },
    deleteToken(payload: DeleteTokenPayload, rootState) {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        const tokenSet = rootState.tokenState.tokens[payload.parent];
        if (tokenSet) {
          const newSet = tokenSet.filter((token) => token.name !== payload.path);
          const rawSet = singleTokensToRawTokenSet(newSet, true);

          pushToTokensStudio({
            context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
            action: 'UPDATE_TOKEN_SET',
            data: {
              raw: rawSet,
              name: payload.parent,
            },
          });
        }
      }
    },
    deleteDuplicateTokens() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    deleteTokenGroup() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    addTokenSet(name: string, rootState) {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        createTokenSetInTokensStudio({
          rootState,
          name,
          onTokenSetCreated: dispatch.tokenState.setTokenSetMetadata,
        });
      }
    },
    duplicateTokenSet() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    duplicateTokenGroup() {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });
    },
    renameTokenSet(data: { oldName: string; newName: string }, rootState) {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        updateTokenSetInTokensStudio({
          rootState,
          data,
          onTokenSetUpdated: dispatch.tokenState.setTokenSetMetadata,
        });
      }
    },
    deleteTokenSet(name: string, rootState) {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        deleteTokenSetFromTokensStudio({
          rootState,
          name,
          onTokenSetDeleted: dispatch.tokenState.setTokenSetMetadata,
        });
      }
    },
    setTokenSetOrder(data: string[], rootState) {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        pushToTokensStudio({
          context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
          action: 'UPDATE_TOKEN_SET_ORDER',
          data: data.map((name, index) => ({
            orderIndex: index,
            path: name,
          })),
        });
      }
    },
    setTokenData(payload: SetTokenDataPayload) {
      // When tokens update we set the format to the format that we parsed
      dispatch.tokenState.setTokenFormat(TokenFormat.format);

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
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        duplicateTokenInTokensStudio({
          rootState,
          payload,
        });
      }
    },
    createToken(payload: UpdateTokenPayload, rootState) {
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false });

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        createTokenInTokensStudio({
          rootState,
          payload,
        });
      }
    },
    setTokenFormat(payload: TokenFormatOptions) {
      setFormat(payload);
    },
    renameTokenGroup(data: RenameTokenGroupPayload, rootState) {
      const {
        oldName, newName, type, parent,
      } = data;

      const tokensInParent = rootState.tokenState.tokens[parent] ?? [];
      tokensInParent
        .filter((token) => token.name.startsWith(`${newName}.`) && token.type === type)
        .forEach((updatedToken) => {
          dispatch.tokenState.updateAliases({
            oldName: updatedToken.name.replace(`${newName}`, `${oldName}`),
            newName: updatedToken.name,
          });
        });
    },
    updateCheckForChanges(checkForChanges: boolean, rootState) {
      if (rootState.uiState.storageType.provider !== StorageProviderType.LOCAL) {
        updateCheckForChangesAtomic(checkForChanges);
      }
    },
    renameTokenAcrossSets(data: RenameTokensAcrossSetsPayload) {
      const { oldName, newName } = data;

      dispatch.tokenState.updateAliases({ oldName, newName });
    },
    updateDocument(options?: UpdateDocumentPayload, rootState?) {
      const defaults = { shouldUpdateNodes: true, updateRemote: true };
      const params = { ...defaults, ...options };
      if (!rootState) return;
      try {
        const tokensSize = checkStorageSize(rootState.tokenState.tokens);
        const themesSize = checkStorageSize(rootState.tokenState.themes);

        // Update the tokensSize in state if it has changed
        if (rootState.tokenState.tokensSize !== tokensSize) {
          dispatch.tokenState.setTokensSize(tokensSize);
        }

        // Update the themesSize in state if it has changed
        if (rootState.tokenState.themesSize !== themesSize) {
          dispatch.tokenState.setThemesSize(Number(themesSize.toFixed(1)));
        }

        // Check if there are unsaved changes before updating
        if (rootState.uiState.storageType.provider !== StorageProviderType.TOKENS_STUDIO) {
          const { lastSyncedState } = rootState.tokenState;
          const hasChanges = !compareLastSyncedState(
            rootState.tokenState.tokens,
            rootState.tokenState.themes,
            lastSyncedState,
            rootState.tokenState.tokenFormat,
          );

          // Update checkForChanges flag before proceeding with updates
          if (hasChanges !== rootState.tokenState.checkForChanges) {
            dispatch.tokenState.updateCheckForChanges(hasChanges);
          }
        }

        wrapTransaction(
          {
            name: 'updateDocument',
            statExtractor: (result, transaction) => {
              transaction.setMeasurement(
                'tokens',
                Object.entries(rootState.tokenState.tokens).reduce((acc, [, tokens]) => {
                  acc += tokens.length;
                  return acc;
                }, 0),
                '',
              );
              transaction.setMeasurement('tokenSets', Object.keys(rootState.tokenState.tokens).length, '');
              transaction.setMeasurement('themes', rootState.tokenState.themes.length, '');
              transaction.setMeasurement('tokensSize', tokensSize, 'KB');
              transaction.setMeasurement('themesSize', themesSize, 'KB');
            },
          },
          () => {
            // Compress tokens and themes
            const compressedTokens = compressToUTF16(JSON.stringify(rootState.tokenState.tokens));
            const compressedThemes = compressToUTF16(JSON.stringify(rootState.tokenState.themes));

            // Update the compressed values in state
            dispatch.tokenState.setCompressedData({
              compressedTokens,
              compressedThemes,
            });

            updateTokensOnSources({
              tokens: params.shouldUpdateNodes ? rootState.tokenState.tokens : null,
              compressedTokens,
              tokenValues: rootState.tokenState.tokens,
              usedTokenSet: rootState.tokenState.usedTokenSet,
              themes: rootState.tokenState.themes,
              compressedThemes,
              activeTheme: rootState.tokenState.activeTheme,
              settings: rootState.settings,
              updatedAt: new Date().toISOString(),
              lastUpdatedAt: rootState.uiState.lastUpdatedAt ?? new Date().toISOString(),
              isLocal: rootState.uiState.storageType.provider === StorageProviderType.LOCAL,
              editProhibited: rootState.tokenState.editProhibited,
              api: rootState.uiState.api,
              storageType: rootState.uiState.storageType,
              shouldUpdateRemote: params.updateRemote && rootState.settings.updateRemote,
              checkForChanges: rootState.tokenState.checkForChanges,
              shouldSwapStyles: rootState.settings.shouldSwapStyles,
              collapsedTokenSets: rootState.tokenState.collapsedTokenSets,
              storeTokenIdInJsonEditor: rootState.settings.storeTokenIdInJsonEditor,
              dispatch,
              tokenFormat: rootState.tokenState.tokenFormat,
              tokensSize: rootState.tokenState.tokensSize,
              themesSize: rootState.tokenState.themesSize,
            });
          },
        );
      } catch (e) {
        console.error('Error updating document', e);
      }
    },
    async updateAliases(data: TokenToRename, rootState) {
      const { updatedTokens, updatedSets } = updateAliasesInState(rootState.tokenState.tokens, data);

      dispatch.tokenState.setUpdatedAliases(updatedTokens);

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        for (const set of updatedSets) {
          const content = updatedTokens[set];
          const rawSet = singleTokensToRawTokenSet(content, true);

          pushToTokensStudio({
            context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
            action: 'UPDATE_TOKEN_SET',
            data: { raw: rawSet, name: set },
          });
        }
      }
    },
    handleRenamedCollections(renamedCollections: [string, string][], rootState) {
      // Create a copy of the current state to accumulate all changes
      const updatedUsedTokenSet = { ...rootState.tokenState.usedTokenSet };
      let updatedActiveTokenSet = rootState.tokenState.activeTokenSet;
      const updatedTokens = { ...rootState.tokenState.tokens };
      const updatedThemes = [...rootState.tokenState.themes];

      const originalTokenSetOrder = Object.keys(rootState.tokenState.tokens);

      for (const [oldName, newName] of renamedCollections) {
        if (oldName in rootState.tokenState.tokens) {
          if (!(newName in updatedTokens)) {
            updatedTokens[newName] = [...rootState.tokenState.tokens[oldName]];
          }

          delete updatedTokens[oldName];
        }
      }

      const orderedTokens: typeof updatedTokens = {};
      for (const tokenSetName of originalTokenSetOrder) {
        // Check if this token set was renamed
        const renamedTo = renamedCollections.find(([oldName]) => oldName === tokenSetName)?.[1];

        if (renamedTo && renamedTo in updatedTokens) {
          // Use the new name but preserve the position
          orderedTokens[renamedTo] = updatedTokens[renamedTo];
        } else if (tokenSetName in updatedTokens) {
          orderedTokens[tokenSetName] = updatedTokens[tokenSetName];
        }
      }

      // Add any new token sets that weren't in the original order (shouldn't happen in rename scenario, but safety check)
      for (const [tokenSetName, tokens] of Object.entries(updatedTokens)) {
        if (!(tokenSetName in orderedTokens)) {
          orderedTokens[tokenSetName] = tokens;
        }
      }

      Object.keys(updatedTokens).forEach((key) => delete updatedTokens[key]);
      Object.assign(updatedTokens, orderedTokens);

      for (const [oldName, newName] of renamedCollections) {
        // Update usedTokenSet if needed
        if (oldName in updatedUsedTokenSet) {
          // If the status wasn't already copied, copy it
          if (!(newName in updatedUsedTokenSet)) {
            updatedUsedTokenSet[newName] = updatedUsedTokenSet[oldName];
          }

          delete updatedUsedTokenSet[oldName];
        }

        if (updatedActiveTokenSet === oldName) {
          updatedActiveTokenSet = newName;
        }

        // Remove old token set references from themes when token sets are deleted
        for (let i = 0; i < updatedThemes.length; i += 1) {
          const theme = updatedThemes[i];
          if (theme.selectedTokenSets && oldName in theme.selectedTokenSets) {
            updatedThemes[i] = {
              ...theme,
              selectedTokenSets: {
                ...theme.selectedTokenSets,
              },
            };
            // Remove the old token set reference since the token set is being deleted
            delete updatedThemes[i].selectedTokenSets[oldName];
          }
        }
      }

      dispatch.tokenState.setTokens(updatedTokens);
      dispatch.tokenState.setUsedTokenSet(updatedUsedTokenSet);
      dispatch.tokenState.replaceThemes(updatedThemes);
      if (updatedActiveTokenSet !== rootState.tokenState.activeTokenSet) {
        dispatch.tokenState.setActiveTokenSet(updatedActiveTokenSet);
      }

      // Update the document to reflect the changes
      dispatch.tokenState.updateDocument({
        shouldUpdateNodes: false,
        updateRemote: true,
      });

      // If using Tokens Studio storage, update remote data
      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        for (const [oldName, newName] of renamedCollections) {
          if (oldName in rootState.tokenState.tokens
              || Object.keys(updatedTokens).some((key) => key === newName)) {
            updateTokenSetInTokensStudio({
              rootState,
              data: { oldName, newName },
              onTokenSetUpdated: dispatch.tokenState.setTokenSetMetadata,
            });
          }
        }
      }
    },
    ...Object.fromEntries(Object.entries(tokenStateEffects).map(([key, factory]) => [key, factory(dispatch)])),
  }),
});
