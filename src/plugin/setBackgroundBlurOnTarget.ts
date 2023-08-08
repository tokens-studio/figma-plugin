import { SingleDimensionToken } from '@/types/tokens';
import { transformValue } from './helpers';
import { notifyException } from './notifiers';

export default function setBackgroundBlurOnTarget(
  target: BaseNode | EffectStyle,
  token: Pick<SingleDimensionToken, 'value'>,
  baseFontSize: string,
) {
  try {
    if ('effects' in target) {
      const existingEffectIndex = target.effects.findIndex((effect) => effect.type === 'BACKGROUND_BLUR');
      let newEffects = [...target.effects];
      const blurEffect: BlurEffect = {
        type: 'BACKGROUND_BLUR',
        visible: true,
        radius: transformValue(String(token.value), 'backgroundBlur', baseFontSize),
      };

      if (existingEffectIndex > -1) {
        newEffects = Object.assign([], target.effects, { [existingEffectIndex]: blurEffect });
      } else {
        newEffects.push(blurEffect);
      }
      target.effects = newEffects;
    }
  } catch (e) {
    notifyException('Error setting backgroundBlur on target', { code: e });
    console.error('Error setting color', e);
  }
}
