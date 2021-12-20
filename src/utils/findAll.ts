export function findAll(nodes: readonly BaseNode[]): BaseNode[] {
  let children: BaseNode[] = [];
  nodes.forEach((node) => {
    if ('children' in node) {
      children = children.concat(node.children);
      children = children.concat(findAll(node.children));
    }
  });

  return children;
}
