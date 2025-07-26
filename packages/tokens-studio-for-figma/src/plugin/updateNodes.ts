import setValuesOnNode from './setValuesOnNode';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { defaultWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { destructureTokenForAlias, mapValuesToTokens } from './node';
import { NodeManagerNode } from './NodeManager';
import { defaultTokenValueRetriever } from './TokenValueRetriever';

export async function updateNodes(
  nodes: readonly NodeManagerNode[],
  baseFontSize: string,
) {
  // Big O (n * m): (n = amount of nodes, m = amount of applied tokens to the node)

  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_UPDATENODES,
      timePerTask: 2,
      completedTasks: 0,
      totalTasks: nodes.length,
    },
  });

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATENODES);
  const promises: Set<Promise<void>> = new Set();

  const tokens = defaultTokenValueRetriever.getTokens();

  nodes.forEach(({ node, tokens: appliedTokens }) => {
    promises.add(
      defaultWorker.schedule(async () => {
        try {
          const rawTokenMap = destructureTokenForAlias(tokens, appliedTokens);
          const tokenValues = mapValuesToTokens(tokens, appliedTokens);
          setValuesOnNode(
            {
              node,
              values: tokenValues,
              data: rawTokenMap,
              baseFontSize,
            },
          );
        } catch (e) {
          console.log('got error', e);
        } finally {
          tracker.next();
          tracker.reportIfNecessary();
        }
      }),
    );
  });
  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATENODES,
  });
}
