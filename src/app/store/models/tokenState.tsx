/* eslint-disable import/prefer-default-export */
import {createModel} from '@rematch/core';
import {SingleTokenObject, TokenGroup, SingleToken, TokenProps} from '@types/tokens';
import {StorageProviderType} from '@types/api';
import defaultJSON from '@/config/default.json';

import parseTokenValues from '@/utils/parseTokenValues';
import {RootModel} from '.';
import updateTokensOnSources from '../updateSources';
import * as pjs from '../../../../package.json';

const defaultTokens: TokenProps = {
    version: pjs.plugin_version,
    updatedAt: new Date().toString(),
    values: defaultJSON,
};

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

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

interface TokenState {
    tokens: TokenGroup;
    importedTokens: {
        newTokens: SingleTokenObject[];
        updatedTokens: SingleTokenObject[];
    };
    activeTokenSet: string;
    usedTokenSet: string[];
    editProhibited: boolean;
}

export const tokenState = createModel<RootModel>()({
    state: {
        tokens: {},
        importedTokens: {
            newTokens: [],
            updatedTokens: [],
        },
        activeTokenSet: 'global',
        usedTokenSet: ['global'],
        editProhibited: false,
    } as TokenState,
    reducers: {
        resetImportedTokens: (state) => {
            return {
                ...state,
                importedTokens: {
                    newTokens: [],
                    updatedTokens: [],
                },
            };
        },
        setTokenData: (state, data: {values: SingleTokenObject[]; shouldUpdate: boolean}) => {
            const values = parseTokenValues(data.values);
            console.log('setting token data', values);
            return {
                ...state,
                tokens: values,
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
        // Imports received styles as tokens, if needed
        setTokensFromStyles: (state, receivedStyles) => {
            console.log('Set tokens from styles', receivedStyles);
            console.log('TOKENS ARE', state.tokens);
            const newTokens = [];
            const existingTokens = [];
            const updatedTokens = [];

            // Iterate over received styles and check if they existed before or need updating
            Object.entries(receivedStyles).map(([_parent, values]: [string, SingleTokenObject[]]) => {
                values.map((token: TokenGroup) => {
                    console.log('TOKEN', token);

                    const oldValue = state.tokens[state.activeTokenSet].values.find((t) => t.name === token.name);
                    if (oldValue) {
                        console.log('got old value', oldValue, token);
                        if (oldValue.value === token.value) {
                            console.log('Is same value!', token.value);
                            if (oldValue.description === token.description) {
                                console.log('Is also same description');
                                existingTokens.push(token);
                            } else {
                                console.log('Is another description');
                                updatedTokens.push({
                                    ...token,
                                    oldDescription: oldValue.description,
                                });
                            }
                        } else {
                            updatedTokens.push({
                                ...token,
                                oldValue: oldValue.value,
                            });
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
            };
        },
        editToken: (state, data: EditTokenInput) => {
            console.log('editing token in state', data);
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
    },
    effects: (dispatch) => ({
        setDefaultTokens: (payload) => {
            console.log('setting default effect');
            dispatch.tokenState.setTokenData({values: defaultTokens.values});
        },
        setEmptyTokens: (payload) => {
            console.log('setting empty effect');
            dispatch.tokenState.setTokenData({values: []});
        },
        setJSONData: (payload: string, rootState) => {
            console.log('setting jsondata effect');
            console.log('Got a payload', payload, rootState.tokenState.activeTokenSet);
            const parsedTokens = JSON.parse(payload);
            try {
                parseTokenValues(parsedTokens);
                dispatch.tokenState.setTokenData({
                    values: {[rootState.tokenState.activeTokenSet]: parsedTokens},
                    shouldUpdate: true,
                });
            } catch (e) {
                console.log('Error parsing tokens', e);
            }
        },
        editToken() {
            dispatch.tokenState.updateDocument();
        },
        setTokenData(payload, rootState) {
            console.log('setting tokendate effect');

            if (payload.shouldUpdate) {
                dispatch.tokenState.updateDocument();
            }
        },
        createToken() {
            dispatch.tokenState.updateDocument();
        },
        updateDocument(payload, rootState) {
            updateTokensOnSources({
                tokens: rootState.tokenState.tokens,
                usedTokenSet: rootState.tokenState.usedTokenSet,
                updatePageOnly: rootState.settings.updatePageOnly,
                updatedAt: new Date().toString(),
                lastUpdatedAt: rootState.uiState.lastUpdatedAt,
                isLocal: rootState.uiState.storageType.provider === StorageProviderType.LOCAL,
                editProhibited: rootState.uiState.editProhibited,
                api: rootState.uiState.api,
                storageType: rootState.uiState.storageType,
            });
        },
    }),
});
