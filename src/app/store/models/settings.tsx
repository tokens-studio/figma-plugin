/* eslint-disable import/prefer-default-export */
import {DEFAULT_DEPTH_LEVEL} from '@/app/components/constants';
import {postToFigma} from '@/plugin/notifiers';
import {track} from '@/utils/analytics';
import {createModel} from '@rematch/core';
import {MessageToPluginTypes} from '@types/messages';
import {RootModel} from '.';

type WindowSettingsType = {
    width: number;
    height: number;
};

interface SettingsState {
    uiWindow: WindowSettingsType;
    depth: number;
    updatePageOnly: boolean;
    tokenType: 'object' | 'array';
}

const resizeWindow = (width, height) => {
    postToFigma({
        type: MessageToPluginTypes.SET_UI,
        width,
        height,
    });
};

export const settings = createModel<RootModel>()({
    state: {
        uiWindow: {
            width: 400,
            height: 600,
        },
        depth: DEFAULT_DEPTH_LEVEL,
        updatePageOnly: true,
        tokenType: 'object',
    } as SettingsState,
    reducers: {
        setWindowSize(state, payload: {width: number; height: number}) {
            track('Set Window Size', {width: payload.width, height: payload.height});
            return {
                ...state,
                uiWindow: {
                    width: payload.width,
                    height: payload.height,
                },
            };
        },
        triggerWindowChange(state) {
            resizeWindow(state.uiWindow.width, state.uiWindow.height);
            return state;
        },
        setDepth(state, payload: number) {
            return {
                ...state,
                depth: payload,
            };
        },
        setUpdatePageOnly(state, payload: boolean) {
            return {
                ...state,
                updatePageOnly: payload,
            };
        },
        setTokenType(state, payload: 'object' | 'array') {
            return {
                ...state,
                tokenType: payload,
            };
        },
    },
});
