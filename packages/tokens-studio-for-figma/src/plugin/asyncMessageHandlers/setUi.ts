import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { DefaultWindowSize } from '@/constants/DefaultWindowSize';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateUISettings } from '@/utils/uiSettings';
import { sendSelectionChange } from '../sendSelectionChange';
import store from '../store';

export const setUi: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_UI] = async (msg) => {
  const width = msg.uiWindow?.width ?? DefaultWindowSize.width;
  const height = msg.uiWindow?.height ?? DefaultWindowSize.height;
  updateUISettings({
    width,
    height,
    updateMode: msg.updateMode,
    language: msg.language,
    updateRemote: msg.updateRemote,
    updateOnChange: msg.updateOnChange,
    updateStyles: msg.updateStyles,
    ignoreFirstPartForStyles: msg.ignoreFirstPartForStyles,
    createStylesWithVariableReferences: msg.createStylesWithVariableReferences,
    prefixStylesWithThemeName: msg.prefixStylesWithThemeName,
    renameExistingStylesAndVariables: msg.renameExistingStylesAndVariables,
    variablesBoolean: msg.variablesBoolean,
    variablesColor: msg.variablesColor,
    variablesNumber: msg.variablesNumber,
    variablesString: msg.variablesString,
    stylesColor: msg.stylesColor,
    stylesEffect: msg.stylesEffect,
    stylesTypography: msg.stylesTypography,
    inspectDeep: msg.inspectDeep,
    baseFontSize: msg.baseFontSize,
    sessionRecording: msg.sessionRecording,
    aliasBaseFontSize: msg.aliasBaseFontSize,
    shouldSwapStyles: msg.shouldSwapStyles,
    storeTokenIdInJsonEditor: msg.storeTokenIdInJsonEditor,
  });
  figma.ui.resize(width, height);
  if (store.inspectDeep !== msg.inspectDeep) {
    store.inspectDeep = msg.inspectDeep;
    sendSelectionChange();
  }
};
