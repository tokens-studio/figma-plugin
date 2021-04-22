/* eslint-disable import/prefer-default-export */
import fetchChangelog from '@/utils/storyblok';
import {createModel} from '@rematch/core';
import {StorageType, StorageProviderType, ApiDataType} from '@types/api';

import {RootModel} from '.';

type TabNames = 'start' | 'tokens' | 'json' | 'inspector' | 'syncsettings' | 'settings';

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

interface UIState {
    selectionValues: object;
    disabled: boolean;
    loading: boolean;
    activeTab: TabNames;
    projectURL: string;
    editProhibited: boolean;
    storageType: StorageType;
    api: ApiDataType;
    apiProviders: ApiDataType[];
    localApiState: ApiDataType;
    lastUpdatedAt: Date | null;
    changelog: object[];
    lastOpened: string | null;
}

export const uiState = createModel<RootModel>()({
    state: {
        selectionValues: {},
        disabled: false,
        loading: false,
        activeTab: 'start',
        projectURL: '',
        editProhibited: false,
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
        localApiState: {
            id: '',
            secret: '',
            name: '',
            provider: '',
            new: false,
        },
        lastUpdatedAt: null,
        changelog: [],
        lastOpened: '',
    } as UIState,
    reducers: {
        setDisabled: (state, data: boolean) => {
            return {
                ...state,
                disabled: data,
            };
        },
        setSelectionValues: (state, data: SelectionValue) => {
            return {
                ...state,
                selectionValues: data,
            };
        },
        resetSelectionValues: (state) => {
            return {
                ...state,
                selectionValues: {},
            };
        },
        setLoading(state, payload: boolean) {
            return {
                ...state,
                loading: payload,
            };
        },
        setActiveTab(state, payload: TabNames) {
            return {
                ...state,
                activeTab: payload,
            };
        },
        setProjectURL(state, payload: string) {
            return {
                ...state,
                projectURL: payload,
            };
        },
        setEditProhibited(state, payload: boolean) {
            return {
                ...state,
                editProhibited: payload,
            };
        },
        setStorage(state, payload: StorageType) {
            console.log('setting storage', payload);
            return {
                ...state,
                storageType: payload,
                editProhibited: false,
            };
        },
        setApiData(state, payload: ApiDataType) {
            return {
                ...state,
                api: payload,
            };
        },
        setLocalApiState(state, payload: ApiDataType) {
            return {
                ...state,
                localApiState: payload,
            };
        },
        setAPIProviders(state, payload: ApiDataType[]) {
            return {
                ...state,
                apiProviders: payload,
            };
        },
        setChangelog(state, payload: object[]) {
            return {
                ...state,
                changelog: payload,
            };
        },
        setLastOpened(state, payload: Date) {
            return {
                ...state,
                lastOpened: payload,
            };
        },
    },
    effects: (dispatch) => ({
        setLastOpened: (payload) => {
            fetchChangelog(payload, (result) => {
                dispatch.uiState.setChangelog(result);
            });
        },
    }),
});
