/* eslint-disable import/prefer-default-export */
import convertToTokenArray from '@/utils/convertTokens';
import {createModel} from '@rematch/core';
import {SingleTokenObject, TokenGroup, SingleToken} from '@types/tokens';
import {getMergedTokens} from '@/plugin/tokenHelpers';
import {postToFigma} from '@/plugin/notifiers';
import {MessageToPluginTypes} from '@types/messages';
import {StorageProviderType} from '@types/api';

import {RootModel} from '.';

type TokenInput = {
    name: string;
    parent: string;
    value: SingleToken;
    options: object;
};

type EditTokenInput = TokenInput & {
    oldName?: string;
};

type DeleteTokenInput = {parent: string; path: string};

const parseTokenValues = (tokens) => {
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
            prev.push({[group[0]]: {type: 'array', values: convertedGroup}});
            return prev;
        }
    }, []);

    return Object.assign({}, ...reducedTokens);
};

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

interface TokenState {
    tokens: TokenGroup;
    activeTokenSet: string;
    usedTokenSet: string[];
    editProhibited: boolean;
}

export const tokenState = createModel<RootModel>()({
    state: {
        tokens: {},
        activeTokenSet: 'global',
        usedTokenSet: ['global'],
        editProhibited: false,
    } as TokenState,
    reducers: {
        setTokenData: (state, data: {values: SingleTokenObject[]}) => {
            return {
                ...state,
                tokens: parseTokenValues(data.values),
                activeTokenSet: Array.isArray(data.values) ? 'global' : Object.keys(data.values)[0],
                usedTokenSet: Array.isArray(data.values) ? ['global'] : [Object.keys(data.values)[0]],
            };
        },
        createToken: (state, data: TokenInput) => {
            let newTokens = {};
            const existingToken = state.tokens[data.parent].values.find((n) => n.name === data.name);
            if (!existingToken) {
                newTokens = {
                    [data.parent]: {
                        values: [
                            ...state.tokens[data.parent].values,
                            {
                                name: data.name,
                                value: data.value,
                                ...data.options,
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
        },
        editToken: (state, data: EditTokenInput) => {
            const nameToFind = data.oldName ? data.oldName : data.name;
            const index = state.tokens[data.parent].values.findIndex((token) => token.name === nameToFind);
            const newArray = [...state.tokens[data.parent].values];
            newArray[index] = {
                ...newArray[index],
                name: data.name,
                value: data.value,
                ...data.options,
            };

            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    [data.parent]: {
                        ...state.tokens[data.parent],
                        values: newArray,
                    },
                },
            };
        },
        deleteToken: (state, data: DeleteTokenInput) => {
            const newState = {
                ...state,
                tokens: {
                    ...state.tokens,
                    [data.parent]: {
                        ...state.tokens[data.parent],
                        values: state.tokens[data.parent].values.filter((token) => token.name !== data.path),
                    },
                },
            };

            return newState;
        },
        // This shouldnt be in state
        createStylesFromTokens: (state) => {
            postToFigma({
                type: MessageToPluginTypes.CREATE_STYLES,
                tokens: getMergedTokens(state.tokens, state.usedTokenSet, true),
            });
            return state;
        },
        // Again, this shouldnt live in state
        removeNodeData: (state, data?: string) => {
            postToFigma({
                type: MessageToPluginTypes.REMOVE_NODE_DATA,
                key: data,
            });
            return state;
        },
        // This should probably live in its own state
        setStorageType: (state, {provider, bool = false}: {provider: StorageProviderType; bool?: boolean}) => {
            console.log('Setting storage type', provider);
            if (bool) {
                postToFigma({
                    type: MessageToPluginTypes.SET_STORAGE_TYPE,
                    storageType: provider,
                    tokens: getMergedTokens(state.tokens, state.usedTokenSet),
                });
            }
            return {
                ...state,
                storageType: provider,
            };
        },
    },
    effects: (dispatch) => ({
        setStorageType(payload, rootState) {
            console.log('effect called', rootState);
            dispatch.uiState.setEditProhibited(payload);
        },
    }),
});
