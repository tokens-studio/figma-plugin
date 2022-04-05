import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';

export function goToNodeId(id: string) {
  postToFigma({
    type: MessageToPluginTypes.GO_TO_NODE,
    id,
  });
}
