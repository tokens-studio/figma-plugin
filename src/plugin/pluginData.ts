import omit from 'just-omit';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { Properties } from '@/constants/Properties';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { AnyTokenList, SingleCompositionToken } from '@/types/tokens';
import store from './store';
import { notifySelection, postToUI } from './notifiers';
import removeValuesFromNode from './removeValuesFromNode';
import { defaultNodeManager, NodeManagerNode } from './NodeManager';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { defaultWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { SelectionGroup, SelectionValue } from '@/types';
import { TokenCompositionValue } from '@/types/values';

// @TODO FIX TYPINGS! Missing or bad typings are very difficult for other developers to work in

export function transformPluginDataToSelectionValues(pluginData): SelectionGroup {
  const selectionValues = pluginData.reduce((acc, curr) => {
    const { tokens, id, node: { name, type } } = curr;

    Object.entries(tokens).forEach(([key, value]) => {
      const existing = acc.find((item) => item.type === key && item.value === value);

      if (existing) {
        existing.nodes.push({ id, name, type });
      } else {
        const category = Properties[key];

        acc.push({
          value, type: key, category, nodes: [{ id, name, type }],
        });
      }
    });
    return acc;
  }, []);

  return selectionValues;
}

export type SelectionContent = {
  selectionValues?: SelectionGroup[]
  mainNodeSelectionValues: SelectionValue[]
  selectedNodes: number
};

export async function sendPluginValues({ nodes, values, shouldSendSelectionValues }: { nodes: readonly BaseNode[], values?: NodeTokenRefMap, shouldSendSelectionValues: boolean }): Promise<SelectionContent> {
  let pluginValues = values;
  let mainNodeSelectionValues = [];
  let selectionValues;
  if (!pluginValues) {
    pluginValues = await defaultNodeManager.findNodesWithData({ nodes });
  }
  // TODO: Handle all selected nodes share the same properties
  // TODO: Handle many selected and mixed (for Tokens tab)
  if (pluginValues?.length > 0) {
    if (shouldSendSelectionValues) selectionValues = transformPluginDataToSelectionValues(pluginValues);
    mainNodeSelectionValues = pluginValues.map((value) => value.tokens);
  }

  const selectedNodes = figma.currentPage.selection.length;

  notifySelection({ selectionValues, mainNodeSelectionValues, selectedNodes });
  return { selectionValues, mainNodeSelectionValues, selectedNodes };
}

export async function removePluginData({ nodes, key, shouldRemoveValues = true }: { nodes: readonly (BaseNode | SceneNode)[], key?: Properties, shouldRemoveValues?: boolean }) {
  return Promise.all(nodes.map(async (node) => {
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
  }));
}

export async function updatePluginData({
  entries, values, shouldOverride = false, shouldRemove = true, tokensMap
}: { entries: readonly NodeManagerNode[], values: NodeTokenRefMap, shouldOverride?: boolean, shouldRemove?: boolean, tokensMap?: Map<string, AnyTokenList[number]> }) {
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
      let newValuesOnNode = {};
      if (values.composition === 'delete') newValuesOnNode = { ...values, ...currentValuesOnNode, composition: 'delete' };
      else newValuesOnNode = { ...currentValuesOnNode, ...values };
      if (currentValuesOnNode.composition) {
        // when select another composition token, reset applied properties by current composition token
        const resolvedToken = tokensMap?.get(currentValuesOnNode.composition);
        let removeProperties: String[] = [];
        if (resolvedToken) {
          if (Array.isArray(resolvedToken.rawValue)) {
            removeProperties = resolvedToken?.rawValue.map((item) => (
              item.property
            ));  
          }
          else {
            removeProperties.push(resolvedToken?.rawValue.property);
          }
        }
        if (removeProperties && removeProperties.length > 0) {
          await Promise.all(removeProperties.map(async (property) => {
            await removePluginData({ nodes: [node], key: property as Properties, shouldRemoveValues: shouldRemove });
          }));  
        }
      }

      await Promise.all(Object.entries(newValuesOnNode).map(async ([key, value]) => {
        if (value === currentValuesOnNode[key] && !shouldOverride) {
          return;
        }

        const jsonValue = JSON.stringify(value);
        switch (value) {
          case 'delete':
            delete newValuesOnNode[key];
            await removePluginData({ nodes: [node], key: key as Properties, shouldRemoveValues: shouldRemove });
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

      const nodeHasNoValues = Object.keys(newValuesOnNode).length === 0 && newValuesOnNode.constructor === Object;
      const editRelaunchData = node.getRelaunchData() as {
        edit?: string
      };

      if (!nodeHasNoValues) {
        const updatedRelaunchData = Object.keys(newValuesOnNode).join(', ');
        if (updatedRelaunchData !== editRelaunchData.edit) {
          node.setRelaunchData({
            edit: updatedRelaunchData,
          });
        }
      } else {
        node.setRelaunchData({});
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
