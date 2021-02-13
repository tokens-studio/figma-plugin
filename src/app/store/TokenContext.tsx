import * as React from 'react';
import JSON5 from 'json5';
import objectPath from 'object-path';
import defaultJSON from '../../config/default.json';
import TokenData from '../components/TokenData';
import * as pjs from '../../../package.json';
import {TokenProps} from '../../types/tokens';
import {StorageProviderType, ApiDataType, StorageType} from '../../types/api';
import {postToFigma} from '../../plugin/notifiers';
import {updateTokensOnSources} from './remoteTokens';
import {MessageToPluginTypes} from '../../types/messages';

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

export enum ActionType {
    SetTokenData = 'SET_TOKEN_DATA',
    SetTokensFromStyles = 'SET_TOKENS_FROM_STYLES',
    SetDefaultTokens = 'SET_DEFAULT_TOKENS',
    SetEmptyTokens = 'SET_EMPTY_TOKENS',
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
    SetShowOptions = 'SET_SHOW_OPTIONS',
    SetDisplayType = 'SET_DISPLAY_TYPE',
    ToggleColorMode = 'TOGGLE_COLOR_MODE',
    SetCollapsed = 'SET_COLLAPSED',
    SetApiData = 'SET_API_DATA',
    ToggleUpdatePageOnly = 'TOGGLE_UPDATE_PAGE_ONLY',
    ToggleUpdateAfterApply = 'TOGGLE_UPDATE_AFTER_APPLY',
    SetStorageType = 'SET_STORAGE_TYPE',
    SetAPIProviders = 'SET_API_PROVIDERS',
}

const defaultTokens: TokenProps = {
    version: pjs.version,
    updatedAt: new Date().toString(),
    values: {
        options: JSON.stringify(defaultJSON, null, 2),
    },
};

const emptyTokens: TokenProps = {
    version: pjs.version,
    updatedAt: new Date().toString(),
    values: {
        options: '{ }',
    },
};

const emptyState = {
    tokens: defaultTokens,
    loading: true,
    disabled: false,
    collapsed: false,
    tokenData: new TokenData(emptyTokens),
    selectionValues: {},
    displayType: 'GRID',
    colorMode: false,
    showEditForm: false,
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
    apiProviders: [],
    updatePageOnly: true,
    updateAfterApply: true,
};

const TokenStateContext = React.createContext(emptyState);
const TokenDispatchContext = React.createContext(null);

function stateReducer(state, action) {
    switch (action.type) {
        case ActionType.SetTokenData:
            return {
                ...state,
                tokenData: action.data,
            };
        case ActionType.SetTokensFromStyles:
            state.tokenData.injectTokens(action.data);
            updateTokensOnSources(state, action.updatedAt);
            return {
                ...state,
                tokens: state.tokenData.tokens,
            };
        case ActionType.SetEmptyTokens:
            return {
                ...state,
                ...emptyState,
                apiProviders: state.apiProviders,
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
                tokens: {
                    ...state.tokens,
                    [action.data.parent]: {
                        hasErrored: state.tokenData.checkTokenValidity(action.data.tokens),
                        values: action.data.tokens,
                    },
                },
            };
        case ActionType.UpdateTokens:
            updateTokensOnSources(state, action.updatedAt, action.shouldUpdate);
            return state;
        case ActionType.DeleteToken: {
            const obj = JSON5.parse(state.tokenData.tokens[action.data.parent].values);
            objectPath.del(obj, [action.data.path, action.data.name].join('.'));
            const tokens = JSON.stringify(obj, null, 2);
            state.tokenData.updateTokenValues(action.data.parent, tokens, action.updatedAt);
            const newState = {
                ...state,
                tokens: {
                    ...state.tokens,
                    [action.data.parent]: {
                        hasErrored: state.tokenData.checkTokenValidity(tokens),
                        values: tokens,
                    },
                },
            };
            updateTokensOnSources(newState, action.updatedAt);
            return newState;
        }
        case ActionType.CreateStyles:
            postToFigma({
                type: MessageToPluginTypes.CREATE_STYLES,
                tokens: state.tokenData.getMergedTokens(),
            });
            return state;
        case ActionType.SetNodeData:
            postToFigma({
                type: MessageToPluginTypes.SET_NODE_DATA,
                values: action.data,
                tokens: state.tokenData.getMergedTokens(),
            });
            return state;
        case ActionType.RemoveNodeData:
            postToFigma({
                type: MessageToPluginTypes.REMOVE_NODE_DATA,
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
        case ActionType.SetAPIProviders: {
            return {
                ...state,
                apiProviders: action.data,
            };
        }
        case ActionType.ToggleUpdatePageOnly:
            return {
                ...state,
                updatePageOnly: action.bool,
            };
        case ActionType.ToggleUpdateAfterApply:
            return {
                ...state,
                updateAfterApply: action.bool,
            };
        case ActionType.SetStorageType:
            if (action.bool) {
                postToFigma({
                    type: MessageToPluginTypes.SET_STORAGE_TYPE,
                    storageType: action.data,
                    tokens: state.tokenData.getMergedTokens(),
                });
            }
            return {
                ...state,
                storageType: action.data,
            };
        default:
            throw new Error('Not implemented');
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
                dispatch({type: ActionType.SetTokenData, data: new TokenData(defaultTokens)});
                dispatch({type: ActionType.SetLoading, state: false});
            },
            setEmptyTokens: () => {
                dispatch({type: ActionType.SetEmptyTokens});
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
            removeNodeData: (data: SelectionValue) => {
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
            toggleUpdatePageOnly: (bool: boolean) => {
                dispatch({type: ActionType.ToggleUpdatePageOnly, bool});
            },
            toggleUpdateAfterApply: (bool: boolean) => {
                dispatch({type: ActionType.ToggleUpdateAfterApply, bool});
            },
            setStorageType: (data: StorageType, bool = false) => {
                dispatch({type: ActionType.SetStorageType, data, bool});
            },
            setAPIProviders: (data: ApiDataType[]) => {
                dispatch({type: ActionType.SetAPIProviders, data});
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
