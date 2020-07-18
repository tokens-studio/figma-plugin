import * as React from 'react';
import JSON5 from 'json5';
import {defaultJSON, defaultDecisions} from '../presets/default';
import TokenData, {TokenProps} from '../components/TokenData';

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

const TokenContext = React.createContext(null);

const defaultTokens: TokenProps = {
    version: '1.0',
    values: {
        options: JSON5.stringify(defaultJSON(), null, 2),
        decisions: JSON5.stringify(defaultDecisions(), null, 2),
    },
};

const defaultState = {
    loading: true,
    tokenData: new TokenData(defaultTokens),
    selectionValues: {},
    tokens: defaultTokens,
};

function stateReducer(state, action) {
    switch (action.type) {
        case 'SET_TOKENS':
            console.log('SET_TOKENS', action);
            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    ...action.tokens,
                },
            };
        case 'SET_TOKEN_DATA':
            console.log('SET_TOKEN_DATA', action);
            return {
                ...state,
                tokenData: action.data,
            };
        case 'SET_STRING_TOKENS':
            console.log('SET_STRING_TOKENS', action);
            state.tokenData.updateTokenValues(action.data.parent, action.data.tokens);
            return state;
        case 'SET_DEFAULT_TOKENS':
            return defaultState;
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.state,
            };
        case 'UPDATE_TOKENS':
            console.log('update tokens');
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'update',
                        tokenValues: state.tokenData.reduceToValues(),
                        tokens: state.tokenData.getMergedTokens(),
                    },
                },
                '*'
            );
            return state;
        case 'CREATE_STYLES':
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'create-styles',
                        tokens: state.tokenData.getMergedTokens(),
                    },
                },
                '*'
            );
            return state;
        case 'SET_NODE_DATA':
            console.log('setting node data', state.tokenData);
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'set-node-data',
                        values: {
                            ...state.selectionValues,
                            ...action.data,
                        },
                        tokens: state.tokenData.getMergedTokens(),
                    },
                },
                '*'
            );
            return state;
        case 'REMOVE_NODE_DATA':
            console.log('removing node data');
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'remove-node-data',
                    },
                },
                '*'
            );
            return state;

        case 'SET_SELECTION_VALUES':
            console.log('set selection val node data');
            return {
                ...state,
                selectionValues: action.data,
            };
        default:
            throw new Error('Not implemented');
    }
}

function TokenProvider({children}) {
    const [state, dispatch] = React.useReducer(stateReducer, defaultState);

    const tokenContext = React.useMemo(
        () => ({
            state,
            setTokens: (tokens) => {
                dispatch({type: 'SET_TOKENS', tokens});
            },
            setTokenData: (data: TokenData) => {
                dispatch({type: 'SET_TOKEN_DATA', data});
            },
            setStringTokens: (data: {parent: string; tokens: string}) => {
                dispatch({type: 'SET_STRING_TOKENS', data});
            },
            setDefaultTokens: () => {
                dispatch({type: 'SET_DEFAULT_TOKENS'});
            },
            updateTokens: () => {
                console.log('updating');
                dispatch({type: 'UPDATE_TOKENS'});
            },
            createStyles: () => {
                console.log('CREATE_STYLES');
                dispatch({type: 'CREATE_STYLES'});
            },
            setLoading: (boolean) => {
                dispatch({type: 'SET_LOADING', state: boolean});
            },
            setNodeData: (data: SelectionValue) => {
                dispatch({type: 'SET_LOADING', state: true});
                dispatch({type: 'SET_NODE_DATA', data});
            },
            removeNodeData: (data: SelectionValue) => {
                dispatch({type: 'SET_LOADING', state: true});
                dispatch({type: 'REMOVE_NODE_DATA', data});
            },
            setSelectionValues: (data: SelectionValue) => {
                dispatch({type: 'SET_SELECTION_VALUES', data});
            },
        }),
        [state]
    );

    React.useEffect(() => {
        console.log('Daata changed', state.tokenData);
    }, [state.tokenData]);

    // React.useEffect(() => {
    //     console.log('tokens changed');
    //     dispatch({type: 'SET_MERGED_TOKENS', tokens: state.tokens});
    // }, [state.tokens]);

    return <TokenContext.Provider value={tokenContext}>{children}</TokenContext.Provider>;
}

function useTokenState() {
    const context = React.useContext(TokenContext);
    if (context === undefined) {
        throw new Error('useTokenState must be used within a TokenProvider');
    }
    return context;
}

export {TokenProvider, useTokenState, TokenContext};
