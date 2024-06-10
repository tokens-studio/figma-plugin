import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { sendSelectionChange } from '../sendSelectionChange';
import { setNonePluginData } from '../pluginData';
import { Properties } from '@/constants/Properties';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { postToUI } from '../notifiers';
import { defaultWorker } from '../Worker';
import { ProgressTracker } from '../ProgressTracker';

export const setNoneValuesOnNode: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_NONE_VALUES_ON_NODE] = async (msg) => {
  const nodesToRemove: { [key: string]: Properties[] } = {};

  msg.tokensToSet.forEach((token) => {
    token.nodes.forEach(({ id }) => {
      nodesToRemove[id] = nodesToRemove[id] ? [...nodesToRemove[id], token.property] : [token.property];
    });
  });
  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
      timePerTask: 2,
      completedTasks: 0,
      totalTasks: Object.keys(nodesToRemove).length,
    },
  });

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATEPLUGINDATA);
  const promises: Set<Promise<void>> = new Set();

  Object.entries(nodesToRemove).forEach(([nodeId, keys]) => {
    promises.add(defaultWorker.schedule(async () => {
      keys.forEach(async (key) => {
        const nodeToUpdate = figma.getNodeById(nodeId);
        if (nodeToUpdate) {
          await setNonePluginData({ nodes: [nodeToUpdate], key });
        }
      });
      tracker.next();
      tracker.reportIfNecessary();
    }));
  });

  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
  });
  sendSelectionChange();
};
