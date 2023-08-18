import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { Properties } from '@/constants/Properties';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { AnyTokenList } from '@/types/tokens';
import { postToUI } from './notifiers';
import { defaultNodeManager, NodeManagerNode } from './NodeManager';
import { defaultWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { removePluginData, setNonePluginData } from './pluginData';
import { SettingsState } from '@/app/store/models/settings';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { getVariablesMap } from '@/utils/getVariablesMap';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { destructureTokenForAlias, mapValuesToTokens } from './node';
import setValuesOnNode from './setValuesOnNode';

export async function updatePluginDataAndNodes({
  entries: nodes, values: tokenValues, shouldOverride = false, shouldRemove = true, tokensMap, settings,
}: { entries: readonly NodeManagerNode[]; values: NodeTokenRefMap; shouldOverride?: boolean; shouldRemove?: boolean; tokensMap: Map<string, AnyTokenList[number]>; settings?: SettingsState }) {
  // Big O (n * m): (n = amount of nodes, m = amount of applied tokens to the node)
  const { ignoreFirstPartForStyles, prefixStylesWithThemeName, baseFontSize } = settings ?? {};
  const figmaStyleMaps = getAllFigmaStyleMaps();
  const figmaVariableMaps = getVariablesMap();

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
  const figmaVariableReferences: Record<string, string> = {};
  const activeThemes = themeInfo.themes?.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id));

  activeThemes?.forEach((theme) => {
    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(([token, variableId]) => {
      if (!figmaVariableReferences[token]) {
        figmaVariableReferences[token] = variableId;
      }
    });
    Object.entries(theme.$figmaStyleReferences ?? {}).forEach(([token, styleId]) => {
      if (!figmaStyleReferences[token]) {
        figmaStyleReferences[token] = styleId;
      }
    });
  });

  const stylePathPrefix = prefixStylesWithThemeName && activeThemes.length > 0 ? activeThemes[0].name : null;

  nodes.forEach(({ node, tokens: tokensOnNode }) => {
    promises.add(defaultWorker.schedule(async () => {
      try {
        const figmaNode = figma.getNodeById(node.id);
        if (!figmaNode) {
          console.warn(`Node with ID ${node.id} no longer exists`);
          return;
        }
        const currentValuesOnNode = tokensOnNode ?? {};
        let newValuesOnNode: NodeTokenRefMap = {};
        if (tokenValues.composition === 'delete') newValuesOnNode = { ...tokenValues, ...currentValuesOnNode, composition: tokenValues.composition };
        else newValuesOnNode = { ...currentValuesOnNode, ...tokenValues };
        if (currentValuesOnNode.composition && tokenValues.composition) {
        // when select another composition token, reset applied properties by current composition token
          const resolvedToken = tokensMap?.get(currentValuesOnNode.composition);
          let removeProperties: string[] = [];
          if (resolvedToken && resolvedToken.rawValue) {
            removeProperties = Object.keys(resolvedToken.rawValue).map((property) => (
              property
            ));
          }
          if (removeProperties && removeProperties.length > 0) {
            await Promise.all(removeProperties.map(async (property) => {
              await removePluginData({ nodes: [node], key: property as Properties, shouldRemoveValues: shouldRemove });
            }));
          }
          shouldOverride = true;
        }
        await Promise.all(Object.entries(newValuesOnNode).map(async ([key, value]) => {
          if (value === currentValuesOnNode[key as CompositionTokenProperty] && !shouldOverride) {
            return;
          }

          const jsonValue = JSON.stringify(value);
          switch (value) {
            case 'delete':
              delete newValuesOnNode[key as CompositionTokenProperty];
              await removePluginData({ nodes: [node], key: key as Properties, shouldRemoveValues: shouldRemove });
              break;
            case 'none':
              await setNonePluginData({ nodes: [node], key: key as Properties });
              break;
              // Pre-Version 53 had horizontalPadding and verticalPadding.
            case 'horizontalPadding':
              newValuesOnNode.paddingLeft = jsonValue;
              newValuesOnNode.paddingRight = jsonValue;
              node.setSharedPluginData(namespace, Properties.paddingLeft, jsonValue);
              node.setSharedPluginData(namespace, Properties.paddingRight, jsonValue);
              break;
            case 'verticalPadding':
              newValuesOnNode.paddingTop = jsonValue;
              newValuesOnNode.paddingBottom = jsonValue;
              node.setSharedPluginData(namespace, Properties.paddingTop, jsonValue);
              node.setSharedPluginData(namespace, Properties.paddingBottom, jsonValue);
              break;
            default:
              node.setSharedPluginData(namespace, key, jsonValue);
              break;
          }
        }));
        await defaultNodeManager.updateNode(node, newValuesOnNode);
        const rawTokenMap = destructureTokenForAlias(tokensMap, newValuesOnNode);
        const mappedValues = mapValuesToTokens(tokensMap, newValuesOnNode);

        setValuesOnNode(
          node,
          mappedValues,
          rawTokenMap,
          figmaStyleMaps,
          figmaStyleReferences,
          figmaVariableMaps,
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
