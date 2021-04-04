/* eslint-disable import/prefer-default-export */
import {createModel} from '@rematch/core';
import {RootModel} from '.';

type TabNames = 'start' | 'tokens' | 'json' | 'inspector' | 'syncsettings';

interface BaseState {
    loading: boolean;
    activeTab: TabNames;
}

export const base = createModel<RootModel>()({
    state: {
        loading: false,
        activeTab: 'start',
    } as BaseState,
    reducers: {
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
    },
});
