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
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { destructureTokenForAlias, mapValuesToTokens } from './node';
import setValuesOnNode from './setValuesOnNode';
import { VariableReferenceMap } from '@/types/VariableReferenceMap';

export async function updatePluginDataAndNodes({
  entries: nodes, values: tokenValues, tokensMap, settings,
}: { entries: readonly BaseNode[]; values: NodeTokenRefMap; tokensMap: Map<string, AnyTokenList[number]>; settings?: SettingsState }) {
  // Big O (n * m): (n = amount of nodes, m = amount of applied tokens to the node)
  const { ignoreFirstPartForStyles, prefixStylesWithThemeName, baseFontSize } = settings ?? {};
  const figmaStyleMaps = getAllFigmaStyleMaps();

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });

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
  const figmaStyleReferences: Record<string, string> = {};
  const figmaVariableReferences: VariableReferenceMap = new Map();
  const activeThemes = themeInfo.themes?.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id));

  activeThemes?.forEach((theme) => {
    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(async ([token, variableId]) => {
      const foundVariableId = await figma.variables.importVariableByKeyAsync(variableId);
      if (foundVariableId) {
        figmaVariableReferences.set(token, foundVariableId);
      }
    });
    Object.entries(theme.$figmaStyleReferences ?? {}).forEach(([token, styleId]) => {
      if (!figmaStyleReferences[token]) {
        figmaStyleReferences[token] = styleId;
      }
    });
  });

  const stylePathPrefix = prefixStylesWithThemeName && activeThemes.length > 0 ? activeThemes[0].name : null;
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
