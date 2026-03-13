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
  // Performance optimization: Pre-fetch tokens once instead of repeated calls

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

  // Performance optimization: Get tokens once before processing all nodes
  const tokens = defaultTokenValueRetriever.getTokens();

  // Performance optimization: Process nodes in batches to reduce memory pressure
  // and improve throughput for large node sets (10k+ nodes)
  const BATCH_SIZE = 50;

  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    const batch = nodes.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(({ node, tokens: appliedTokens }) => defaultWorker.schedule(async () => {
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
    }));

    promises.add(Promise.all(batchPromises).then(() => {}));
  }

  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATENODES,
  });
}
