import setValuesOnNode, { resolvedVariableReferences } from './setValuesOnNode';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { defaultWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import { destructureTokenForAlias, mapValuesToTokens } from './node';
import { NodeManagerNode } from './NodeManager';
import { RawVariableReferenceMap } from '@/types/RawVariableReferenceMap';
import { FigmaStyleMaps } from '@/types/FigmaStyleMaps';

export async function updateNodes(
  nodes: readonly NodeManagerNode[],
  tokens: Map<string, AnyTokenList[number]>,
  figmaStyleMaps: FigmaStyleMaps,
  figmaVariableReferences: RawVariableReferenceMap,
  figmaStyleReferences: Record<string, string>,
  settings: SettingsState,
  stylePathPrefix?: string,
) {
  // Big O (n * m): (n = amount of nodes, m = amount of applied tokens to the node)
  const { ignoreFirstPartForStyles, baseFontSize } = settings ?? {};

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

  nodes.forEach(({ node, tokens: appliedTokens }) => {
    promises.add(
      defaultWorker.schedule(async () => {
        try {
          const rawTokenMap = destructureTokenForAlias(tokens, appliedTokens);
          const tokenValues = mapValuesToTokens(tokens, appliedTokens);
          setValuesOnNode(
            node,
            tokenValues,
            rawTokenMap,
            figmaStyleMaps,
            figmaStyleReferences,
            figmaVariableReferences,
            stylePathPrefix,
            ignoreFirstPartForStyles,
            baseFontSize,
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
  resolvedVariableReferences.clear();

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATENODES,
  });
}
