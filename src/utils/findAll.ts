import { ValidNodeTypes } from '@/constants/ValidNodeTypes';

export function findAll(nodes: readonly BaseNode[], includeSelf = false): BaseNode[] {
  let allNodes = includeSelf ? [...nodes] : [];
  nodes.forEach((node) => {
    if ('children' in node) {
      allNodes = allNodes.concat(node.findAllWithCriteria({
        types: ValidNodeTypes,
      }));
    }
  });
  return allNodes;
}
