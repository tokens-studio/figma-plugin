import { clone } from '@figma-plugin/helpers';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';

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
import { store } from '@/app/store';
import { activeThemeSelector, themesListSelector } from '@/selectors';

const getTokenValue = (name: string, resolvedTokens: AnyTokenList) => resolvedTokens.find((token) => token.name === name);

const variablesCache: { [key: string]: Variable } = {};

export const bulkRemapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.BULK_REMAP_TOKENS] = async (msg) => {
  // Big O(n * m) + Big O(updatePluginData) + Big O(sendSelectionChange): (n = amount of nodes, m = amount of tokens in the node)
  try {
    const { oldName, newName, resolvedTokens } = msg;
    const allWithData = await defaultNodeManager.findBaseNodesWithData({ updateMode: msg.updateMode });
    const namespace = SharedPluginDataNamespaces.TOKENS;

    const effectStyles = figma.getLocalEffectStyles();
    const paintStyles = figma.getLocalPaintStyles();
    const textStyles = figma.getLocalTextStyles();
    const allStyles = [...effectStyles, ...paintStyles, ...textStyles];

    const tempState = store.getState();
    const activeTheme = activeThemeSelector(tempState);
    const themesList = themesListSelector(tempState);

    const themeInfo = {
      activeTheme,
      themes: themesList,
    };

    const figmaStyleReferences: Record<string, string> = {};

    themeInfo.themes?.forEash((theme) => {
      Object.entries(theme.$figmaStyleReferences ?? {}).forEach(([token, styleId]) => {
        if (!figmaStyleReferences[token]) {
          figmaStyleReferences[token] = styleId;
        }
      });
    });

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
              const appliedVariables = getAppliedStylesFromNode(node);
              await Promise.all(
                appliedVariables.map(async (variable) => {
                  const { name: variableName } = variable;

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
                        let newVariable;
                        if (variablesCache.hasOwnProperty(resolvedValue?.name as string)) {
                          newVariable = variablesCache[resolvedValue?.name as string];
                        } else {
                          newVariable = await figma.variables.importVariableByKeyAsync(resolvedValue?.name as string);
                          variablesCache[resolvedValue?.name as string] = newVariable;
                        }
                        fillsCopy[0].boundVariables.color.id = newVariable.id;
                        node.fills = fillsCopy;
                      }
                    }
                  }
                }),
              );
            }
            if (getAppliedStylesFromNode(node).length > 0) {
              const appliedStyles = getAppliedStylesFromNode(node);
              await Promise.all(
                appliedStyles.map(async (style) => {
                  const newValue = style.name.replace(oldName, newName);

                  const styleKeyMatch = figmaStyleReferences[newValue].match(/^S:([a-zA-Z0-9_-]+),/);

                  if (styleKeyMatch) {
                    const actualStyleId = await new Promise<string>((resolve) => {
                      figma
                        .importStyleByKeyAsync(styleKeyMatch[1])
                        .then((remoteStyle) => resolve(remoteStyle.id))
                        .catch(() => {
                          const updatedNewValue = newValue.split('.').join('/');
                          resolve(allStyles.filter((style) => style.name === updatedNewValue)[0]?.id);
                        });
                    });

                    if (node.type !== 'DOCUMENT' && node.type !== 'PAGE' && 'fillStyleId' in node) {
                      node.fillStyleId = actualStyleId;
                    }
                  }
                }),
              );
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
