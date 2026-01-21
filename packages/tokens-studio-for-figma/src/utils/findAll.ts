import { ValidNodeTypes } from '@/constants/ValidNodeTypes';

export function findAll(nodes: readonly BaseNode[], includeSelf = false, nodesWithoutPluginData = false): BaseNode[] {


  const allNodesSet = new Set<BaseNode>(includeSelf ? nodes : []);

  nodes.forEach((node) => {
    if ('children' in node) {
      if (nodesWithoutPluginData) {
        // Smart Discovery: 
        // 1. Find all nodes with local token data (Figma optimized search)
        const withLocalData = node.findAllWithCriteria({
          types: ValidNodeTypes,
          sharedPluginData: { namespace: 'tokens' },
        });
        withLocalData.forEach(n => allNodesSet.add(n));

        // 2. Find all instances (their children have inherited token data)
        const instances = node.findAllWithCriteria({
          types: ['INSTANCE'],
        });
        instances.forEach(instance => {
          allNodesSet.add(instance);
          // For each instance, we must also check all its children
          instance.findAllWithCriteria({
            types: ValidNodeTypes,
          }).forEach(n => allNodesSet.add(n));
        });


      } else {
        // Standard Discovery: Only nodes with local token data
        node.findAllWithCriteria({
          types: ValidNodeTypes,
          sharedPluginData: { namespace: 'tokens' },
        }).forEach(n => allNodesSet.add(n));
      }
    }
  });

  const allNodes = Array.from(allNodesSet);
  return allNodes;
}
