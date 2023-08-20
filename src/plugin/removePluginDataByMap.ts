import { Properties } from '@/constants/Properties';
import { postToUI } from './notifiers';
import removeValuesFromNode from './removeValuesFromNode';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { defaultWorker } from './Worker';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { ProgressTracker } from './ProgressTracker';

export async function removePluginDataByMap({ nodeKeyMap }: { nodeKeyMap: readonly ({ node: BaseNode | SceneNode; key: Properties; })[]; }) {
  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
      timePerTask: 2,
      completedTasks: 0,
      totalTasks: nodeKeyMap.length,
    },
  });

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATEPLUGINDATA);
  const promises: Set<Promise<void>> = new Set();
  nodeKeyMap.forEach(async ({ node, key }) => {
    promises.add(defaultWorker.schedule(async () => {
      node.setPluginData(key, '');
      tokensSharedDataHandler.set(node, key, '');
      removeValuesFromNode(node, key);

      tracker.next();
      tracker.reportIfNecessary();
    }));
  });
  await Promise.all(promises);
  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
  });
}
