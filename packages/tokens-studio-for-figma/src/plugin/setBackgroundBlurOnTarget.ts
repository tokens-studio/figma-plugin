import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { SingleDimensionToken } from '@/types/tokens';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { transformValue } from './helpers';

export default async function setBackgroundBlurOnTarget(
  target: BaseNode | EffectStyle,
  token: Pick<SingleDimensionToken, 'value'>,
  baseFontSize?: string,
  tokenName?: string,
) {
  try {
    if ('effects' in target) {
      const existingEffectIndex = target.effects.findIndex((effect) => effect.type === 'BACKGROUND_BLUR');
      let newEffects = [...target.effects];
      // @ts-ignore TODO: Update typings
      let blurEffect: BlurEffect = {
        type: 'BACKGROUND_BLUR',
        visible: true,
        radius: transformValue(String(token.value), 'backgroundBlur', baseFontSize ?? ''),
      };

      if (tokenName && defaultTokenValueRetriever.applyVariablesStylesOrRawValue === ApplyVariablesStylesOrRawValues.VARIABLES_STYLES) {
        try {
          const variable = await defaultTokenValueRetriever.getVariableReference(tokenName);
          if (variable) {
            const updatedEffect = figma.variables.setBoundVariableForEffect(blurEffect, 'radius' as VariableBindableEffectField, variable);
            // ShaderEffect (added in newer plugin-typings) has no boundVariables;
            // every other Effect variant does. Narrow both sides before spreading.
            if ('boundVariables' in updatedEffect && 'boundVariables' in blurEffect) {
              blurEffect = {
                ...blurEffect,
                boundVariables: updatedEffect.boundVariables,
              } as typeof blurEffect;
            }
          }
        } catch (e) {
          console.error('Error binding variable to background blur', e);
        }
      }

      if (existingEffectIndex > -1) {
        newEffects = Object.assign([], target.effects, { [existingEffectIndex]: blurEffect });
      } else {
        newEffects.push(blurEffect);
      }
      target.effects = newEffects;
    }
  } catch (e) {
    console.error('Error setting color', e);
  }
}
