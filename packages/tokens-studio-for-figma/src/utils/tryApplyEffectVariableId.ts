import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';

export async function tryApplyEffectVariableId(effect: Effect, token: string) {
  const { applyVariablesStylesOrRawValue } = defaultTokenValueRetriever;
  if (applyVariablesStylesOrRawValue !== ApplyVariablesStylesOrRawValues.VARIABLES_STYLES) return false;

  const variable = defaultTokenValueRetriever.get(token)?.variableId;

  try {
    return figma.variables.setBoundVariableForEffect(effect, 'color', variable);
  } catch (e) {
    console.log('error', e);
  }
  return false;
}
