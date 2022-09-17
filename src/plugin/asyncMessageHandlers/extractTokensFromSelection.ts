import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { Properties } from '@/constants/Properties';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { findAll } from '@/utils/findAll';
import { convertFigmaColorToHex } from '../figmaTransforms/colors';
import { defaultNodeManager } from '../NodeManager';

const namespace = SharedPluginDataNamespaces.TOKENS;

const setTokenOnLayer = async (layer: BaseNode, key: string, token: string): Promise<void> => {
  console.log('setTokenOnLayer', namespace, key, `'${token}'`);
  layer.setSharedPluginData(namespace, key, `"${token}"`);
};

const getFill = (node: BaseNode): any => {
  if ('fills' in node && node.fills !== figma.mixed && node.fills.length === 1 && node.fills[0].type === 'SOLID') {
    return node.fills;
  }
  return [];
};
const getRadius = async (node: BaseNode): Promise<number[] | null> => {
  const allRadii: number[] = [];

  if ('cornerRadius' in node && node.cornerRadius !== figma.mixed && node.cornerRadius) {
    const existing = await defaultNodeManager.getNode(node.id);
    console.log('existing', existing);

    setTokenOnLayer(node, Properties.borderRadius, `radius.${node.cornerRadius}`);
    allRadii.push(node.cornerRadius);
  } else {
    if ('topLeftRadius' in node) {
      setTokenOnLayer(node, Properties.borderRadiusTopLeft, `radius.${node.topLeftRadius}`);
      allRadii.push(node.topLeftRadius);
    }
    if ('topRightRadius' in node) {
      setTokenOnLayer(node, Properties.borderRadiusTopRight, `radius.${node.topRightRadius}`);
      allRadii.push(node.topRightRadius);
    }
    if ('bottomRightRadius' in node) {
      setTokenOnLayer(node, Properties.borderRadiusBottomRight, `radius.${node.bottomRightRadius}`);
      allRadii.push(node.bottomRightRadius);
    }
    if ('bottomLeftRadius' in node) {
      setTokenOnLayer(node, Properties.borderRadiusBottomLeft, `radius.${node.bottomLeftRadius}`);
      allRadii.push(node.bottomLeftRadius);
    }
  }

  if (allRadii) return allRadii;
  return null;
};

const getDimensions = (node: BaseNode): number[] => {
  const allDimensions = [];

  if ('itemSpacing' in node) {
    setTokenOnLayer(node, Properties.itemSpacing, `dimension.${node.itemSpacing}`);
    allDimensions.push(node.itemSpacing);
  }
  if ('paddingLeft' in node) {
    setTokenOnLayer(node, Properties.paddingLeft, `dimension.${node.paddingLeft}`);
    allDimensions.push(node.paddingLeft);
  }
  if ('paddingRight' in node) {
    setTokenOnLayer(node, Properties.paddingRight, `dimension.${node.paddingRight}`);
    allDimensions.push(node.paddingRight);
  }
  if ('paddingTop' in node) {
    setTokenOnLayer(node, Properties.paddingTop, `dimension.${node.paddingTop}`);
    allDimensions.push(node.paddingTop);
  }
  if ('paddingBottom' in node) {
    setTokenOnLayer(node, Properties.paddingBottom, `dimension.${node.paddingBottom}`);
    allDimensions.push(node.paddingBottom);
  }
  return allDimensions;
};

const getUniqueValues = async (layers: BaseNode[]): Promise<AnyTokenList> => {
  const values: SingleToken[] = [];
  layers.forEach(async (layer) => {
    const fill = getFill(layer);
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
    const radius = await getRadius(layer);
    if (radius) {
      radius.forEach((r: number) => {
        values.push({
          name: 'radius',
          value: r.toString(),
          type: TokenTypes.BORDER_RADIUS,
        });
      });
    }
    const dimensions = getDimensions(layer);
    if (dimensions) {
      dimensions.forEach((s: number) => {
        values.push({
          name: 'dimension',
          value: s.toString(),
          type: TokenTypes.SPACING,
        });
      });
    }
  });

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
  const allLayers = findAll(figma.currentPage.selection, true);
  const allUniqueValues = await getUniqueValues(allLayers);
  const uniquesByType = await splitUniquesIntoTypes(allUniqueValues);
  const sortedAndNamedUniques = Object.entries(uniquesByType).reduce((acc: { [key: string]: SingleToken[] }, [key, val]) => {
    acc[key] = sortAndNameUniqueValues(val);
    return acc;
  }, {});

  console.log('Layers', allLayers);
  console.log('Uniques', sortedAndNamedUniques);

  await defaultNodeManager.update(figma.currentPage.selection);

  return {
    uniqueValues: sortedAndNamedUniques,
  };
};
