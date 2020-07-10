import * as React from 'react';

const UserContext = React.createContext({});

function stateReducer(state, action) {
    switch (action.type) {
        case 'SET_TOKENS':
            console.log('SETTING TOKENS');
            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    ...action.tokens,
                },
            };
        case 'RESET_SELECTED':
            console.log('RESET USER');

            return {
                ...state,
                hasSelected: false,
            };
        case 'RESTORE_STATE':
            console.log('RESTORE STATE');

            return {
                ...action.state,
            };
        case 'SET_AVAILABLE_USERS':
            console.log('SET_AVAILABLE_USERS', action.users);

            return {
                ...state,
                availableUsers: action.users,
            };
        default:
            throw new Error('Not implemented');
    }
}

function UserProvider({children}) {
    const [state, dispatch] = React.useReducer(stateReducer, {
        selectedUser: null,
        hasSelected: false,
        availableUsers: [],
    });

    React.useEffect(() => {
        console.log('Setting userContext from Storage');

        async function storeData() {
            try {
                await AsyncStorage.setItem('userContext', JSON.stringify(state));
            } catch (e) {
                // saving error
            }
        }

        storeData();
    }, [state]);

    React.useEffect(() => {
        const bootstrapAsync = async () => {
            console.log('Reading userContext from Storage');

            let parsedContext;

            try {
                const storedUserContext = await AsyncStorage.getItem('userContext');
                if (storedUserContext) {
                    parsedContext = JSON.parse(storedUserContext);
                    dispatch({type: 'RESTORE_STATE', state: parsedContext});
                }
            } catch (e) {
                // Restoring token failed
            }

            // After restoring token, we may need to validate it in production apps

            // This will switch to the App screen or Auth screen and this loading
            // screen will be unmounted and thrown away.
        };

        bootstrapAsync();
    }, []);

    const userContext = React.useMemo(
        () => ({
            state,
            setUser: (data) => {
                dispatch({type: 'SET_USER', user: data});
            },
            resetSelection: () => {
                dispatch({type: 'RESET_SELECTED'});
            },
            setAvailableUsers: (data) => {
                console.log('Setting available', data);
                dispatch({type: 'SET_AVAILABLE_USERS', users: data});
            },
        }),
        [state]
    );

    return <UserContext.Provider value={userContext}>{children}</UserContext.Provider>;
}

function useUserState() {
    const context = React.useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserState must be used within a CountProvider');
    }
    return context;
}

export {UserProvider, useUserState, UserContext};
