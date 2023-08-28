import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { Properties } from '@/constants/Properties';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { AnyTokenList } from '@/types/tokens';
import { postToUI } from './notifiers';
import { defaultWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { removePluginData, setNonePluginData } from './pluginData';
import { SettingsState } from '@/app/store/models/settings';
import { destructureTokenForAlias, mapValuesToTokens } from './node';
import setValuesOnNode from './setValuesOnNode';
import { VariableReferenceMap } from '@/types/VariableReferenceMap';
import { FigmaStyleMaps } from '@/types/FigmaStyleMaps';

export async function updatePluginDataAndNodes({
  entries: nodes, values: tokenValues, tokensMap, figmaStyleMaps, figmaVariableReferences, figmaStyleReferences, stylePathPrefix, settings,
}: { entries: readonly BaseNode[]; values: NodeTokenRefMap; tokensMap: Map<string, AnyTokenList[number]>; figmaStyleMaps: FigmaStyleMaps; figmaVariableReferences: VariableReferenceMap; figmaStyleReferences: Record<string, string>; stylePathPrefix?: string; settings?: SettingsState }) {
  // Big O (n * m): (n = amount of nodes, m = amount of applied tokens to the node)
  const { ignoreFirstPartForStyles, baseFontSize } = settings ?? {};

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

  // Store all figmaStyleReferences through all activeThemes (e.g {color.red: ['s.1234'], color.blue ['s.2345', 's.3456']})

  nodes.forEach((node) => {
    promises.add(defaultWorker.schedule(async () => {
      try {
        await Promise.all(Object.entries(tokenValues).map(async ([key, value]) => {
          const jsonValue = JSON.stringify(value);
          switch (value) {
            case 'delete':
              delete tokenValues[key as CompositionTokenProperty];
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
          node,
          mappedValues,
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
    }));
  });
  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
  });
}
