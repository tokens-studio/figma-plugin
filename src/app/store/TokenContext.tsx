import * as React from 'react';
import JSON5 from 'json5';
import {defaultJSON, defaultDecisions} from '../presets/default';
import {mergeTokens, reduceToValues} from '../components/utils';

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

const parseTokenValues = (tokens) => {
    if (tokens.version !== '') {
        try {
            console.log('Values', tokens.values);
            const reducedTokens = Object.entries(tokens.values).reduce((prev, group) => {
                // Retrieve all aliases and fill in their real value
                prev.push({[group[0]]: {values: group[1]}});
                return prev;
            }, []);

            const assigned = Object.assign({}, ...reducedTokens);
            return assigned;
        } catch (e) {
            console.error('Error reading tokens', e);
            console.log("Here's the tokens");
            console.log(tokens);
        }
    } else {
        console.log('not a version prop');
        const newTokens = {
            options: {
                values: JSON5.stringify(tokens.values, null, 2),
            },
            decisions: {
                values: '{}',
            },
        };
        return newTokens;
    }
};

const TokenContext = React.createContext(null);

const defaultState = {
    loading: true,
    selectionValues: {},
    tokens: {
        options: {
            values: JSON5.stringify(defaultJSON(), null, 2),
        },
        decisions: {
            values: JSON5.stringify(defaultDecisions(), null, 2),
        },
    },
};

function parseTokens(tokens) {
    try {
        JSON5.parse(tokens);
        return false;
    } catch (e) {
        return true;
    }
}

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
        case 'SET_STRING_TOKENS':
            console.log('SET_STRING_TOKENS', action);
            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    [action.data.parent]: {
                        hasErrored: parseTokens(action.data.tokens),
                        values: action.data.tokens,
                    },
                },
            };
        case 'SET_PREVIOUS_TOKENS':
            console.log('SET_PREVIOUS_TOKENS', action);
            return {
                ...state,
                tokens: parseTokenValues(action.tokens),
            };
        case 'SET_DEFAULT_TOKENS':
            return defaultState;
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.state,
            };
        case 'UPDATE_TOKENS':
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'update',
                        tokens: reduceToValues(state.tokens),
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
                        tokens: state.tokens,
                    },
                },
                '*'
            );
            return state;
        case 'SET_NODE_DATA':
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'set-node-data',
                        values: {
                            ...state.selectionValues,
                            ...action.data,
                        },
                        tokens: mergeTokens(state.tokens),
                    },
                },
                '*'
            );
            return state;

        case 'SET_SELECTION_VALUES':
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
            setStringTokens: (data: {parent: string; tokens: string}) => {
                dispatch({type: 'SET_STRING_TOKENS', data});
            },
            setDefaultTokens: () => {
                dispatch({type: 'SET_DEFAULT_TOKENS'});
            },
            setPreviousTokens: (tokens) => {
                console.log('SETTING PREVIOUS', {tokens});
                dispatch({type: 'SET_PREVIOUS_TOKENS', tokens});
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
                dispatch({type: 'SET_NODE_DATA', data});
            },
            setSelectionValues: (data: SelectionValue) => {
                dispatch({type: 'SET_SELECTION_VALUES', data});
            },
        }),
        [state]
    );

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
