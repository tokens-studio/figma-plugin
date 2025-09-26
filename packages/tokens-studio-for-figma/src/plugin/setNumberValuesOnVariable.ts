import { isVariableWithAliasReference } from '@/utils/isAliasReference';

// Helper function to check if two numbers are approximately equal within a threshold
function isNumberApproximatelyEqual(
  num1: number,
  num2: number,
  threshold: number = 0.000001,
): boolean {
  return Math.abs(num1 - num2) < threshold;
}

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number) {
  try {
    console.log('🔢 [DEBUG] setNumberValuesOnVariable called:', { variableName: variable.name, mode, value });
    
    if (isNaN(value)) {
      throw new Error(`Skipping due to invalid value: ${value}`);
    }
    
    const existingVariableValue = variable.valuesByMode[mode];
    console.log('🔢 [DEBUG] Existing variable value:', existingVariableValue);
    
    // For new variables, existingVariableValue will be undefined - we should set the value
    if (existingVariableValue === undefined) {
      console.log('🔢 [DEBUG] Setting number value on new variable:', value);
      variable.setValueForMode(mode, value);
      return;
    }
    
    if (!(typeof existingVariableValue === 'number' || isVariableWithAliasReference(existingVariableValue))) {
      console.warn('🔢 [DEBUG] Existing variable value is not a number or alias reference:', existingVariableValue);
      return;
    }

    // For direct number values, compare using threshold
    if (typeof existingVariableValue === 'number') {
      if (isNumberApproximatelyEqual(existingVariableValue, value)) {
        console.log('🔢 [DEBUG] Number values are approximately equal, skipping update');
        // return if values are approximately equal
        return;
      }
    }

    console.log('🔢 [DEBUG] Setting new number value:', value);
    variable.setValueForMode(mode, value);
  } catch (e) {
    console.error('❌ [DEBUG] Error setting numberVariable on variable', variable.name, e);
  }
}
