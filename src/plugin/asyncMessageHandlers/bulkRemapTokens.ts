import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager } from '../NodeManager';
import { sendSelectionChange } from '../sendSelectionChange';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { postToUI } from '../notifiers';
import { ProgressTracker } from '../ProgressTracker';
import { defaultWorker } from '../Worker';

export const bulkRemapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.BULK_REMAP_TOKENS] = async (msg) => {
  // Big O(n * m) + Big O(updatePluginData) + Big O(sendSelectionChange): (n = amount of nodes, m = amount of tokens in the node)
  try {
    const { oldName, newName } = msg;
    const allWithData = await defaultNodeManager.findBaseNodesWithData({ updateMode: msg.updateMode });
    const namespace = SharedPluginDataNamespaces.TOKENS;
    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
        timePerTask: 2,
        completedTasks: 0,
        totalTasks: allWithData.length,
      },
    });

    const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATEPLUGINDATA);
    const promises: Set<Promise<void>> = new Set();

    allWithData.forEach(({ node, tokens }) => {
      promises.add(defaultWorker.schedule(async () => {
        Object.entries(tokens).forEach(([key, value]) => {
          if (value.includes(oldName)) {
            const newValue = value.replace(oldName, newName);
            const jsonValue = JSON.stringify(newValue);
            node.setSharedPluginData(namespace, key, jsonValue);
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
    await sendSelectionChange();
  } catch (e) {
    console.error(e);
  }
};
