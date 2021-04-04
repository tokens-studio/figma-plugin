/* eslint-disable import/prefer-default-export */
import {postToFigma} from '@/plugin/notifiers';
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
            resizeWindow(payload, state.uiWindow.height);
            return {
                ...state,
                uiWindow: {
                    width: payload.width,
                    height: payload.height,
                },
            };
        },
    },
});
