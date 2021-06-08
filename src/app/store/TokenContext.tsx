import * as React from 'react';

export enum ActionType {
    SetShowEditForm = 'SET_SHOW_EDIT_FORM',
    SetShowNewGroupForm = 'SET_SHOW_NEW_GROUP_FORM',
    SetShowOptions = 'SET_SHOW_OPTIONS',
    SetCollapsed = 'SET_COLLAPSED',
    ToggleShowEmptyGroups = 'TOGGLE_SHOW_EMPTY_GROUPS',
    ToggleUpdateAfterApply = 'TOGGLE_UPDATE_AFTER_APPLY',
    SetActiveTokenSet = 'SET_ACTIVE_TOKEN_SET',
    ToggleUsedTokenSet = 'TOGGLE_USED_TOKEN_SET',
    AddTokenSet = 'ADD_TOKEN_SET',
    DeleteTokenSet = 'DELETE_TOKEN_SET',
    RenameTokenSet = 'RENAME_TOKEN_SET',
    SetTokenSetOrder = 'SET_TOKEN_SET_ORDER',
    CreateTokenGroup = 'CREATE_TOKEN_GROUP',
    SetSyncEnabled = 'SET_SYNC_ENABLED',
}

const emptyState = {
    collapsed: false,
    showEditForm: false,
    showNewGroupForm: false,
    showEmptyGroups: true,
    showOptions: false,
    updateAfterApply: true,
};

const TokenStateContext = React.createContext(emptyState);
const TokenDispatchContext = React.createContext(null);

function stateReducer(state, action) {
    switch (action.type) {
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

        case ActionType.SetCollapsed:
            return {
                ...state,
                collapsed: !state.collapsed,
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
            setStringTokens: (data: {parent: string; tokens: string}) => {
                dispatch({type: ActionType.SetStringTokens, data, updatedAt});
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

            setCollapsed: () => {
                dispatch({type: ActionType.SetCollapsed});
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

            createTokenGroup: (data: {parent: string; name: string; updatedAt: Date}) => {
                dispatch({type: ActionType.CreateTokenGroup, data});
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
