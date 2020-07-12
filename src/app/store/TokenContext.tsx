import * as React from 'react';
import JSON5 from 'json5';
import defaultJSON from '../presets/default';

const parseTokenValues = (tokens) => {
    // TODO: Implement plugin version for checking if we should change structure
    console.log('parsing old data', tokens);
    if (tokens.version !== '') {
        console.log('Pluginversion', tokens.version);
        return tokens.values;
    }
    console.log('No version');
    const newTokens = {
        main: {
            values: JSON5.stringify(tokens.values, null, 2),
        },
    };
    return newTokens;
};

const TokenContext = React.createContext(null);

const defaultState = {
    loading: true,
    tokens: {
        main: {
            values: JSON5.stringify(defaultJSON(), null, 2),
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
                        tokens: JSON5.parse(state.tokens),
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
                        tokens: JSON5.parse(state.tokens),
                    },
                },
                '*'
            );
            return state;
        default:
            throw new Error('Not implemented');
    }
}

function TokenProvider({children}) {
    const [state, dispatch] = React.useReducer(stateReducer, defaultState);

    // React.useEffect(() => {
    //     let newTokensFromString;
    //     try {
    //         newTokensFromString = JSON5.parse(stringTokens);
    //         setError('');
    //     } catch (e) {
    //         console.log({e}, stringTokens);
    //         setError('Invalid JSON');
    //     }
    //     if (newTokensFromString) {
    //         setTokens(newTokensFromString);
    //     }
    // }, [stringTokens]);

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
