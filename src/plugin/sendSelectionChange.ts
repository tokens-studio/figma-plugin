import store from './store';
import { defaultNodeManager } from './NodeManager';
import { SelectionContent, sendPluginValues } from './pluginData';
import { notifyNoSelection } from './notifiers';
import { UpdateMode } from '@/constants/UpdateMode';

export async function sendSelectionChange(): Promise<SelectionContent | null> {
  const nodes = store.inspectDeep && store.shouldSendSelectionValues
    ? (await defaultNodeManager.findNodesWithData({ updateMode: UpdateMode.SELECTION })).map((node) => node.node)
    : Array.from(figma.currentPage.selection);
  const currentSelectionLength = figma.currentPage.selection.length;

  if (!currentSelectionLength) {
    notifyNoSelection();
    return null;
  }
  return sendPluginValues({ nodes, shouldSendSelectionValues: store.shouldSendSelectionValues });
}
