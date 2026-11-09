/* eslint-disable no-param-reassign */
import { SingleBorderToken } from '@/types/tokens';
import { isPrimitiveValue } from '@/utils/is';
import { transformValue } from './helpers';
import getFigmaDashPattern from './getFigmaDashPattern';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';

export default async function setBorderValuesOnTarget(
  target: BaseNode,
  token: Pick<SingleBorderToken, 'value'>,
  baseFontSize: string,
  side?: 'top' | 'right' | 'bottom' | 'left',
  widthTokenName?: string,
) {
  const { value } = token;
  const { width, style } = value;
  // Bind side widths to the referenced width token's variable when there is one, otherwise fall back to the raw value
  const widthVariableToken = widthTokenName ?? String(width);
  try {
    if (
      'strokeWeight' in target
      && typeof width !== 'undefined'
      && isPrimitiveValue(width)
      && !side
      && !(await tryApplyVariableId(target, 'strokeWeight', width))
    ) {
      target.strokeWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }
    if (
      'strokeTopWeight' in target
      && typeof width !== 'undefined'
      && isPrimitiveValue(width)
      && side === 'top'
      && !(await tryApplyVariableId(target, 'strokeTopWeight', widthVariableToken))
    ) {
      target.strokeTopWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }
    if (
      'strokeRightWeight' in target
      && typeof width !== 'undefined'
      && isPrimitiveValue(width)
      && side === 'right'
      && !(await tryApplyVariableId(target, 'strokeRightWeight', widthVariableToken))
    ) {
      target.strokeRightWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }
    if (
      'strokeBottomWeight' in target
      && typeof width !== 'undefined'
      && isPrimitiveValue(width)
      && side === 'bottom'
      && !(await tryApplyVariableId(target, 'strokeBottomWeight', widthVariableToken))
    ) {
      target.strokeBottomWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }
    if (
      'strokeLeftWeight' in target
      && typeof width !== 'undefined'
      && isPrimitiveValue(width)
      && side === 'left'
      && !(await tryApplyVariableId(target, 'strokeLeftWeight', widthVariableToken))
    ) {
      target.strokeLeftWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }

    if (typeof style !== 'undefined' && typeof style === 'string' && 'dashPattern' in target) {
      let newDashPattern = [0, 0];
      switch (style) {
        case 'solid':
          newDashPattern = [0, 0];
          break;
        case 'dashed':
          newDashPattern = getFigmaDashPattern(transformValue(String(width), 'borderWidth', baseFontSize));
          break;
        default:
          break;
      }
      target.dashPattern = newDashPattern;
    }
  } catch (e) {
    console.log('error setting border token', e);
  }
}
