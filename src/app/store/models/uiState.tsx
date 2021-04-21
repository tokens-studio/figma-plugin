/* eslint-disable import/prefer-default-export */
import {createModel} from '@rematch/core';
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
}

export const uiState = createModel<RootModel>()({
    state: {
        selectionValues: {},
        disabled: false,
        loading: false,
        activeTab: 'start',
        projectURL: '',
        editProhibited: false,
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
    },
});
