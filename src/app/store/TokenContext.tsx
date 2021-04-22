import * as React from 'react';
import fetchChangelog from '@/utils/storyblok';
import {StorageProviderType, ApiDataType} from '../../../types/api';
import {postToFigma} from '../../plugin/notifiers';
import {MessageToPluginTypes} from '../../../types/messages';

export enum ActionType {
    SetTokensFromStyles = 'SET_TOKENS_FROM_STYLES',
    SetLoading = 'SET_LOADING',
    SetStringTokens = 'SET_STRING_TOKENS',
    PullStyles = 'PULL_STYLES',
    SetShowEditForm = 'SET_SHOW_EDIT_FORM',
    SetShowNewGroupForm = 'SET_SHOW_NEW_GROUP_FORM',
    SetShowOptions = 'SET_SHOW_OPTIONS',
    SetDisplayType = 'SET_DISPLAY_TYPE',
    ToggleColorMode = 'TOGGLE_COLOR_MODE',
    SetCollapsed = 'SET_COLLAPSED',
    SetApiData = 'SET_API_DATA',
    ToggleShowEmptyGroups = 'TOGGLE_SHOW_EMPTY_GROUPS',
    ToggleUpdateAfterApply = 'TOGGLE_UPDATE_AFTER_APPLY',
    SetAPIProviders = 'SET_API_PROVIDERS',
    SetLocalApiState = 'SET_LOCAL_API_STATE',
    SetActiveTokenSet = 'SET_ACTIVE_TOKEN_SET',
    ToggleUsedTokenSet = 'TOGGLE_USED_TOKEN_SET',
    AddTokenSet = 'ADD_TOKEN_SET',
    DeleteTokenSet = 'DELETE_TOKEN_SET',
    RenameTokenSet = 'RENAME_TOKEN_SET',
    SetTokenSetOrder = 'SET_TOKEN_SET_ORDER',
    SetChangelog = 'SET_CHANGELOG',
    SetLastOpened = 'SET_LAST_OPENED',
    CreateTokenGroup = 'CREATE_TOKEN_GROUP',
    SetSyncEnabled = 'SET_SYNC_ENABLED',
}

const emptyState = {
    loading: true,
    collapsed: false,
    displayType: 'GRID',
    colorMode: false,
    showEditForm: false,
    showNewGroupForm: false,
    showEmptyGroups: true,
    showOptions: false,
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
    updateAfterApply: true,
    changelog: [],
    lastOpened: '',
    lastUpdatedAt: null,
};

const TokenStateContext = React.createContext(emptyState);
const TokenDispatchContext = React.createContext(null);

function stateReducer(state, action) {
    switch (action.type) {
        case ActionType.SetTokensFromStyles:
            state.tokenData.injectTokens(action.data, state.activeTokenSet);
            // updateTokensOnSources(state, action.updatedAt);
            return {
                ...state,
                tokens: state.tokenData.tokens,
            };
        case ActionType.SetLoading:
            return {
                ...state,
                loading: action.state,
            };
        case ActionType.PullStyles:
            postToFigma({
                type: MessageToPluginTypes.PULL_STYLES,
                styleTypes: {
                    textStyles: true,
                    colorStyles: true,
                },
            });
            return state;

        case ActionType.ToggleUsedTokenSet: {
            const newState = {
                ...state,
                usedTokenSet: state.usedTokenSet.includes(action.data)
                    ? state.usedTokenSet.filter((n) => n !== action.data)
                    : [...new Set([...state.usedTokenSet, action.data])],
            };
            state.tokenData.setUsedTokenSet(newState.usedTokenSet);
            // updateTokensOnSources(state, action.updatedAt, false);
            return newState;
        }
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
            setStringTokens: (data: {parent: string; tokens: string}) => {
                dispatch({type: ActionType.SetStringTokens, data, updatedAt});
            },
            setLoading: (boolean) => {
                dispatch({type: ActionType.SetLoading, state: boolean});
            },
            setShowEditForm: (bool: boolean) => {
                dispatch({type: ActionType.SetShowEditForm, bool});
            },
            setShowNewGroupForm: (bool: boolean) => {
                dispatch({type: ActionType.SetShowNewGroupForm, bool});
            },
            setShowOptions: (data: string | boolean) => {
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
            toggleShowEmptyGroups: () => {
                dispatch({type: ActionType.ToggleShowEmptyGroups});
            },
            toggleUpdateAfterApply: (bool: boolean) => {
                dispatch({type: ActionType.ToggleUpdateAfterApply, bool});
            },
            toggleUsedTokenSet: (data: string) => {
                dispatch({type: ActionType.ToggleUsedTokenSet, data, updatedAt});
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
