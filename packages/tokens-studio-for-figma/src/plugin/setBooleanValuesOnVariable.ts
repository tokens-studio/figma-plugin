import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setBooleanValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    console.log('✅ [DEBUG] setBooleanValuesOnVariable called:', { variableName: variable.name, mode, value });
    
    const existingVariableValue = variable.valuesByMode[mode];
    console.log('✅ [DEBUG] Existing variable value:', existingVariableValue);
    
    const newValue = value === 'true';
    console.log('✅ [DEBUG] Parsed boolean value:', newValue);
    
    // For new variables, existingVariableValue will be undefined - we should set the value
    if (existingVariableValue === undefined) {
      console.log('✅ [DEBUG] Setting boolean value on new variable:', newValue);
      variable.setValueForMode(mode, newValue);
      return;
    }
    
    if (!(typeof existingVariableValue === 'boolean' || isVariableWithAliasReference(existingVariableValue))) {
      console.warn('✅ [DEBUG] Existing variable value is not a boolean or alias reference:', existingVariableValue);
      return;
    }

    if (existingVariableValue !== newValue) {
      console.log('✅ [DEBUG] Setting boolean value on variable', variable.name, variable.valuesByMode[mode], newValue);
      variable.setValueForMode(mode, newValue);
    } else {
      console.log('✅ [DEBUG] Boolean values are equal, skipping update');
    }
  } catch (e) {
    console.error('❌ [DEBUG] Error setting booleanVariable', e);
  }
}
