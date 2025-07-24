import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { DefaultWindowSize } from '@/constants/DefaultWindowSize';
import { notifyNoSelection } from '@/plugin/notifiers';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { startup } from './startup';

export async function init() {
  return startup().then(async (params) => {
    figma.showUI(__html__, {
      themeColors: true,
      width: params.settings.width ?? DefaultWindowSize.width,
      height: params.settings.height ?? DefaultWindowSize.height,
    });

    await AsyncMessageChannel.PluginInstance.message({
      type: AsyncMessageTypes.STARTUP,
      ...params,
    });

    if (!figma.currentPage.selection.length) {
      notifyNoSelection();
    }
  }).catch((err) => {
    throw err;
  });
}
