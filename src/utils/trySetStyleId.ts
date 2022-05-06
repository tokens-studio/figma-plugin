type StyleType = 'fill' | 'text' | 'stroke' | 'effect';

export function trySetStyleId(node: BaseNode, type: StyleType, styleId: string) {
  if (type === 'fill' && 'fillStyleId' in node) {
    node.fillStyleId = styleId;
    return (node.fillStyleId === styleId);
  }

  if (type === 'stroke' && 'strokeStyleId' in node) {
    node.strokeStyleId = styleId;
    return (node.strokeStyleId === styleId);
  }

  if (type === 'text' && 'textStyleId' in node) {
    node.textStyleId = styleId;
    return (node.textStyleId === styleId);
  }

  if (type === 'effect' && 'effectStyleId' in node) {
    node.effectStyleId = styleId;
    return (node.effectStyleId === styleId);
  }

  return false;
}
