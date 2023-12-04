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
import getAppliedStylesFromNode from '../getAppliedStylesFromNode';

export const bulkRemapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.BULK_REMAP_TOKENS] = async (msg) => {
  // Big O(n * m) + Big O(updatePluginData) + Big O(sendSelectionChange): (n = amount of nodes, m = amount of tokens in the node)
  try {
    const { oldName, newName } = msg;
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
      promises.add(defaultWorker.schedule(async () => {
        Object.entries(tokens).forEach(([key, value]) => {
          if (value.includes(oldName)) {
            const newValue = value.replace(oldName, newName);
            const jsonValue = JSON.stringify(newValue);
            node.setSharedPluginData(namespace, key, jsonValue);
          }
        });

        if (Object.keys(tokens).length === 0) {
          if (getAppliedVariablesFromNode(node).length > 0) {
            const { name: variableName, type: variableType } = getAppliedVariablesFromNode(node)[0];

            const savedVariableData = node.getSharedPluginData(SharedPluginDataNamespaces.VARIABLES, variableType);
            if (savedVariableData.length > 0) {
              if (savedVariableData.includes(oldName)) {
                const newValue = JSON.parse(savedVariableData).replace(oldName, newName);
                const jsonValue = JSON.stringify(newValue);
                node.setSharedPluginData(SharedPluginDataNamespaces.VARIABLES, variableType, jsonValue);
              }
            } else if (variableName.includes(oldName)) {
              const newValue = variableName.replace(oldName, newName);
              const jsonValue = JSON.stringify(newValue);
              node.setSharedPluginData(SharedPluginDataNamespaces.VARIABLES, variableType, jsonValue);
            }
          }

          if (getAppliedStylesFromNode(node).length > 0) {
            const { name: styleName, type: styleType } = getAppliedStylesFromNode(node)[0];

            const savedStyleData = node.getSharedPluginData(SharedPluginDataNamespaces.STYLES, styleType);

            if (savedStyleData.length > 0) {
              if (savedStyleData.includes(oldName)) {
                const newValue = JSON.parse(savedStyleData).replace(oldName, newName);
                const jsonValue = JSON.stringify(newValue);
                node.setSharedPluginData(SharedPluginDataNamespaces.STYLES, styleType, jsonValue);
              }
            } else if (styleName.includes(oldName)) {
              const newValue = styleName.replace(oldName, newName);
              const jsonValue = JSON.stringify(newValue);
              node.setSharedPluginData(SharedPluginDataNamespaces.STYLES, styleType, jsonValue);
            }
          }
        }

        tracker.next();
        tracker.reportIfNecessary();
      }));
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
