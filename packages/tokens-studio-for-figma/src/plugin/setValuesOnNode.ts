import { Properties } from '@/constants/Properties';
import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';
import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { applyAssetTokenValuesOnNode } from './applyAssetTokenValuesOnNode';
import { applyBackgroundBlurValuesOnNode } from './applyBackgroundBlurValuesOnNode';
import { applyBooleanTokenValuesOnNode } from './applyBooleanTokenValuesOnNode';
import { applyBorderRadiusValuesOnNode } from './applyBorderRadiusValuesOnNode';
import { applyBorderValuesOnNode } from './applyBorderValuesOnNode';
import { applyBorderWidthValuesOnNode } from './applyBorderWidthValuesOnNode';
import { applyColorTokenOnNode } from './applyColorTokenOnNode';
import { applyDimensionTokenValuesOnNode } from './applyDimensionTokenValuesOnNode';
import { applyNumberTokenValuesOnNode } from './applyNumberTokenValuesOnNode';
import { applyOpacityValuesOnNode } from './applyOpacityValuesOnNode';
import { applyPositionTokenOnNode } from './applyPositionTokenOnNode';
import { applyRotationValuesOnNode } from './applyRotationValuesOnNode';
import { applySizingValuesOnNode } from './applySizingValuesOnNode';
import { applySpacingValuesOnNode } from './applySpacingValuesOnNode';
import { applyTextCharacterValuesOnNode } from './applyTextCharacterValuesOnNode';
import { applyTypographyTokenOnNode } from './applyTypographyTokenOnNode';
import { applyShadowValuesOnNode } from './applyShadowValuesOnNode';
import removeValuesFromNode from './removeValuesFromNode';

// Various logic to apply token values to nodes
// Node
export default async function setValuesOnNode({
  node,
  values,
  data,
  baseFontSize = defaultBaseFontSize,
}: {
  node: BaseNode; // The node to apply on
  values: MapValuesToTokensResult; // The actual values we'd apply
  data: NodeTokenRefMap; // Data on which token to apply, this is what's stored on the layer (just the token name)
  baseFontSize?: string; // The base font size to use, note that we should find a better way to pass this through
}) {
  console.log('Data is', data);
  console.log('Values is', values);
  try {
    if (
      node.type !== 'CONNECTOR'
      && node.type !== 'SHAPE_WITH_TEXT'
      && node.type !== 'STICKY'
      && node.type !== 'CODE_BLOCK'
    ) {
      Object.entries(values).forEach(([key, value]) => {
        if (value === 'none') {
          removeValuesFromNode(node, key as Properties);
          delete values[key];
        }
      });
      applyBorderValuesOnNode(node, data, values, baseFontSize);
      applyBorderRadiusValuesOnNode(node, data, values, baseFontSize);
      applyShadowValuesOnNode(node, data, values, baseFontSize);
      applyBackgroundBlurValuesOnNode(node, data, values, baseFontSize);
      applyBorderWidthValuesOnNode(node, data, values, baseFontSize);
      applyOpacityValuesOnNode(node, data, values, baseFontSize);
      applySizingValuesOnNode(node, data, values, baseFontSize);
      applySpacingValuesOnNode(node, data, values, baseFontSize);
      applyRotationValuesOnNode(node, data, values, baseFontSize);
      applyColorTokenOnNode(node, data, values);
      applyPositionTokenOnNode(node, data, values, baseFontSize);
      applyTypographyTokenOnNode(node, data, values, baseFontSize);
      applyAssetTokenValuesOnNode(node, values, data, baseFontSize);
      applyDimensionTokenValuesOnNode(node, values, data, baseFontSize);
      applyNumberTokenValuesOnNode(node, values, data, baseFontSize);
      applyBooleanTokenValuesOnNode(node, values, data, baseFontSize);
      applyTextCharacterValuesOnNode(node, values, data);
    }
  } catch (e) {
    console.log('Error setting data on node', e);
  }
}
