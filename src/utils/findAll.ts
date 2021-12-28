export function findAll(nodes: readonly BaseNode[], maxDepth = 1, depth = 1): BaseNode[] {
  let children: BaseNode[] = [];
  nodes.forEach((node) => {
    if ('children' in node) {
      children = children.concat(node.children);
      if (depth < maxDepth) {
        children = children.concat(findAll(node.children, maxDepth, depth + 1));
      }
    }
  });

  return children;
}
