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

export interface SettingsState {
    uiWindow?: WindowSettingsType;
    updateMode?: UpdateMode;
    updateRemote: boolean;
    updateOnChange?: boolean;
    updateStyles?: boolean;
    tokenType?: TokenModeType;
    ignoreFirstPartForStyles?: boolean;
}

const setUI = (state) => {
    postToFigma({
        type: MessageToPluginTypes.SET_UI,
        ...state,
    });
};

export const settings = createModel<RootModel>()({
    state: {
        uiWindow: {
            width: 400,
            height: 600,
        },
        updateMode: UpdateMode.PAGE,
        updateRemote: true,
        updateOnChange: true,
        updateStyles: true,
        tokenType: 'object',
        ignoreFirstPartForStyles: false,
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
        setUISettings(state, payload: SettingsState) {
            // track ui setting to see usage
            track('ignoreFirstPart', {isSet: payload.ignoreFirstPartForStyles});

            return {
                ...state,
                ...payload,
            };
        },
        triggerWindowChange(state) {
            setUI(state);
            return state;
        },
        setUpdateMode(state, payload: UpdateMode) {
            return {
                ...state,
                updateMode: payload,
            };
        },
        setUpdateRemote(state, payload: boolean) {
            return {
                ...state,
                updateRemote: payload,
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
        setIgnoreFirstPartForStyles(state, payload: boolean) {
            return {
                ...state,
                ignoreFirstPartForStyles: payload,
            };
        },
    },
    effects: (dispatch) => ({
        setWindowSize: (payload, rootState) => {
            postToFigma({
                type: MessageToPluginTypes.RESIZE_WINDOW,
                width: payload.width,
                height: payload.height,
            });
        },
        setUpdateStyles: (payload, rootState) => {
            setUI(rootState.settings);
        },
        setUpdateMode: (payload, rootState) => {
            setUI(rootState.settings);
        },
        setUpdateRemote: (payload, rootState) => {
            setUI(rootState.settings);
        },
        setUpdateOnChange: (payload, rootState) => {
            setUI(rootState.settings);
        },
        setIgnoreFirstPartForStyles: (payload, rootState) => {
            setUI(rootState.settings);
        },
    }),
});
