import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { findAll } from '@/utils/findAll';
import { postToUI } from '../notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { ProgressTracker } from '../ProgressTracker';
import { defaultWorker } from '../Worker';

export const removeRelaunchData: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_RELAUNCH_DATA] = async (msg) => {
  let relevantNodes: BaseNode[] = [];
  if (msg.area === UpdateMode.PAGE) {
    relevantNodes = findAll([figma.currentPage], false, true);
  } else if (msg.area === UpdateMode.SELECTION) {
    relevantNodes = findAll(figma.currentPage.selection, true, true);
  } else {
    relevantNodes = findAll([figma.root], false, true);
  }

  if (relevantNodes.length === 0) {
    return { totalNodes: 0 };
  }

  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_REMOVE_RELAUNCH_DATA,
      timePerTask: 1,
      completedTasks: 0,
      totalTasks: relevantNodes.length,
    },
  });

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_REMOVE_RELAUNCH_DATA);
  const promises: Set<Promise<void>> = new Set();

  relevantNodes.forEach((node) => {
    promises.add(
      defaultWorker.schedule(async () => {
        try {
          node.setRelaunchData({});
        } catch (e) {
          console.log('got error', e);
        } finally {
          tracker.next();
          tracker.reportIfNecessary();
          Promise.resolve();
        }
      }),
    );
  });
  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_REMOVE_RELAUNCH_DATA,
  });

  return { totalNodes: relevantNodes.length };
};
