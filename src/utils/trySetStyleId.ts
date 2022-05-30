type StyleType = 'fill' | 'text' | 'stroke' | 'effect';

export async function trySetStyleId(node: BaseNode, type: StyleType, styleId: string) {
  try {
    let actualStyleId = styleId;

    // @README we need to try and import the style just in case it's a library provided one
    const styleKeyMatch = styleId.match(/^S:([a-zA-Z0-9_-]+),/);
    if (styleKeyMatch) {
      actualStyleId = await new Promise<string>((resolve) => {
        figma.importStyleByKeyAsync(styleKeyMatch[1])
          .then((style) => resolve(style.id))
          .catch(() => resolve(styleId));
      });
    }

    if (type === 'fill' && 'fillStyleId' in node) {
      node.fillStyleId = actualStyleId;
      return (node.fillStyleId === actualStyleId);
    }

    if (type === 'stroke' && 'strokeStyleId' in node) {
      node.strokeStyleId = actualStyleId;
      return (node.strokeStyleId === actualStyleId);
    }

    if (type === 'text' && 'textStyleId' in node) {
      node.textStyleId = actualStyleId;
      return (node.textStyleId === actualStyleId);
    }

    if (type === 'effect' && 'effectStyleId' in node) {
      node.effectStyleId = actualStyleId;
      return (node.effectStyleId === actualStyleId);
    }
  } catch (err) {
    console.error(err);
  }

  return false;
}
