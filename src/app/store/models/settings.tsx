/* eslint-disable import/prefer-default-export */
import {postToFigma} from '@/plugin/notifiers';
import {track} from '@/utils/analytics';
import {createModel} from '@rematch/core';
import {MessageToPluginTypes} from 'Types/messages';
import {UpdateMode} from 'Types/state';
import {RootModel} from '.';

type WindowSettingsType = {
    width: number;
    height: number;
};

type TokenModeType = 'object' | 'array';

interface SettingsState {
    uiWindow: WindowSettingsType;
    updateMode: UpdateMode;
    updateOnChange: boolean;
    updateStyles: boolean;
    tokenType: TokenModeType;
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
        updateMode: UpdateMode.PAGE,
        updateOnChange: true,
        updateStyles: true,
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
        setUpdateMode(state, payload: UpdateMode) {
            return {
                ...state,
                updateMode: payload,
            };
        },
        setUpdateOnChange(state, payload: boolean) {
            return {
                ...state,
                updateOnChange: payload,
            };
        },
        setUpdateStyles(state, payload: boolean) {
            return {
                ...state,
                updateStyles: payload,
            };
        },
        setTokenType(state, payload: TokenModeType) {
            return {
                ...state,
                tokenType: payload,
            };
        },
    },
});
