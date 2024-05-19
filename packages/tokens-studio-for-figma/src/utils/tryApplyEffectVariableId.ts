import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';

export async function tryApplyEffectVariableId(effect: Effect, token: string) {
  const { shouldApplyVariables } = defaultTokenValueRetriever;
  if (!shouldApplyVariables) return false;

  const variable = defaultTokenValueRetriever.get(token)?.variableId;

  try {
    return figma.variables.setBoundVariableForEffect(effect, 'color', variable);
  } catch (e) {
    console.log('error', e);
  }
  return false;
}
