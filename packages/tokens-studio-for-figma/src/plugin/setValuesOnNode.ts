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
      await applyBorderValuesOnNode(node, data, values, baseFontSize);
      await applyBorderRadiusValuesOnNode(node, data, values, baseFontSize);
      await applyShadowValuesOnNode(node, data, values, baseFontSize);
      await applyBackgroundBlurValuesOnNode(node, data, values, baseFontSize);
      await applyBorderWidthValuesOnNode(node, data, values, baseFontSize);
      await applyOpacityValuesOnNode(node, data, values, baseFontSize);
      await applySizingValuesOnNode(node, data, values, baseFontSize);
      await applySpacingValuesOnNode(node, data, values, baseFontSize);
      await applyRotationValuesOnNode(node, data, values, baseFontSize);
      await applyColorTokenOnNode(node, data, values);
      await applyPositionTokenOnNode(node, data, values, baseFontSize);
      await applyTypographyTokenOnNode(node, data, values, baseFontSize);
      await applyAssetTokenValuesOnNode(node, data, values);
      await applyDimensionTokenValuesOnNode(node, data, values, baseFontSize);
      await applyNumberTokenValuesOnNode(node, data, values, baseFontSize);
      await applyBooleanTokenValuesOnNode(node, data, values);
      await applyTextCharacterValuesOnNode(node, data, values);
    }
  } catch (e) {
    console.log('Error setting data on node', e);
  }
}
