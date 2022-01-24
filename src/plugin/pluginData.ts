import omit from 'just-omit';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { Properties } from '@/constants/Properties';
import store from './store';
import { notifySelection, postToUI } from './notifiers';
import removeValuesFromNode from './removeValuesFromNode';
import { defaultNodeManager, NodeManagerNode } from './NodeManager';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { defaultWorker } from './Worker';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { ProgressTracker } from './ProgressTracker';

export async function sendPluginValues(nodes: readonly BaseNode[], values?: NodeTokenRefMap) {
  let pluginValues = values;

  if (nodes.length > 1) {
    notifySelection(nodes[0].id);
  } else {
    if (!pluginValues) {
      const data = await defaultNodeManager.findNodesWithData({ nodes });
      pluginValues = data?.[0]?.tokens;
    }

    notifySelection(nodes[0].id, pluginValues);
  }
}

export async function removePluginData(nodes: readonly (BaseNode | SceneNode)[], key?: Properties) {
  return Promise.all(nodes.map(async (node) => {
    try {
      node.setRelaunchData({});
    } finally {
      if (key) {
        node.setPluginData(key, '');
        tokensSharedDataHandler.set(node, key, '');
        await defaultNodeManager.updateNode(node, (tokens) => (
          omit(tokens, key)
        ));
        // TODO: Introduce setting asking user if values should be removed?
        removeValuesFromNode(node, key);
      } else {
        await defaultNodeManager.updateNode(node, (tokens) => (
          omit(tokens, Object.values(Properties))
        ));
        Object.values(Properties).forEach((prop) => {
          node.setPluginData(prop, '');
          tokensSharedDataHandler.set(node, prop, '');
          // TODO: Introduce setting asking user if values should be removed?
          removeValuesFromNode(node, prop);
        });
      }
      // @deprecated remove deprecated values key
      node.setPluginData('values', '');
      store.successfulNodes.add(node);
    }
  }));
}

export async function updatePluginData(entries: readonly NodeManagerNode[], values: NodeTokenRefMap) {
  const namespace = SharedPluginDataNamespaces.TOKENS;

  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
      timePerTask: 2,
      completedTasks: 0,
      totalTasks: entries.length,
    },
  });

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATEPLUGINDATA);
  const promises: Set<Promise<void>> = new Set();
  entries.forEach(({ node, tokens }) => {
    promises.add(defaultWorker.schedule(async () => {
      const currentValuesOnNode = tokens ?? {};
      const newValuesOnNode = { ...currentValuesOnNode, ...values };

      await Promise.all(Object.entries(newValuesOnNode).map(async ([key, value]) => {
        if (value === currentValuesOnNode[key]) {
          return;
        }

        const jsonValue = JSON.stringify(value);
        switch (value) {
          case 'delete':
            delete newValuesOnNode[key];
            await removePluginData([node], key as Properties);
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

      if (node.type !== 'INSTANCE') {
        const nodeHasNoValues = Object.keys(newValuesOnNode).length === 0 && newValuesOnNode.constructor === Object;
        const editRelaunchData = node.getRelaunchData() as {
          edit?: string
        };

        if (nodeHasNoValues && editRelaunchData.edit) {
          try {
            node.setRelaunchData({});
          } catch (e) {
            console.error('Updating relaunchData on instance children not supported.');
          }
        } else if (!nodeHasNoValues) {
          const updatedRelaunchData = Object.keys(newValuesOnNode).join(', ');
          if (updatedRelaunchData !== editRelaunchData.edit) {
            try {
              node.setRelaunchData({
                edit: updatedRelaunchData,
              });
            } catch (e) {
              console.error('Updating relaunchData on instance children not supported.');
            }
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
}
