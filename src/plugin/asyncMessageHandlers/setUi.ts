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
    updateRemote: msg.updateRemote,
    updateOnChange: msg.updateOnChange,
    updateStyles: msg.updateStyles,
    ignoreFirstPartForStyles: msg.ignoreFirstPartForStyles,
    prefixStylesWithThemeName: msg.prefixStylesWithThemeName,
    inspectDeep: msg.inspectDeep,
    baseFontSize: msg.baseFontSize,
    aliasBaseFontSize: msg.aliasBaseFontSize,
    shouldSwapStyles: msg.shouldSwapStyles,
  });
  figma.ui.resize(width, height);
  if (store.inspectDeep !== msg.inspectDeep) {
    store.inspectDeep = msg.inspectDeep;
    sendSelectionChange();
  }
};
