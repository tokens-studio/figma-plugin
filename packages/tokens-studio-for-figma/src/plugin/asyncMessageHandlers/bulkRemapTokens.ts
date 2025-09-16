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
    const { oldName, newName, useRegex } = msg;
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
    const regexPattern = /^\/(.*)\/([gimsuy]*)$/;

    allWithData.forEach(({ node, tokens }) => {
      promises.add(defaultWorker.schedule(async () => {
        Object.entries(tokens).forEach(([key, value]) => {
          if (useRegex) {
            // When regex mode is enabled, check if the pattern is wrapped in /pattern/flags format
            const regexTest = oldName.match(regexPattern);
            const pattern = regexTest ? new RegExp(regexTest[1], regexTest[2]) : new RegExp(oldName, 'g');

            if (pattern.test(value)) {
              const newValue = value.replace(pattern, newName);
              const jsonValue = JSON.stringify(newValue);
              node.setSharedPluginData(namespace, key, jsonValue);
            }
          } else if (value.includes(oldName)) {
            // When regex mode is disabled, use simple string replacement
            const newValue = value.split(oldName).join(newName);
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
