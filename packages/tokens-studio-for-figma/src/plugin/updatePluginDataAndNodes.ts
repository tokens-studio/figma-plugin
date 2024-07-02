import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { Properties } from '@/constants/Properties';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { AnyTokenList } from '@/types/tokens';
import { postToUI } from './notifiers';
import { defaultWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { removePluginData, setNonePluginData } from './pluginData';
import { SettingsState } from '@/app/store/models/settings';
import { destructureTokenForAlias, mapValuesToTokens } from './node';
import setValuesOnNode from './setValuesOnNode';

export async function updatePluginDataAndNodes({
  entries: nodes, values: tokenValues, tokensMap, settings,
}: { entries: readonly BaseNode[]; values: NodeTokenRefMap; tokensMap: Map<string, AnyTokenList[number]>; settings?: SettingsState }) {
  // Big O (n * m): (n = amount of nodes, m = amount of applied tokens to the node)
  const { baseFontSize } = settings ?? {};

  const namespace = SharedPluginDataNamespaces.TOKENS;
  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
      timePerTask: 2,
      completedTasks: 0,
      totalTasks: nodes.length,
    },
  });

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATEPLUGINDATA);
  const promises: Set<Promise<void>> = new Set();

  nodes.forEach((node) => {
    promises.add(defaultWorker.schedule(async () => {
      try {
        await Promise.all(Object.entries(tokenValues).map(async ([key, value]) => {
          const jsonValue = JSON.stringify(value);
          switch (value) {
            case 'delete':
              await removePluginData({ nodes: [node], key: key as Properties, shouldRemoveValues: true });
              break;
            case 'none':
              await setNonePluginData({ nodes: [node], key: key as Properties });
              break;
            default:
              node.setSharedPluginData(namespace, key, jsonValue);
              break;
          }
        }));
        const rawTokenMap = destructureTokenForAlias(tokensMap, tokenValues);
        const mappedValues = mapValuesToTokens(tokensMap, tokenValues);

        setValuesOnNode(
          {
            node,
            values: mappedValues,
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
  });
  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
  });
}
