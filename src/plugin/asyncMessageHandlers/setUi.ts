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
    prefixStylesWithThemeName: msg.prefixStylesWithThemeName,
    inspectDeep: msg.inspectDeep,
    baseFontSize: msg.baseFontSize,
    sessionRecording: msg.sessionRecording,
    aliasBaseFontSize: msg.aliasBaseFontSize,
    shouldSwapStyles: msg.shouldSwapStyles,
  });
  figma.ui.resize(width, height);
  if (store.inspectDeep !== msg.inspectDeep) {
    const previousValue = store.inspectDeep;
    store.inspectDeep = msg.inspectDeep;

    if (previousValue) sendSelectionChange();
  }
};
