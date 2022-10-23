import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { Properties } from '@/constants/Properties';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { findAll } from '@/utils/findAll';
import { convertFigmaColorToHex } from '../figmaTransforms/colors';
import { defaultNodeManager, NodeManagerNode } from '../NodeManager';

const namespace = SharedPluginDataNamespaces.TOKENS;

const getNameForValue = (value: string | number) => String(value).split('.').join(',');

// if we have a cacheNode detect if there's a token applied
const isNotAppliedAsTokenYet = (key: string, cacheNode?: NodeManagerNode): boolean => (cacheNode ? Boolean(cacheNode && !(key in cacheNode.tokens)) : true);

const setTokenOnLayer = async (layer: BaseNode, key: string, token: string): Promise<void> => {
  console.log('setTokenOnLayer', namespace, key, `'${token}'`);
  layer.setSharedPluginData(namespace, key, `"${token}"`);
};

const getFill = (node: BaseNode, shouldApply: boolean, cacheNode?: NodeManagerNode): any => {
  if (!('fills' in node)) {
    console.log('returning early');

    return [];
  }
  console.log('evaluating fill', node.fills !== figma.mixed && node.fills.length === 1 && node.fills[0].type === 'SOLID' && isNotAppliedAsTokenYet(Properties.fill, cacheNode));
  if (node.fills !== figma.mixed && node.fills.length === 1 && node.fills[0].type === 'SOLID' && isNotAppliedAsTokenYet(Properties.fill, cacheNode)) {
    console.log('returning fill', shouldApply, node.fills);
    if (shouldApply) setTokenOnLayer(node, Properties.fill, `color.${convertFigmaColorToHex(node.fills[0].color)}`);
    return node.fills;
  }

  return [];
};

const getRadius = (node: BaseNode, shouldApply: boolean, cacheNode?: NodeManagerNode): number[] | null => {
  const allRadii: number[] = [];

  if ('cornerRadius' in node && node.cornerRadius !== figma.mixed) {
    if (typeof node.cornerRadius === 'number' && isNotAppliedAsTokenYet(Properties.borderRadius, cacheNode)) {
      if (shouldApply) setTokenOnLayer(node, Properties.borderRadius, `radius.${getNameForValue(node.cornerRadius)}`);
      allRadii.push(node.cornerRadius);
    }
  } else {
    if ('topLeftRadius' in node) {
      if (isNotAppliedAsTokenYet(Properties.borderRadiusTopLeft, cacheNode)) {
        if (shouldApply) setTokenOnLayer(node, Properties.borderRadiusTopLeft, `radius.${getNameForValue(node.topLeftRadius)}`);
        allRadii.push(node.topLeftRadius);
      }
    }
    if ('topRightRadius' in node) {
      if (isNotAppliedAsTokenYet(Properties.borderRadiusTopRight, cacheNode)) {
        if (shouldApply) setTokenOnLayer(node, Properties.borderRadiusTopRight, `radius.${getNameForValue(node.topRightRadius)}`);
        allRadii.push(node.topRightRadius);
      }
    }
    if ('bottomRightRadius' in node) {
      if (isNotAppliedAsTokenYet(Properties.borderRadiusBottomRight, cacheNode)) {
        if (shouldApply) setTokenOnLayer(node, Properties.borderRadiusBottomRight, `radius.${getNameForValue(node.bottomRightRadius)}`);
        allRadii.push(node.bottomRightRadius);
      }
    }
    if ('bottomLeftRadius' in node) {
      if (isNotAppliedAsTokenYet(Properties.borderRadiusBottomLeft, cacheNode)) {
        if (shouldApply) setTokenOnLayer(node, Properties.borderRadiusBottomLeft, `radius.${getNameForValue(node.bottomLeftRadius)}`);
        allRadii.push(node.bottomLeftRadius);
      }
    }
  }

  if (allRadii) return allRadii;
  return null;
};

function isAutoLayoutNode(node: BaseNode) {
  return 'paddingLeft' in node && 'paddingRight' in node && 'paddingTop' in node && 'paddingBottom' in node;
}

const getDimensions = (node: BaseNode, shouldApply: boolean, cacheNode?: NodeManagerNode): number[] => {
  if (!isAutoLayoutNode(node)) {
    return [];
  }
  const allDimensions = [];
  if ('layoutMode' in node && node.layoutMode === 'NONE') {
    return [];
  }

  if ('itemSpacing' in node && isNotAppliedAsTokenYet(Properties.itemSpacing, cacheNode)) {
    if (shouldApply) setTokenOnLayer(node, Properties.itemSpacing, `dimension.${getNameForValue(node.itemSpacing)}`);
    allDimensions.push(node.itemSpacing);
  }
  if (('paddingLeft' in node && 'paddingRight' in node && 'paddingTop' in node && 'paddingBottom' in node) && [node.paddingLeft, node.paddingRight, node.paddingTop, node.paddingBottom].every((val) => val === node.paddingLeft)) {
    if (shouldApply) setTokenOnLayer(node, Properties.spacing, `dimension.${getNameForValue(node.paddingLeft)}`);
    allDimensions.push(node.paddingLeft);
  } else {
    if ('paddingLeft' in node && isNotAppliedAsTokenYet(Properties.paddingLeft, cacheNode)) {
      if (shouldApply) setTokenOnLayer(node, Properties.paddingLeft, `dimension.${getNameForValue(node.paddingLeft)}`);
      allDimensions.push(node.paddingLeft);
    }
    if ('paddingRight' in node && isNotAppliedAsTokenYet(Properties.paddingRight, cacheNode)) {
      if (shouldApply) setTokenOnLayer(node, Properties.paddingRight, `dimension.${getNameForValue(node.paddingRight)}`);
      allDimensions.push(node.paddingRight);
    }
    if ('paddingTop' in node && isNotAppliedAsTokenYet(Properties.paddingTop, cacheNode)) {
      if (shouldApply) setTokenOnLayer(node, Properties.paddingTop, `dimension.${getNameForValue(node.paddingTop)}`);
      allDimensions.push(node.paddingTop);
    }
    if ('paddingBottom' in node && isNotAppliedAsTokenYet(Properties.paddingBottom, cacheNode)) {
      if (shouldApply) setTokenOnLayer(node, Properties.paddingBottom, `dimension.${getNameForValue(node.paddingBottom)}`);
      allDimensions.push(node.paddingBottom);
    }
  }
  return allDimensions;
};

const getUniqueValues = async (layers: BaseNode[], shouldApply = false): Promise<AnyTokenList> => {
  console.log('all layers', layers);

  const values: SingleToken[] = [];
  await Promise.all(layers.map(async (layer) => {
    const currentNode = await defaultNodeManager.getNode(layer.id);

    const fill = getFill(layer, shouldApply, currentNode);
    if (fill) {
      fill.forEach((f: Paint) => {
        if (f.type === 'SOLID') {
          values.push({
            name: 'color',
            value: convertFigmaColorToHex(f.color),
            type: TokenTypes.COLOR,
          });
        }
      });
    }
    const radius = getRadius(layer, shouldApply, currentNode);

    if (radius) {
      radius.forEach((r: number) => {
        values.push({
          name: 'radius',
          value: r.toString(),
          type: TokenTypes.BORDER_RADIUS,
        });
      });
    }
    const dimensions = getDimensions(layer, shouldApply, currentNode);
    if (dimensions) {
      dimensions.forEach((s: number) => {
        values.push({
          name: 'dimension',
          value: s.toString(),
          type: TokenTypes.SPACING,
        });
      });
    }
    return layer;
  }));

  // remove duplicates
  console.log('values', values);

  return values.filter((v, i, a) => a.findIndex((t) => (t.name === v.name && t.value === v.value)) === i);
};

const sortAndNameUniqueValues = (values: SingleToken[]): AnyTokenList => {
  const sortedValues = values.sort((a, b) => {
    if (Number(a.value) < Number(b.value)) return -1;
    if (Number(a.value) > Number(b.value)) return 1;
    return 0;
  });

  return sortedValues.map((v) => {
    const name = `${v.name}.${getNameForValue(v.value as string | number)}`;
    return { ...v, name };
  });
};

const splitUniquesIntoTypes = (values: SingleToken[]): { [key: string]: AnyTokenList } => {
  const types: { [key: string]: AnyTokenList } = {};
  values.forEach((v) => {
    if (!types[v.type]) {
      types[v.type] = [];
    }
    types[v.type].push(v);
  });
  return types;
};

export const extractTokensFromSelection: AsyncMessageChannelHandlers[AsyncMessageTypes.EXTRACT_TOKENS_FROM_SELECTION] = async (props) => {
  const layers = findAll(figma.currentPage.selection, true);

  const allUniqueValues = await getUniqueValues(layers, props.applyTokens);

  const uniquesByType = await splitUniquesIntoTypes(allUniqueValues);

  const sortedAndNamedUniques = Object.entries(uniquesByType).reduce((acc: { [key: string]: SingleToken[] }, [key, val]) => {
    acc[key] = sortAndNameUniqueValues(val);
    return acc;
  }, {});

  await defaultNodeManager.update(layers);

  return {
    uniqueValues: sortedAndNamedUniques,
  };
};
