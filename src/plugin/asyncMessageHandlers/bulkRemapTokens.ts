import { clone } from '@figma-plugin/helpers';
import { AsyncMessageChannelHandlers, AsyncMessageChannel } from '@/AsyncMessageChannel';

import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager } from '../NodeManager';
import { sendSelectionChange } from '../sendSelectionChange';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { postToUI } from '../notifiers';
import { ProgressTracker } from '../ProgressTracker';
import { defaultWorker } from '../Worker';
import getAppliedVariablesFromNode from '../getAppliedVariablesFromNode';
import { AnyTokenList } from '@/types/tokens';
import getAppliedStylesFromNode from '../getAppliedStylesFromNode';

const getTokenValue = (name: string, resolvedTokens: AnyTokenList) => resolvedTokens.find((token) => token.name === name);

// const getStyleByName = (name: string) => (
//   figma.getLocalPaintStyles().find((style) => style.name === name)
// );

export const bulkRemapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.BULK_REMAP_TOKENS] = async (msg) => {
  // Big O(n * m) + Big O(updatePluginData) + Big O(sendSelectionChange): (n = amount of nodes, m = amount of tokens in the node)
  try {
    const { oldName, newName, resolvedTokens } = msg;
    console.log('oldName: ', oldName);
    console.log('newName: ', newName);
    const allWithData = await defaultNodeManager.findBaseNodesWithData({ updateMode: msg.updateMode });
    const namespace = SharedPluginDataNamespaces.TOKENS;
    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
        timePerTask: 2,
        completedTasks: 0,
        totalTasks: allWithData.length,
      },
    });

    const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATEPLUGINDATA);
    const promises: Set<Promise<void>> = new Set();

    allWithData.forEach(({ node, tokens }) => {
      promises.add(
        defaultWorker.schedule(async () => {
          Object.entries(tokens).forEach(([key, value]) => {
            if (value.includes(oldName)) {
              const newValue = value.replace(oldName, newName);
              const jsonValue = JSON.stringify(newValue);
              node.setSharedPluginData(namespace, key, jsonValue);
            }
          });

          if (Object.keys(tokens).length === 0) {
            if (getAppliedVariablesFromNode(node).length > 0) {
              console.log('111111111111');
              const { name: variableName } = getAppliedVariablesFromNode(node)[0];
              if (node.type !== 'DOCUMENT' && node.type !== 'PAGE' && 'fills' in node && node.boundVariables) {
                const variableId = node.boundVariables?.fills?.[0].id;
                if (variableId) {
                  const variable = figma.variables.getVariableById(variableId);
                  if (variable) {
                    const newValue = variableName.replace(oldName, newName);
                    const resolvedValue = getTokenValue(newValue, resolvedTokens ?? []);
                    const paint = figma.util.solidPaint(resolvedValue?.value as string);
                    const fillsCopy = clone(node.fills);
                    fillsCopy[0] = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
                    const newVariable = await figma.variables.importVariableByKeyAsync(resolvedValue?.name as string);
                    fillsCopy[0].boundVariables.color.id = newVariable.id;
                    node.fills = fillsCopy;
                  }
                }
              }
            }
            if (getAppliedStylesFromNode(node).length > 0) {
              const themeInfo = await AsyncMessageChannel.PluginInstance.message({
                type: AsyncMessageTypes.GET_THEME_INFO,
              });

              const figmaStyleReferences: Record<string, string> = {};

              themeInfo.themes?.forEach((theme) => {
                Object.entries(theme.$figmaStyleReferences ?? {}).forEach(([token, styleId]) => {
                  if (!figmaStyleReferences[token]) {
                    figmaStyleReferences[token] = styleId;
                  }
                });
              });

              const appliedStyles = getAppliedStylesFromNode(node);
              const newValue = appliedStyles[0].name.replace(oldName, newName);

              const styleKeyMatch = figmaStyleReferences[newValue].match(/^S:([a-zA-Z0-9_-]+),/);

              const newStyle = await figma.importStyleByKeyAsync(styleKeyMatch ? styleKeyMatch[1] : '');

              if (node.type !== 'DOCUMENT' && node.type !== 'PAGE' && 'fills' in node) {
                // const newStyle = getStyleByName(styleName.replace(oldName, newName).split('.').join('/'));
                const fillsCopy = clone(node.fills);
                node.fillStyleId = newStyle?.id as string;
                node.fills = fillsCopy;
              }
            }
          }

          tracker.next();
          tracker.reportIfNecessary();
        }),
      );
    });

    await Promise.all(promises);

    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
    });
    await sendSelectionChange();
  } catch (e) {
    console.error(e);
  }
};
