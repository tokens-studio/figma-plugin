import store from './store';
import { defaultNodeManager } from './NodeManager';
import { SelectionContent, sendPluginValues } from './pluginData';
import { notifyNoSelection } from './notifiers';
import { UpdateMode } from '@/constants/UpdateMode';

export async function sendSelectionChange(): Promise<SelectionContent | null> {
  // Big O (sendPluginValues)
  const nodes = store.inspectDeep && store.shouldSendSelectionValues
    ? await defaultNodeManager.findBaseNodesWithData({
      updateMode: UpdateMode.SELECTION,
      nodesWithoutPluginData: true,
    })
    : await defaultNodeManager.findBaseNodesWithData({
      nodes: figma.currentPage.selection,
      nodesWithoutPluginData: false,
    });
  const currentSelectionLength = figma.currentPage.selection.length;

  if (!currentSelectionLength) {
    notifyNoSelection();
    return null;
  }
  return sendPluginValues({ nodes, shouldSendSelectionValues: store.shouldSendSelectionValues });
}
