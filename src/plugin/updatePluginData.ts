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

export async function updatePluginData({
  entries: nodes, values: tokenValues, shouldOverride = false, shouldRemove = true, tokensMap,
}: { entries: readonly NodeManagerNode[]; values: NodeTokenRefMap; shouldOverride?: boolean; shouldRemove?: boolean; tokensMap?: Map<string, AnyTokenList[number]>; }) {
  // Big O (n * m): (n = amount of nodes, m = amount of applied tokens to the node)
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
  nodes.forEach(({ node, tokens }) => {
    promises.add(defaultWorker.schedule(async () => {
      const figmaNode = figma.getNodeById(node.id);
      if (!figmaNode) {
        console.warn(`Node with ID ${node.id} no longer exists`);
        return;
      }
      const currentValuesOnNode = tokens ?? {};
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
