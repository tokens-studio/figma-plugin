/* eslint-disable import/prefer-default-export */
import { createModel } from '@rematch/core';
import { track } from '@/utils/analytics';
import { RootModel } from '@/types/RootModel';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import * as settingsStateReducers from './reducers/settingsState';
import * as settingsStateEffects from './effects/settingsState';
import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';

type WindowSettingsType = {
  width: number;
  height: number;
  isMinimized: boolean;
};

type TokenModeType = 'object' | 'array';

export interface SettingsState {
  uiWindow?: WindowSettingsType;
  updateMode: UpdateMode;
  updateRemote: boolean;
  updateOnChange?: boolean;
  updateStyles?: boolean;
  tokenType?: TokenModeType;
  ignoreFirstPartForStyles?: boolean;
  prefixStylesWithThemeName?: boolean;
  inspectDeep: boolean;
  shouldSwapStyles: boolean;
  baseFontSize: string;
  aliasBaseFontSize: string;
}

const setUI = (state: SettingsState) => {
  AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.SET_UI,
    ...state,
  });
};

export const settings = createModel<RootModel>()({
  state: {
    uiWindow: {
      width: 400,
      height: 600,
      isMinimized: false,
    },
    updateMode: UpdateMode.PAGE,
    updateRemote: true,
    updateOnChange: true,
    updateStyles: true,
    tokenType: 'object',
    ignoreFirstPartForStyles: false,
    prefixStylesWithThemeName: false,
    inspectDeep: false,
    shouldSwapStyles: false,
    baseFontSize: defaultBaseFontSize,
    aliasBaseFontSize: defaultBaseFontSize,
  } as SettingsState,
  reducers: {
    ...settingsStateReducers,
    setInspectDeep(state, payload: boolean) {
      return {
        ...state,
        inspectDeep: payload,
      };
    },
    setWindowSize(state, payload: { width: number; height: number }) {
      return {
        ...state,
        uiWindow: {
          isMinimized: state.uiWindow?.isMinimized ?? false,
          width: payload.width,
          height: payload.height,
        },
      };
    },
    setMinimizePluginWindow(state, payload: { isMinimized: boolean; width: number; height: number }) {
      track('Minimized plugin');
      return {
        ...state,
        uiWindow: {
          width: payload.width,
          height: payload.height,
          isMinimized: payload.isMinimized,
        },
      };
    },
    setUISettings(state, payload: SettingsState) {
      // track ui setting to see usage
      track('ignoreFirstPart', { isSet: payload.ignoreFirstPartForStyles });

      return {
        ...state,
        ...payload,
      };
    },
    setBaseFontSize(state, payload: string) {
      return {
        ...state,
        baseFontSize: payload,
      };
    },
    setAliasBaseFontSize(state, payload: string) {
      return {
        ...state,
        aliasBaseFontSize: payload,
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
    setShouldSwapStyles(state, payload: boolean) {
      return {
        ...state,
        shouldSwapStyles: payload,
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
    setWindowSize: (payload) => {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.RESIZE_WINDOW,
        width: payload.width,
        height: payload.height,
      });
    },
    setMinimizePluginWindow: (payload) => {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.RESIZE_WINDOW,
        width: payload.isMinimized ? 50 : payload.width,
        height: payload.isMinimized ? 50 : payload.height,
      });
    },
    setUpdateStyles: (payload, rootState) => {
      setUI(rootState.settings);
    },
    setShouldSwapStyles: (payload, rootState) => {
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
    setInspectDeep: (payload, rootState) => {
      setUI(rootState.settings);
    },
    setUISettings: (payload, rootState) => {
      setUI(rootState.settings);
    },
    setBaseFontSize: (payload, rootState) => {
      setUI(rootState.settings);
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false, updateRemote: false });
    },
    setAliasBaseFontSize: (payload, rootState) => {
      setUI(rootState.settings);
    },
    ...Object.fromEntries(
      (Object.entries(settingsStateEffects).map(([key, factory]) => (
        [key, factory()]
      ))),
    ),
  }),
});
