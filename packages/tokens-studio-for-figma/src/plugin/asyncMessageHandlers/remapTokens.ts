import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager } from '../NodeManager';
import { sendSelectionChange } from '../sendSelectionChange';
import { defaultWorker } from '../Worker';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { postToUI } from '../notifiers';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { ProgressTracker } from '../ProgressTracker';

export const remapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.REMAP_TOKENS] = async (msg) => {
  try {
    const {
      oldName, newName, updateMode, category,
    } = msg;
    const allWithData = await defaultNodeManager.findBaseNodesWithData({ updateMode });
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
        Object.entries(tokens).map(async ([key, value]) => {
          if (typeof category !== 'undefined' && key !== category) {
            return;
          }
          if (value === oldName) {
            const jsonValue = JSON.stringify(newName);
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
