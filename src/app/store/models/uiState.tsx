/* eslint-disable import/prefer-default-export */
import {track} from '@/utils/analytics';
import fetchChangelog from '@/utils/storyblok';
import {createModel} from '@rematch/core';
import {StorageType, StorageProviderType, ApiDataType} from '@types/api';
import {ShadowTokenSingleValue, TypographyObject} from 'Types/propertyTypes';
import {SelectionValue, TokenType} from 'Types/tokens';

import {RootModel} from '.';

type TabNames = 'start' | 'tokens' | 'json' | 'inspector' | 'syncsettings' | 'settings';

type DisplayType = 'GRID' | 'LIST';

interface EditTokenObjectCommonProperties {
    name: string;
    initialName: string;
    path: string;
    isPristine: boolean;
    explainer?: string;
    property: string;
    schema: object;
    optionsSchema: object;
    options: object;
    type: TokenType;
}

export type EditTokenObject =
    | (EditTokenObjectCommonProperties & {
          type: 'boxShadow';
          value: ShadowTokenSingleValue[] | ShadowTokenSingleValue;
      })
    | (EditTokenObjectCommonProperties & {
          type: 'typography';
          value: TypographyObject;
      })
    | (EditTokenObjectCommonProperties & {
          type: TokenType;
          value: string | number;
      });

interface UIState {
    selectionValues: SelectionValue;
    displayType: DisplayType;
    disabled: boolean;
    loading: boolean;
    activeTab: TabNames;
    projectURL: string;
    storageType: StorageType;
    api: ApiDataType;
    apiProviders: ApiDataType[];
    localApiState: ApiDataType;
    lastUpdatedAt: Date | null;
    changelog: object[];
    lastOpened: string | null;
    editToken: EditToken | null;
    showEditForm: boolean;
    tokenFilter: string;
    tokenFilterVisible: boolean;
    confirmState: {
        show: boolean;
        text?: string;
        description?: string;
    };
    showPushDialog: string | false;
    showEmptyGroups: boolean;
    collapsed: boolean;
}

export const uiState = createModel<RootModel>()({
    state: {
        selectionValues: {},
        disabled: false,
        displayType: 'GRID',
        loading: false,
        activeTab: 'start',
        projectURL: '',
        storageType: {
            provider: StorageProviderType.LOCAL,
        },
        api: null,
        apiProviders: [],
        localApiState: {
            provider: StorageProviderType.LOCAL,
            new: false,
        },
        lastUpdatedAt: null,
        changelog: [],
        lastOpened: '',
        editToken: null,
        showEditForm: false,
        tokenFilter: '',
        tokenFilterVisible: false,
        confirmState: {
            show: false,
            text: '',
            description: '',
        },
        showPushDialog: false,
        showEmptyGroups: true,
        collapsed: false,
    } as UIState,
    reducers: {
        setShowPushDialog: (state, data: string | false) => {
            return {
                ...state,
                showPushDialog: data,
            };
        },
        setShowConfirm: (state, data: {text: string; description?: string}) => {
            return {
                ...state,
                confirmState: {
                    show: true,
                    text: data.text,
                    description: data.description,
                },
            };
        },
        setHideConfirm: (state) => {
            return {
                ...state,
                confirmState: {
                    show: false,
                    text: '',
                    description: '',
                },
            };
        },
        setDisabled: (state, data: boolean) => {
            return {
                ...state,
                disabled: data,
            };
        },
        setEditToken: (state, data: EditToken) => {
            return {
                ...state,
                editToken: data,
            };
        },
        setShowEditForm: (state, data: boolean) => {
            return {
                ...state,
                showEditForm: data,
            };
        },
        setDisplayType: (state, data: DisplayType) => {
            track('setDisplayType', {type: data});

            return {
                ...state,
                displayType: data,
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
        setStorage(state, payload: StorageType) {
            return {
                ...state,
                storageType: payload,
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
        toggleFilterVisibility(state) {
            return {
                ...state,
                tokenFilterVisible: !state.tokenFilterVisible,
            };
        },
        setTokenFilter(state, payload: string) {
            return {
                ...state,
                tokenFilter: payload,
            };
        },
        toggleShowEmptyGroups(state) {
            return {
                ...state,
                showEmptyGroups: !state.showEmptyGroups,
            };
        },
        toggleCollapsed(state) {
            return {
                ...state,
                collapsed: !state.collapsed,
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
