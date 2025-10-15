import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';
import { logApplyVariableError } from './error/logApplyVariableError';

export async function tryApplyEffectVariableId(effect: Effect, token: string) {
  const { applyVariablesStylesOrRawValue } = defaultTokenValueRetriever;
  if (applyVariablesStylesOrRawValue !== ApplyVariablesStylesOrRawValues.VARIABLES_STYLES) return false;

  const variable = defaultTokenValueRetriever.get(token)?.variableId;

  try {
    return figma.variables.setBoundVariableForEffect(effect, 'color', variable);
  } catch (e) {
    logApplyVariableError(e);
  }
  return false;
}
