import * as React from 'react';
import objectPath from 'object-path';
import set from 'set-value';
import fetchChangelog from '@/utils/storyblok';
import {track} from '@/utils/analytics';
import convertToTokenArray from '@/utils/convertTokens';
import {mergeDeep} from '@/plugin/helpers';
import {getAliasValue} from '@/utils/aliases';
import defaultJSON from '../../config/default.json';
import TokenData from '../components/TokenData';
import * as pjs from '../../../package.json';
import {SingleToken, TokenProps} from '../../../types/tokens';
import {StorageProviderType, ApiDataType, StorageType} from '../../../types/api';
import {postToFigma} from '../../plugin/notifiers';
import {MessageToPluginTypes} from '../../../types/messages';
import updateTokensOnSources from './updateSources';

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

export function getMergedTokens(tokens, usedTokenSet, shouldResolve = false) {
    const mergedTokens = [];
    Object.entries(tokens).forEach((tokenGroup) => {
        if (usedTokenSet.includes(tokenGroup[0])) {
            mergedTokens.push(...tokenGroup[1].values);
        }
    });
    let returnedTokens = mergedTokens;

    if (shouldResolve) {
        returnedTokens = mergedTokens.map((t) => {
            console.log('t is', t);
            return {
                ...t,
                value: getAliasValue(t, mergedTokens),
            };
        });
    }

    return returnedTokens;
}

export function reduceToValues(tokens) {
    const reducedTokens = Object.entries(tokens).reduce((prev, group) => {
        prev.push({[group[0]]: group[1].values});
        return prev;
    }, []);

    const assigned = mergeDeep({}, ...reducedTokens);

    return assigned;
}

export enum ActionType {
    SetTokenData = 'SET_TOKEN_DATA',
    SetTokensFromStyles = 'SET_TOKENS_FROM_STYLES',
    SetDefaultTokens = 'SET_DEFAULT_TOKENS',
    SetLoading = 'SET_LOADING',
    SetDisabled = 'SET_DISABLED',
    SetStringTokens = 'SET_STRING_TOKENS',
    UpdateTokens = 'UPDATE_TOKENS',
    DeleteToken = 'DELETE_TOKEN',
    CreateStyles = 'CREATE_STYLES',
    SetNodeData = 'SET_NODE_DATA',
    RemoveNodeData = 'REMOVE_NODE_DATA',
    PullStyles = 'PULL_STYLES',
    SetSelectionValues = 'SET_SELECTION_VALUES',
    ResetSelectionValues = 'RESET_SELECTION_VALUES',
    SetShowEditForm = 'SET_SHOW_EDIT_FORM',
    SetShowNewGroupForm = 'SET_SHOW_NEW_GROUP_FORM',
    SetShowOptions = 'SET_SHOW_OPTIONS',
    SetDisplayType = 'SET_DISPLAY_TYPE',
    ToggleColorMode = 'TOGGLE_COLOR_MODE',
    SetCollapsed = 'SET_COLLAPSED',
    SetApiData = 'SET_API_DATA',
    ToggleUpdatePageOnly = 'TOGGLE_UPDATE_PAGE_ONLY',
    ToggleShowEmptyGroups = 'TOGGLE_SHOW_EMPTY_GROUPS',
    ToggleUpdateAfterApply = 'TOGGLE_UPDATE_AFTER_APPLY',
    SetStorageType = 'SET_STORAGE_TYPE',
    SetAPIProviders = 'SET_API_PROVIDERS',
    SetLocalApiState = 'SET_LOCAL_API_STATE',
    SetActiveTokenSet = 'SET_ACTIVE_TOKEN_SET',
    ToggleUsedTokenSet = 'TOGGLE_USED_TOKEN_SET',
    AddTokenSet = 'ADD_TOKEN_SET',
    DeleteTokenSet = 'DELETE_TOKEN_SET',
    RenameTokenSet = 'RENAME_TOKEN_SET',
    SetTokenSetOrder = 'SET_TOKEN_SET_ORDER',
    SetProjectURL = 'SET_PROJECT_URL',
    SetChangelog = 'SET_CHANGELOG',
    SetLastOpened = 'SET_LAST_OPENED',
    UpdateSingleToken = 'UPDATE_SINGLE_TOKEN',
    CreateToken = 'CREATE_TOKEN',
    EditToken = 'EDIT_TOKEN',
    CreateTokenGroup = 'CREATE_TOKEN_GROUP',
    SetSyncEnabled = 'SET_SYNC_ENABLED',
}

const defaultTokens: TokenProps = {
    version: pjs.version,
    updatedAt: new Date().toString(),
    values: {
        options: JSON.stringify(defaultJSON, null, 2),
    },
};

export const emptyTokens: TokenProps = {
    version: pjs.version,
    updatedAt: new Date().toString(),
    values: {
        options: '{ }',
    },
};

const emptyState = {
    activeTokenSet: 'options',
    usedTokenSet: ['options'],
    tokens: defaultTokens,
    loading: true,
    disabled: false,
    collapsed: false,
    tokenData: null,
    selectionValues: {},
    displayType: 'GRID',
    colorMode: false,
    showEditForm: false,
    showNewGroupForm: false,
    showEmptyGroups: true,
    showOptions: '',
    storageType: {
        provider: StorageProviderType.LOCAL,
        id: '',
        name: '',
    },
    api: {
        id: '',
        secret: '',
        provider: '',
        name: '',
    },
    localApiState: {
        id: '',
        secret: '',
        name: '',
        provider: '',
        new: false,
    },
    apiProviders: [],
    projectURL: '',
    updatePageOnly: true,
    updateAfterApply: true,
    editProhibited: true,
    changelog: [],
    lastOpened: '',
    syncEnabled: true,
    lastUpdatedAt: null,
};

const parseTokenValues = (tokens) => {
    console.log('Parsing values', tokens);
    if (Array.isArray(tokens)) {
        return {
            global: {
                type: 'array',
                values: tokens,
            },
        };
    }
    const reducedTokens = Object.entries(tokens).reduce((prev, group) => {
        const parsedGroup = group[1];
        if (typeof parsedGroup === 'object') {
            const groupValues = [];
            const convertedToArray = convertToTokenArray({tokens: parsedGroup});
            convertedToArray.forEach(([key, value]) => {
                groupValues.push({name: key, ...value});
            });
            const convertedGroup = groupValues;
            console.log('Converted Group', convertedGroup);
            prev.push({[group[0]]: {type: 'array', values: convertedGroup}});
            return prev;
        }
    }, []);

    console.log('reduced tokens is', Object.assign({}, ...reducedTokens));

    return Object.assign({}, ...reducedTokens);
};

const TokenStateContext = React.createContext(emptyState);
const TokenDispatchContext = React.createContext(null);

function stateReducer(state, action) {
    switch (action.type) {
        case ActionType.SetTokenData: {
            console.log('Setting token data', action);
            return {
                ...state,
                tokens: parseTokenValues(action.data.values),
                activeTokenSet: Array.isArray(action.data.values) ? 'global' : Object.keys(action.data.values)[0],
                usedTokenSet: Array.isArray(action.data.values) ? 'global' : Object.keys(action.data.values)[0],
            };
        }
        case ActionType.SetTokensFromStyles:
            state.tokenData.injectTokens(action.data, state.activeTokenSet);
            updateTokensOnSources(state, action.updatedAt);
            return {
                ...state,
                tokens: state.tokenData.tokens,
            };
        case ActionType.SetLoading:
            return {
                ...state,
                loading: action.state,
            };
        case ActionType.SetDisabled:
            return {
                ...state,
                disabled: action.state,
            };
        case ActionType.SetStringTokens:
            state.tokenData.updateTokenValues(action.data.parent, action.data.tokens, action.updatedAt);
            return {
                ...state,
                tokenData: state.tokenData,
            };
        case ActionType.UpdateTokens:
            updateTokensOnSources(state, action.updatedAt, action.shouldUpdate);
            return state;
        case ActionType.CreateStyles:
            postToFigma({
                type: MessageToPluginTypes.CREATE_STYLES,
                tokens: getMergedTokens(state.tokens, state.usedTokenSet),
            });
            return state;
        case ActionType.SetNodeData:
            postToFigma({
                type: MessageToPluginTypes.SET_NODE_DATA,
                values: action.data,
                tokens: getMergedTokens(state.tokens, state.usedTokenSet, true),
            });
            return state;
        case ActionType.RemoveNodeData:
            postToFigma({
                type: MessageToPluginTypes.REMOVE_NODE_DATA,
                key: action.data,
            });
            return state;
        case ActionType.PullStyles:
            postToFigma({
                type: MessageToPluginTypes.PULL_STYLES,
                styleTypes: {
                    textStyles: true,
                    colorStyles: true,
                },
            });
            return state;

        case ActionType.SetSelectionValues:
            return {
                ...state,
                loading: false,
                selectionValues: action.data,
            };
        case ActionType.UpdateSingleToken: {
            const {parent, value, newGroup, options, name, oldName, updatedAt} = action.data;
            const obj = state.tokenData.tokens[parent].values;
            let newValue;
            if (newGroup) {
                newValue = {};
            } else {
                newValue = options
                    ? {
                          value,
                          ...options,
                      }
                    : {
                          value,
                      };
            }
            const newName = name.toString();
            set(obj, newName, newValue);
            if (oldName === newName || !oldName) {
                console.log('DELETING', state.tokenData.tokens[parent].values);

                state.tokenData.updateTokenValues(parent, JSON.stringify(obj, null, 2), updatedAt);
            } else {
                console.log('DELETING', state.tokenData.tokens[parent].values);
                objectPath.del(obj, oldName);
                state.tokenData.updateTokenValues(
                    parent,
                    JSON.stringify(obj, null, 2).split(`$${oldName}`).join(`$${name}`),
                    updatedAt
                );
            }

            return {
                ...state,
                tokenData: state.tokenData,
            };
        }
        case ActionType.ToggleUsedTokenSet: {
            const newState = {
                ...state,
                usedTokenSet: state.usedTokenSet.includes(action.data)
                    ? state.usedTokenSet.filter((n) => n !== action.data)
                    : [...new Set([...state.usedTokenSet, action.data])],
            };
            state.tokenData.setUsedTokenSet(newState.usedTokenSet);
            updateTokensOnSources(state, action.updatedAt, false);
            return newState;
        }
        case ActionType.ResetSelectionValues:
            return {
                ...state,
                loading: false,
                selectionValues: {},
            };
        case ActionType.SetShowEditForm:
            return {
                ...state,
                showEditForm: action.bool,
            };
        case ActionType.SetShowNewGroupForm:
            return {
                ...state,
                showNewGroupForm: action.bool,
            };
        case ActionType.SetShowOptions:
            return {
                ...state,
                showOptions: action.data,
            };
        case ActionType.SetDisplayType:
            return {
                ...state,
                displayType: action.data,
            };
        case ActionType.ToggleColorMode:
            return {
                ...state,
                colorMode: !state.colorMode,
            };
        case ActionType.SetCollapsed:
            return {
                ...state,
                collapsed: !state.collapsed,
            };
        case ActionType.SetApiData:
            return {
                ...state,
                syncEnabled: true,
                api: action.data,
            };
        case ActionType.SetLocalApiState: {
            return {
                ...state,
                localApiState: action.data,
            };
        }
        case ActionType.SetAPIProviders: {
            return {
                ...state,
                apiProviders: action.data,
            };
        }
        case ActionType.ToggleUpdatePageOnly:
            track('Toggle Update Page Only', {state: action.bool});
            return {
                ...state,
                updatePageOnly: action.bool,
            };
        case ActionType.ToggleShowEmptyGroups:
            return {
                ...state,
                showEmptyGroups: !state.showEmptyGroups,
            };
        case ActionType.ToggleUpdateAfterApply:
            return {
                ...state,
                updateAfterApply: action.bool,
            };
        case ActionType.SetActiveTokenSet:
            return {
                ...state,
                activeTokenSet: action.data,
            };
        case ActionType.AddTokenSet: {
            state.tokenData.addTokenSet(action.data, action.updatedAt);
            return {
                ...state,
                tokenData: state.tokenData,
            };
        }
        case ActionType.DeleteTokenSet: {
            state.tokenData.deleteTokenSet(action.data, action.updatedAt);
            return {
                ...state,
                activeTokenSet:
                    state.activeTokenSet === action.data ? Object.keys(state.tokens)[0] : state.activeTokenSet,
            };
        }
        case ActionType.RenameTokenSet: {
            state.tokenData.renameTokenSet({
                oldName: action.oldName,
                newName: action.newName,
                updatedAt: action.updatedAt,
            });
            return {
                ...state,
                activeTokenSet: state.activeTokenSet === action.oldName ? action.newName : state.activeTokenSet,
            };
        }
        case ActionType.SetTokenSetOrder: {
            state.tokenData.reorderTokenSets(action.data);
            return {
                ...state,
                tokenData: state.tokenData,
            };
        }
        case ActionType.SetProjectURL: {
            return {
                ...state,
                projectURL: action.data,
            };
        }
        case ActionType.SetSyncEnabled: {
            return {
                ...state,
                syncEnabled: action.data,
            };
        }
        case ActionType.SetStorageType:
            if (action.bool) {
                postToFigma({
                    type: MessageToPluginTypes.SET_STORAGE_TYPE,
                    storageType: action.data,
                    tokens: getMergedTokens(state.tokens, state.usedTokenSet),
                });
            }
            return {
                ...state,
                editProhibited: false,
                storageType: action.data,
            };
        case ActionType.SetChangelog:
            return {
                ...state,
                changelog: action.data,
            };
        case ActionType.SetLastOpened:
            fetchChangelog(action.data, (result) => {
                action.dispatch({type: ActionType.SetChangelog, data: result});
            });

            return {
                ...state,
                lastOpened: action.data,
            };
        case ActionType.CreateToken: {
            console.log('Creating Token', state.tokens, action);
            let newTokens = {};
            const existingToken = state.tokens[action.data.parent].values.find((n) => n.name === action.data.name);
            if (!existingToken) {
                newTokens = {
                    [action.data.parent]: {
                        values: [
                            ...state.tokens[action.data.parent].values,
                            {
                                name: action.data.name,
                                value: action.data.value,
                                ...action.data.options,
                            },
                        ],
                    },
                };
            }
            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    ...newTokens,
                },
            };
        }
        case ActionType.EditToken: {
            console.log('Editing Token', state.tokens, action);
            const nameToFind = action.data.oldName ? action.data.oldName : action.data.name;
            const index = state.tokens[action.data.parent].values.findIndex((token) => token.name === nameToFind);
            console.log('INDEX IS', index, state.tokens[action.data.parent].values);
            const newArray = [...state.tokens[action.data.parent].values];
            newArray[index] = {
                ...newArray[index],
                name: action.data.name,
                value: action.data.value,
                ...action.data.options,
            };

            console.log('NEw array is', newArray);
            console.log('NEw State is', {
                ...state,
                tokens: {
                    ...state.tokens,
                    [action.data.parent]: {
                        ...state.tokens[action.data.parent],
                        values: newArray,
                    },
                },
            });

            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    [action.data.parent]: {
                        ...state.tokens[action.data.parent],
                        values: newArray,
                    },
                },
            };
        }
        case ActionType.DeleteToken: {
            const newState = {
                ...state,
                tokens: {
                    ...state.tokens,
                    [action.data.parent]: {
                        ...state.tokens[action.data.parent],
                        values: state.tokens[action.data.parent].values.filter(
                            (token) => token.name !== action.data.path
                        ),
                    },
                },
            };
            updateTokensOnSources(newState, action.updatedAt);

            return newState;
        }
        case ActionType.CreateTokenGroup: {
            console.log('Not implemented');

            // state.tokenData.createTokenGroup({
            //     parent: action.data.parent,
            //     name: action.data.name,
            // });

            return {
                ...state,
                tokenData: state.tokenData,
            };
        }
        default:
            throw new Error('Context not implemented');
    }
}

function TokenProvider({children}) {
    const [state, dispatch] = React.useReducer(stateReducer, emptyState);

    const updatedAt = new Date().toString();

    const tokenContext = React.useMemo(
        () => ({
            setTokensFromStyles: (data) => {
                dispatch({type: ActionType.SetTokensFromStyles, data, updatedAt});
            },
            setTokenData: (data: TokenData) => {
                dispatch({type: ActionType.SetTokenData, data, updatedAt});
            },
            setStringTokens: (data: {parent: string; tokens: string}) => {
                dispatch({type: ActionType.SetStringTokens, data, updatedAt});
            },
            setDefaultTokens: () => {
                dispatch({type: ActionType.SetTokenData, data: defaultTokens});
                dispatch({type: ActionType.SetLoading, state: false});
            },
            setEmptyTokens: () => {
                dispatch({type: ActionType.SetTokenData, data: emptyTokens});
                dispatch({type: ActionType.SetLoading, state: false});
            },
            updateTokens: (shouldUpdate = true) => {
                dispatch({type: ActionType.UpdateTokens, updatedAt, shouldUpdate});
            },
            deleteToken: (data) => {
                dispatch({type: ActionType.DeleteToken, data, updatedAt});
            },
            createStyles: () => {
                dispatch({type: ActionType.CreateStyles});
            },
            setLoading: (boolean) => {
                dispatch({type: ActionType.SetLoading, state: boolean});
            },
            setDisabled: (boolean) => {
                dispatch({type: ActionType.SetDisabled, state: boolean});
            },
            setNodeData: (data: SelectionValue) => {
                dispatch({type: ActionType.SetNodeData, data});
            },
            removeNodeData: (data?: string) => {
                dispatch({type: ActionType.RemoveNodeData, data});
            },
            setSelectionValues: (data: SelectionValue) => {
                dispatch({type: ActionType.SetSelectionValues, data});
            },
            resetSelectionValues: () => {
                dispatch({type: ActionType.ResetSelectionValues});
            },
            setShowEditForm: (bool: boolean) => {
                dispatch({type: ActionType.SetShowEditForm, bool});
            },
            setShowNewGroupForm: (bool: boolean) => {
                dispatch({type: ActionType.SetShowNewGroupForm, bool});
            },
            setShowOptions: (data: string) => {
                dispatch({type: ActionType.SetShowOptions, data});
            },
            setDisplayType: (data: string) => {
                dispatch({type: ActionType.SetDisplayType, data});
            },
            toggleColorMode: () => {
                dispatch({type: ActionType.ToggleColorMode});
            },
            pullStyles: () => {
                dispatch({type: ActionType.PullStyles, updatedAt});
            },
            setCollapsed: () => {
                dispatch({type: ActionType.SetCollapsed});
            },
            setApiData: (data: ApiDataType) => {
                dispatch({type: ActionType.SetApiData, data});
            },
            setLocalApiState: (data: ApiDataType) => {
                dispatch({type: ActionType.SetLocalApiState, data});
            },
            setProjectURL: (data: string) => {
                dispatch({type: ActionType.SetProjectURL, data});
            },
            toggleUpdatePageOnly: (bool: boolean) => {
                dispatch({type: ActionType.ToggleUpdatePageOnly, bool});
            },
            toggleShowEmptyGroups: () => {
                dispatch({type: ActionType.ToggleShowEmptyGroups});
            },
            toggleUpdateAfterApply: (bool: boolean) => {
                dispatch({type: ActionType.ToggleUpdateAfterApply, bool});
            },
            toggleUsedTokenSet: (data: string) => {
                dispatch({type: ActionType.ToggleUsedTokenSet, data, updatedAt});
            },
            setStorageType: (data: StorageType, bool = false) => {
                dispatch({type: ActionType.SetStorageType, data, bool});
            },
            setAPIProviders: (data: ApiDataType[]) => {
                dispatch({type: ActionType.SetAPIProviders, data});
            },
            setActiveTokenSet: (data: string) => {
                dispatch({type: ActionType.SetActiveTokenSet, data});
            },
            addTokenSet: (data: string) => {
                dispatch({type: ActionType.AddTokenSet, data, updatedAt});
            },
            deleteTokenSet: (data: string) => {
                dispatch({type: ActionType.DeleteTokenSet, data, updatedAt});
            },
            renameTokenSet: (oldName: string, newName: string) => {
                dispatch({type: ActionType.RenameTokenSet, oldName, newName, updatedAt});
            },
            setTokenSetOrder: (data: string[]) => {
                dispatch({type: ActionType.SetTokenSetOrder, data, updatedAt});
            },
            setChangelog: (data: object[]) => {
                dispatch({type: ActionType.SetChangelog, data});
            },
            setLastOpened: (data: Date) => {
                dispatch({type: ActionType.SetLastOpened, data, dispatch});
            },
            updateSingleToken: (data: {
                parent: string;
                value: SingleToken;
                options?: object;
                name: string;
                oldName?: string;
                updatedAt: Date;
            }) => {
                dispatch({type: ActionType.UpdateSingleToken, data});
            },
            createToken: (data: {
                parent: string;
                value: SingleToken;
                options?: object;
                name: string;
                updatedAt: Date;
            }) => {
                dispatch({type: ActionType.CreateToken, data});
            },
            editToken: (data: {
                parent: string;
                value: SingleToken;
                options?: object;
                name: string;
                oldName?: string;
            }) => {
                dispatch({type: ActionType.EditToken, data});
            },
            createTokenGroup: (data: {parent: string; name: string; updatedAt: Date}) => {
                dispatch({type: ActionType.CreateTokenGroup, data});
            },
            setSyncEnabled: (data: boolean) => {
                dispatch({type: ActionType.SetSyncEnabled, data});
            },
        }),
        [dispatch, updatedAt]
    );

    return (
        <TokenStateContext.Provider value={state}>
            <TokenDispatchContext.Provider value={tokenContext}>{children}</TokenDispatchContext.Provider>
        </TokenStateContext.Provider>
    );
}

function useTokenState() {
    const context = React.useContext(TokenStateContext);
    if (context === undefined) {
        throw new Error('useTokenState must be used within a TokenProvider');
    }
    return context;
}
function useTokenDispatch() {
    const context = React.useContext(TokenDispatchContext);
    if (context === undefined) {
        throw new Error('useTokenDispatch must be used within a TokenProvider');
    }
    return context;
}

export {TokenProvider, useTokenState, useTokenDispatch};
