import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';

export function selectNodes(ids: string[]) {
  postToFigma({
    type: MessageToPluginTypes.SELECT_NODES,
    ids,
  });
}
