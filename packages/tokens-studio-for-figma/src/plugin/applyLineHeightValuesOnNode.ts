import { isPrimitiveValue, isSingleTypographyValue } from '@/utils/is';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import { textStyleMatchesTypographyToken } from './figmaUtils/styleMatchers';
import { setTextValuesOnTarget } from './setTextValuesOnTarget';
import { trySetStyleId } from '@/utils/trySetStyleId';
import { transformValue } from './helpers';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { MapValuesToTokensResult } from '@/types';

export async function applyLineHeightValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  console.log('data in applyLineHeight: ', data);
  console.log('values in applyLineHeight: ', values);
  if (typeof values.lineHeight !== 'undefined') {
    const transformedValue = transformValue(String(values.lineHeight), 'lineHeight', baseFontSize);
  }
}
