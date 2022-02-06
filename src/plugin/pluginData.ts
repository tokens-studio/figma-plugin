import omit from 'just-omit';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { Properties } from '@/constants/Properties';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import store from './store';
import { notifySelection, postToUI } from './notifiers';
import removeValuesFromNode from './removeValuesFromNode';
import { defaultNodeManager, NodeManagerNode } from './NodeManager';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { defaultWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { SelectionGroup, SelectionValue } from '@/types/tokens';

function mapPropertyToCategory(key): string | null {
  if (Properties[key]) return Properties[key];
  return null;
}

export function transformPluginDataToSelectionValues(pluginData): SelectionGroup {
  const selectionValues = pluginData.reduce((acc, curr) => {
    const { tokens, id } = curr;
    Object.entries(tokens).forEach(([key, value]) => {
      const existing = acc.find((item) => item.type === key && item.value === value);

      if (existing) {
        existing.nodes.push(id);
      } else {
        const category = mapPropertyToCategory(key);

        acc.push({
          value, type: key, category, nodes: [id],
        });
      }
    });
    return acc;
  }, []);

  return selectionValues;
}

type SelectionContent = {
  selectionValues: SelectionGroup[]
  mainNodeSelectionValues: SelectionValue[]
};

export async function sendPluginValues(nodes: readonly BaseNode[], values?: NodeTokenRefMap): Promise<SelectionContent> {
  let pluginValues = values;
  let mainNodeSelectionValues = [];
  let selectionValues;

  if (!pluginValues) {
    pluginValues = await defaultNodeManager.findNodesWithData({ nodes });
  }
  console.log('Pluginvalues', pluginValues);

  // TODO: Handle all selected nodes share the same properties
  // TODO: Handle many selected and mixed (for Tokens tab)
  if (pluginValues?.length > 0) {
    selectionValues = transformPluginDataToSelectionValues(pluginValues);
    mainNodeSelectionValues = pluginValues.map((value) => value.tokens);
  }

  console.log('Transformed', selectionValues);
  notifySelection({ selectionValues, mainNodeSelectionValues });
  return { selectionValues, mainNodeSelectionValues };
}

export async function removePluginData({ nodes, key, shouldRemoveValues = true }: { nodes: readonly (BaseNode | SceneNode)[], key?: Properties, shouldRemoveValues?: boolean }) {
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
        if (shouldRemoveValues) {
          removeValuesFromNode(node, key);
        }
      } else {
        await defaultNodeManager.updateNode(node, (tokens) => (
          omit(tokens, Object.values(Properties))
        ));
        Object.values(Properties).forEach((prop) => {
          node.setPluginData(prop, '');
          tokensSharedDataHandler.set(node, prop, '');
          if (shouldRemoveValues) {
            removeValuesFromNode(node, prop);
          }
        });
      }
      // @deprecated remove deprecated values key
      node.setPluginData('values', '');
      store.successfulNodes.add(node);
    }
  }));
}

export function findNodesById(nodes, ids): SceneNode[] {
  const nodesAndChildren = [];

  nodes.forEach((node) => {
    if (ids.includes(node.id)) {
      nodesAndChildren.push(node);
    }
    if (node.children) {
      nodesAndChildren.push(...findNodesById(node.children, ids));
    }
  });

  return nodesAndChildren;
}

export async function updatePluginData(entries: readonly NodeManagerNode[], values: NodeTokenRefMap, shouldOverride = false) {
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

      console.log('Setting new values in node', node, newValuesOnNode);

      await Promise.all(Object.entries(newValuesOnNode).map(async ([key, value]) => {
        console.log('Current Value', value, currentValuesOnNode[key]);
        if (value === currentValuesOnNode[key] && !shouldOverride) {
          return;
        }

        const jsonValue = JSON.stringify(value);
        console.log('SETTING', key, jsonValue);
        switch (value) {
          case 'delete':
            delete newValuesOnNode[key];
            await removePluginData({ nodes: [node], key: key as Properties });
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
      console.log('Updating cache', node, newValuesOnNode);
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
