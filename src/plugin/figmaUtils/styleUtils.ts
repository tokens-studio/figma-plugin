import { tokensSharedDataHandler } from '../SharedDataHandler';

type StyleTypeName = 'effects' | 'fills' | 'strokes' | 'typography';
type StyleType<T> =
  T extends 'effects' ? EffectStyle :
    T extends 'fills' | 'strokes' ? PaintStyle :
      T extends 'typography' ? TextStyle :
        never;

export function getStyleId(node: BaseNode, key: StyleTypeName) {
  if (key === 'effects' && key in node && typeof node.effectStyleId === 'string') {
    return node.effectStyleId;
  }
  if (key === 'fills' && key in node && typeof node.fillStyleId === 'string') {
    return node.fillStyleId;
  }
  if (key === 'strokes' && key in node && typeof node.strokeStyleId === 'string') {
    return node.strokeStyleId;
  }
  if (key === 'typography' && node.type === 'TEXT' && typeof node.textStyleId === 'string') {
    return node.textStyleId;
  }
  return undefined;
}

function getStyleIdFromBackup(node: BaseNode, backupKey: string) {
  return tokensSharedDataHandler.get(node, backupKey, (val) => {
    if (val) {
      try {
        const parsedValue = JSON.parse(val) as string;
        return parsedValue;
      } catch (e) {
        return val;
      }
    }
    return val;
  });
}

export function getNonLocalStyle<T extends StyleTypeName>(
  node: BaseNode,
  backupKey: string,
  key: T,
): StyleType<T> | undefined {
  let nonLocalStyle: BaseStyle | undefined;
  const styleId = getStyleId(node, key) || getStyleIdFromBackup(node, backupKey);
  if (styleId) {
    const style = figma.getStyleById(styleId);
    if (style?.remote) {
      nonLocalStyle = style;
    }
  }
  return nonLocalStyle as StyleType<T>;
}

export function getLocalStyle<T extends StyleTypeName>(
  node: BaseNode,
  backupKey: string,
  key: T,
): StyleType<T> | undefined {
  const styleId = getStyleId(node, key) || getStyleIdFromBackup(node, backupKey);
  return figma.getStyleById(styleId) as StyleType<T>;
}

export function setStyleIdBackup(node: BaseNode, backupKey: string, styleId: string) {
  // Setting to empty string will delete the plugin data key if the style id doesn't exist:
  tokensSharedDataHandler.set(node, backupKey, styleId ? JSON.stringify(styleId) : '');
}

export function clearStyleIdBackup(node: BaseNode, backupKey: string) {
  // Setting to empty string will delete the plugin data key:
  tokensSharedDataHandler.set(node, backupKey, '');
}
