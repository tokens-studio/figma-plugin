import setValuesOnNode from './setValuesOnNode';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { defaultWorker } from './Worker';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { ProgressTracker } from './ProgressTracker';
import { AnyTokenList } from '@/types/tokens';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { SettingsState } from '@/app/store/models/settings';
import { getVariablesMap } from '@/utils/getVariablesMap';
import { destructureTokenForAlias, mapValuesToTokens } from './node';
import { NodeManagerNode } from './NodeManager';

export async function updateNodes(
  nodes: readonly NodeManagerNode[],
  tokens: Map<string, AnyTokenList[number]>,
  settings?: SettingsState,
) {
  // Big O (n * m): (n = amount of nodes, m = amount of applied tokens to the node)
  const { ignoreFirstPartForStyles, prefixStylesWithThemeName, baseFontSize } = settings ?? {};
  const figmaStyleMaps = getAllFigmaStyleMaps();
  const figmaVariableMaps = getVariablesMap();

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
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
            figmaVariableMaps,
            figmaVariableReferences,
            stylePathPrefix,
            ignoreFirstPartForStyles,
            baseFontSize,
          );
        } catch (e) {
          console.log('got error', e);
        }

        tracker.next();
        tracker.reportIfNecessary();
      }),
    );
  });
  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATENODES,
  });
}
