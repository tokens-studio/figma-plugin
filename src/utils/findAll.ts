import { ValidNodeTypes } from '@/constants/ValidNodeTypes';

function isPartOfInstanceOrIsInstance(node: BaseNode): boolean {
  return node.type === 'INSTANCE' || node.id.startsWith('I');
}

export function findAll(nodes: readonly BaseNode[], includeSelf = false, ignoreInstances = false): BaseNode[] {
  let allNodes = includeSelf ? [...nodes] : [];
  nodes.forEach((node) => {
    if ('children' in node) {
      allNodes = allNodes.concat(node.findAllWithCriteria({
        types: ValidNodeTypes,
      }));
    }
  });

  const filteredNodes = ignoreInstances ? allNodes.filter((node) => !isPartOfInstanceOrIsInstance(node)) : allNodes;
  return filteredNodes;
}
