import { tokensSharedDataHandler } from '../SharedDataHandler';

export function getStyleId(node: BaseNode, backupKey: string, key: 'effects' | 'fills' | 'strokes' | 'typography') {
  let styleId = '';
  if (key === 'effects' && key in node && typeof node.effectStyleId === 'string') {
    styleId = node.effectStyleId;
  }
  if (key === 'fills' && key in node && typeof node.fillStyleId === 'string') {
    styleId = node.fillStyleId;
  }
  if (key === 'strokes' && key in node && typeof node.strokeStyleId === 'string') {
    styleId = node.strokeStyleId;
  }
  if (key === 'typography' && node.type === 'TEXT' && typeof node.textStyleId === 'string') {
    styleId = node.textStyleId;
  }

  if (styleId === '') {
    styleId = tokensSharedDataHandler.get(node, backupKey, (val) => (val ? (JSON.parse(val) as string) : val));
  }
  return styleId;
}
