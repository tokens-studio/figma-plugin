/* eslint-disable import/prefer-default-export */
import { createModel } from '@rematch/core';
import i18next from 'i18next';
import { track } from '@/utils/analytics';
import { RootModel } from '@/types/RootModel';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import * as settingsStateReducers from './reducers/settingsState';
import * as settingsStateEffects from './effects/settingsState';
import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';
import { setupReplay } from '@/app/sentry';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

type WindowSettingsType = {
  width: number;
  height: number;
  isMinimized: boolean;
};

type TokenModeType = 'object' | 'array';

export interface SettingsState {
  language: string,
  uiWindow?: WindowSettingsType;
  updateMode: UpdateMode;
  updateRemote: boolean;
  updateOnChange?: boolean;
  applyVariablesStylesOrRawValue?: ApplyVariablesStylesOrRawValues;
  tokenType?: TokenModeType;
  inspectDeep: boolean;
  shouldSwapStyles: boolean;
  baseFontSize: string;
  aliasBaseFontSize: string;
  /**
   * Whether the user has opted in for session recording in Sentry
  */
  sessionRecording: boolean;
  storeTokenIdInJsonEditor: boolean;
  /*
   * Export styles and variables options
  */
  variablesColor: boolean;
  variablesString: boolean;
  variablesNumber: boolean;
  variablesBoolean: boolean;
  stylesColor: boolean;
  stylesTypography: boolean;
  stylesEffect: boolean;
  ignoreFirstPartForStyles?: boolean;
  prefixStylesWithThemeName?: boolean;
  createStylesWithVariableReferences?: boolean;
  renameExistingStylesAndVariables?: boolean;
  removeStylesAndVariablesWithoutConnection?: boolean;
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
    language: 'en',
    sessionRecording: false,
    updateMode: UpdateMode.SELECTION,
    updateRemote: true,
    updateOnChange: false,
    applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
    tokenType: 'object',
    ignoreFirstPartForStyles: false,
    prefixStylesWithThemeName: false,
    renameExistingStylesAndVariables: false,
    removeStylesAndVariablesWithoutConnection: false,
    createStylesWithVariableReferences: false,
    inspectDeep: false,
    shouldSwapStyles: false,
    baseFontSize: defaultBaseFontSize,
    aliasBaseFontSize: defaultBaseFontSize,
    storeTokenIdInJsonEditor: false,
    variablesColor: true,
    variablesString: true,
    variablesNumber: true,
    variablesBoolean: true,
    stylesColor: true,
    stylesTypography: true,
    stylesEffect: true,
  } as SettingsState,
  reducers: {
    ...settingsStateReducers,
    setSessionRecording(state, payload: boolean) {
      if (payload) {
        // Setup the session recording if it's not already setup
        setupReplay();
      }

      return {
        ...state,
        sessionRecording: payload,
      };
    },
    setInspectDeep(state, payload: boolean) {
      return {
        ...state,
        inspectDeep: payload,
      };
    },
    setLanguage(state, payload: string) {
      return {
        ...state,
        language: payload,
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

      if (payload.sessionRecording) {
        // Setup the initial session recording
        setupReplay();
      }

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
    setApplyVariablesStyleOrRawValue(state, payload: ApplyVariablesStylesOrRawValues) {
      return {
        ...state,
        applyVariablesStylesOrRawValue: payload,
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
    setStoreTokenIdInJsonEditorSelector(state, payload: boolean) {
      return {
        ...state,
        storeTokenIdInJsonEditor: payload,
      };
    },
  },
  effects: (dispatch) => ({
    setLanguage: (payload: string, rootState) => {
      i18next.changeLanguage(payload);
      setUI(rootState.settings);
    },
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
    setApplyVariablesStyleOrRawValue: (payload, rootState) => {
      setUI(rootState.settings);
    },
    setInspectDeep: (payload, rootState) => {
      setUI(rootState.settings);
    },
    setUISettings: (payload, rootState) => {
      setUI(rootState.settings);
    },
    setSessionRecording: (payload, rootState) => {
      setUI(rootState.settings);
    },
    setBaseFontSize: (payload, rootState) => {
      setUI(rootState.settings);
      dispatch.tokenState.updateDocument({ shouldUpdateNodes: false, updateRemote: false });
    },
    setAliasBaseFontSize: (payload, rootState) => {
      setUI(rootState.settings);
    },
    setStoreTokenIdInJsonEditorSelector: (payload, rootState) => {
      setUI(rootState.settings);
    },
    ...Object.fromEntries(
      (Object.entries(settingsStateEffects).map(([key, factory]) => (
        [key, factory()]
      ))),
    ),
  }),
});
