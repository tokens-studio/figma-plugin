import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';

type StyleType = 'fill' | 'text' | 'stroke' | 'effect';

export async function trySetStyleId(node: BaseNode, type: StyleType, styleId: string) {
  const { applyVariablesStylesOrRawValue } = defaultTokenValueRetriever;
  if (applyVariablesStylesOrRawValue !== ApplyVariablesStylesOrRawValues.VARIABLES_STYLES) return false;
  try {
    // @README we need to try and import the style just in case it's a library provided one
    const styleKeyMatch = styleId.match(/^S:([a-zA-Z0-9_-]+),/);
    const actualStyleId = await new Promise<string>((resolve, reject) => {
      const localStyle = figma.getStyleById(styleId);
      if (localStyle) {
        resolve(localStyle.id);
      } else if (styleKeyMatch) {
        figma.importStyleByKeyAsync(styleKeyMatch[1])
          .then((remoteStyle) => resolve(remoteStyle.id))
          .catch(() => {
            reject(styleId);
          });
      }
    });
    if (!actualStyleId) return false;
    if (type === 'fill' && 'fillStyleId' in node) {
      node.fillStyleId = actualStyleId;
      return (
        node.fillStyleId === actualStyleId || (styleKeyMatch && styleKeyMatch[0] === node.fillStyleId)
        // @README the secondary check here is only relevant when both the local and remote styles are available
        // what can happen is that figma applies the local style when we are expecting the remote style to be applied
        // since it exists. Of course applying the local style in this case is completely valid so we should allow a local
        // style to be applied instead
      );
    }

    if (type === 'stroke' && 'strokeStyleId' in node) {
      node.strokeStyleId = actualStyleId;
      return node.strokeStyleId === actualStyleId || (styleKeyMatch && styleKeyMatch[0] === node.strokeStyleId);
    }

    if (type === 'text' && 'textStyleId' in node) {
      node.textStyleId = actualStyleId;
      return node.textStyleId === actualStyleId || (styleKeyMatch && styleKeyMatch[0] === node.textStyleId);
    }

    if (type === 'effect' && 'effectStyleId' in node) {
      node.effectStyleId = actualStyleId;
      return node.effectStyleId === actualStyleId || (styleKeyMatch && styleKeyMatch[0] === node.effectStyleId);
    }
  } catch (e) {
    console.log('Unable to apply style for id', e);
  }
  return false;
}
