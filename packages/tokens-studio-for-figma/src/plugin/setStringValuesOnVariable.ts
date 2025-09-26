import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    console.log('📝 [DEBUG] setStringValuesOnVariable called:', { variableName: variable.name, mode, value });
    
    const existingVariableValue = variable.valuesByMode[mode];
    console.log('📝 [DEBUG] Existing variable value:', existingVariableValue);
    
    // For new variables, existingVariableValue will be undefined - we should set the value
    if (existingVariableValue === undefined) {
      console.log('📝 [DEBUG] Setting string value on new variable:', value);
      variable.setValueForMode(mode, value);
      return;
    }
    
    if (!(typeof existingVariableValue === 'string' || isVariableWithAliasReference(existingVariableValue))) {
      console.warn('📝 [DEBUG] Existing variable value is not a string or alias reference:', existingVariableValue);
      return;
    }

    if (existingVariableValue !== value) {
      console.log('📝 [DEBUG] Setting string value on variable', variable.name, existingVariableValue, value, existingVariableValue === value ? 'match' : 'no match');
      variable.setValueForMode(mode, value);
    } else {
      console.log('📝 [DEBUG] String values are equal, skipping update');
    }
  } catch (e) {
    console.error('❌ [DEBUG] Error setting stringVariable', e);
  }
}
