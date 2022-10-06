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

const isNotAppliedAsTokenYet = (key: string, cacheNode?: NodeManagerNode): boolean => (Boolean(cacheNode && !(key in cacheNode.tokens)));

const setTokenOnLayer = async (layer: BaseNode, key: string, token: string): Promise<void> => {
  console.log('setTokenOnLayer', namespace, key, `'${token}'`);
  layer.setSharedPluginData(namespace, key, `"${token}"`);
};

const getFill = (node: BaseNode, cacheNode?: NodeManagerNode): any => {
  if ('fills' in node && node.fills !== figma.mixed && node.fills.length === 1 && node.fills[0].type === 'SOLID' && isNotAppliedAsTokenYet(Properties.fill, cacheNode)) {
    return node.fills;
  }
  return [];
};

const getRadius = (node: BaseNode, cacheNode?: NodeManagerNode): number[] | null => {
  const allRadii: number[] = [];

  console.log('Current node', cacheNode);

  if ('cornerRadius' in node && node.cornerRadius !== figma.mixed && node.cornerRadius) {
    if (isNotAppliedAsTokenYet(Properties.borderRadius, cacheNode)) {
      setTokenOnLayer(node, Properties.borderRadius, `radius.${node.cornerRadius}`);
      allRadii.push(node.cornerRadius);
    }
  } else {
    if ('topLeftRadius' in node) {
      if (isNotAppliedAsTokenYet(Properties.borderRadiusTopLeft, cacheNode)) {
        setTokenOnLayer(node, Properties.borderRadiusTopLeft, `radius.${node.topLeftRadius}`);
        allRadii.push(node.topLeftRadius);
      }
    }
    if ('topRightRadius' in node) {
      if (isNotAppliedAsTokenYet(Properties.borderRadiusTopRight, cacheNode)) {
        setTokenOnLayer(node, Properties.borderRadiusTopRight, `radius.${node.topRightRadius}`);
        allRadii.push(node.topRightRadius);
      }
    }
    if ('bottomRightRadius' in node) {
      if (isNotAppliedAsTokenYet(Properties.borderRadiusBottomRight, cacheNode)) {
        setTokenOnLayer(node, Properties.borderRadiusBottomRight, `radius.${node.bottomRightRadius}`);
        allRadii.push(node.bottomRightRadius);
      }
    }
    if ('bottomLeftRadius' in node) {
      if (isNotAppliedAsTokenYet(Properties.borderRadiusBottomLeft, cacheNode)) {
        setTokenOnLayer(node, Properties.borderRadiusBottomLeft, `radius.${node.bottomLeftRadius}`);
        allRadii.push(node.bottomLeftRadius);
      }
    }
  }

  if (allRadii) return allRadii;
  return null;
};

const getDimensions = (node: BaseNode, cacheNode?: NodeManagerNode): number[] => {
  const allDimensions = [];
  if ('layoutMode' in node && node.layoutMode === 'NONE') {
    return [];
  }

  if ('itemSpacing' in node && isNotAppliedAsTokenYet(Properties.itemSpacing, cacheNode)) {
    setTokenOnLayer(node, Properties.itemSpacing, `dimension.${node.itemSpacing}`);
    allDimensions.push(node.itemSpacing);
  }
  if ('paddingLeft' in node && isNotAppliedAsTokenYet(Properties.paddingLeft, cacheNode)) {
    setTokenOnLayer(node, Properties.paddingLeft, `dimension.${node.paddingLeft}`);
    allDimensions.push(node.paddingLeft);
  }
  if ('paddingRight' in node && isNotAppliedAsTokenYet(Properties.paddingRight, cacheNode)) {
    setTokenOnLayer(node, Properties.paddingRight, `dimension.${node.paddingRight}`);
    allDimensions.push(node.paddingRight);
  }
  if ('paddingTop' in node && isNotAppliedAsTokenYet(Properties.paddingTop, cacheNode)) {
    setTokenOnLayer(node, Properties.paddingTop, `dimension.${node.paddingTop}`);
    allDimensions.push(node.paddingTop);
  }
  if ('paddingBottom' in node && isNotAppliedAsTokenYet(Properties.paddingBottom, cacheNode)) {
    setTokenOnLayer(node, Properties.paddingBottom, `dimension.${node.paddingBottom}`);
    allDimensions.push(node.paddingBottom);
  }
  return allDimensions;
};

const getUniqueValues = async (): Promise<AnyTokenList> => {
  const layers = findAll(figma.currentPage.selection, true);

  const values: SingleToken[] = [];
  await Promise.all(layers.map(async (layer) => {
    const currentNode = await defaultNodeManager.getNode(layer.id);

    const fill = getFill(layer, currentNode);
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
    const radius = getRadius(layer, currentNode);

    if (radius) {
      radius.forEach((r: number) => {
        values.push({
          name: 'radius',
          value: r.toString(),
          type: TokenTypes.BORDER_RADIUS,
        });
      });
    }
    const dimensions = getDimensions(layer, currentNode);
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
  return values.filter((v, i, a) => a.findIndex((t) => (t.name === v.name && t.value === v.value)) === i);
};

const sortAndNameUniqueValues = (values: SingleToken[]): AnyTokenList => {
  const sortedValues = values.sort((a, b) => {
    if (Number(a.value) < Number(b.value)) return -1;
    if (Number(a.value) > Number(b.value)) return 1;
    return 0;
  });

  return sortedValues.map((v) => {
    const name = `${v.name}.${v.value}`;
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

export const extractTokensFromSelection: AsyncMessageChannelHandlers[AsyncMessageTypes.EXTRACT_TOKENS_FROM_SELECTION] = async () => {
  const allUniqueValues = await getUniqueValues();
  console.log('all uniq', allUniqueValues);

  const uniquesByType = await splitUniquesIntoTypes(allUniqueValues);

  console.log('uniques by type', uniquesByType);
  const sortedAndNamedUniques = Object.entries(uniquesByType).reduce((acc: { [key: string]: SingleToken[] }, [key, val]) => {
    acc[key] = sortAndNameUniqueValues(val);
    return acc;
  }, {});
  console.log('sorted and named', sortedAndNamedUniques);

  await defaultNodeManager.update(figma.currentPage.selection);

  return {
    uniqueValues: sortedAndNamedUniques,
  };
};
