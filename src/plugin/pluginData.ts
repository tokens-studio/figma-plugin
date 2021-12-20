import store from './store';
import { notifySelection } from './notifiers';
import removeValuesFromNode from './removeValuesFromNode';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { defaultNodeManager } from './NodeManager';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { Properties } from '@/constants/Properties';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';

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

export function removePluginData(nodes: readonly (BaseNode | SceneNode)[], key?: string) {
  nodes.forEach((node) => {
    try {
      node.setRelaunchData({});
    } finally {
      if (key) {
        node.setPluginData(key, '');
        tokensSharedDataHandler.set(node, key, '');
        // TODO: Introduce setting asking user if values should be removed?
        removeValuesFromNode(node, key);
      } else {
        Object.values(Properties).forEach((prop) => {
          node.setPluginData(prop, '');
          tokensSharedDataHandler.set(node, prop, '');
          // TODO: Introduce setting asking user if values should be removed?
          removeValuesFromNode(node, prop);
        });
      }
      node.setPluginData('values', '');
      tokensSharedDataHandler.set(node, SharedPluginDataKeys.tokens.values, '');
      store.successfulNodes.push(node);
    }
  });
}

export async function updatePluginData(nodes: readonly BaseNode[], values: NodeTokenRefMap) {
  const namespace = SharedPluginDataNamespaces.TOKENS;
  const nodesData = await defaultNodeManager.findNodesWithData({ nodes });

  nodes.reduce<Promise<void>>(
    (previous, node) => previous.then(async () => {
      const currentValuesOnNode = nodesData.find((info) => info.id === node.id)?.tokens;
      const newValuesOnNode = Object.assign(currentValuesOnNode || {}, values);
      Object.entries(newValuesOnNode).forEach(([key, value]) => {
        const jsonValue = JSON.stringify(value);

        switch (value) {
          case 'delete':
            delete newValuesOnNode[key];
            removePluginData([node], key);
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
      });
      await defaultNodeManager.updateNode(node, newValuesOnNode);

      try {
        if (node.type !== 'INSTANCE') {
          if (Object.keys(newValuesOnNode).length === 0 && newValuesOnNode.constructor === Object) {
            try {
              node.setRelaunchData({});
            } catch (e) {
              console.error('Updating relaunchData on instance children not supported.');
            }
          } else {
            try {
              node.setRelaunchData({
                edit: Object.keys(newValuesOnNode).join(', '),
              });
            } catch (e) {
              console.error('Updating relaunchData on instance children not supported.');
            }
          }
        }
      } finally {
        node.setPluginData('values', '');
        node.setSharedPluginData(namespace, 'values', '');
      }
    }),
    Promise.resolve(),
  );
}
