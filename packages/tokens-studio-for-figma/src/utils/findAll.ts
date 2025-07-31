import { ValidNodeTypes } from '@/constants/ValidNodeTypes';

export function findAll(nodes: readonly BaseNode[], includeSelf = false, nodesWithoutPluginData = false): BaseNode[] {
  let allNodes = includeSelf ? [...nodes] : [];
  const pluginDataOptions = nodesWithoutPluginData
    ? {}
    : {
      sharedPluginData: {
        namespace: 'tokens',
      },
    };
  nodes.forEach((node) => {
    if ('children' in node) {
      allNodes = allNodes.concat(
        node.findAllWithCriteria({
          types: ValidNodeTypes,
          ...pluginDataOptions,
        }),
      );
    }
  });
  return allNodes;
}
