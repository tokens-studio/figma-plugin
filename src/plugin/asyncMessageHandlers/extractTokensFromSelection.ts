import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { findAll } from '@/utils/findAll';
import { convertFigmaColorToHex } from '../figmaTransforms/colors';

const getFill = (node: BaseNode): any => {
  if ('fills' in node && node.fills !== figma.mixed && node.fills.length === 1 && node.fills[0].type === 'SOLID') {
    return node.fills;
  }
  return [];
};
const getRadius = (node: BaseNode): any => {
  const allRadii = [];

  if ('cornerRadius' in node && node.cornerRadius !== figma.mixed) {
    allRadii.push(node.cornerRadius);
  }
  if ('topLeftRadius' in node) {
    allRadii.push(node.topLeftRadius);
    allRadii.push(node.topRightRadius);
    allRadii.push(node.bottomLeftRadius);
    allRadii.push(node.bottomRightRadius);
  }
  return allRadii;
};

const getDimensions = (node: BaseNode): number[] => {
  const allDimensions = [];

  if ('itemSpacing' in node) {
    allDimensions.push(node.itemSpacing);
  }
  if ('paddingLeft' in node) {
    allDimensions.push(node.paddingLeft);
    allDimensions.push(node.paddingRight);
    allDimensions.push(node.paddingTop);
    allDimensions.push(node.paddingBottom);
  }
  return allDimensions;
};

const getUniqueValues = (layers: BaseNode[]): AnyTokenList => {
  const values: SingleToken[] = [];
  layers.forEach((layer) => {
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
    const radius = getRadius(layer);
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
  const allUniqueValues = getUniqueValues(allLayers);
  const uniquesByType = splitUniquesIntoTypes(allUniqueValues);
  const sortedAndNamedUniques = Object.entries(uniquesByType).reduce((acc: { [key: string]: SingleToken[] }, [key, val]) => {
    acc[key] = sortAndNameUniqueValues(val);
    return acc;
  }, {});

  console.log('Layers', allLayers);
  console.log('Uniques', sortedAndNamedUniques);

  return {
    uniqueValues: sortedAndNamedUniques,
  };
};
