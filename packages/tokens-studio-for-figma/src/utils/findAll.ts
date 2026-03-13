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
      const childNodes = node.findAllWithCriteria({
        types: ValidNodeTypes,
        ...pluginDataOptions,
      });

      const filteredChildren = node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
        ? childNodes.filter((child) => child.type !== 'INSTANCE')
        : childNodes;

      allNodes = allNodes.concat(filteredChildren);
    }
  });
  return allNodes;
}
