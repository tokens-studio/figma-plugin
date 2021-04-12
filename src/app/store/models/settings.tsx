/* eslint-disable import/prefer-default-export */
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
    },
});
