import { isVariableWithAliasReference } from '@/utils/isAliasReference';

// Helper function to check if two numbers are approximately equal within a threshold
function isNumberApproximatelyEqual(
  num1: number,
  num2: number,
  threshold: number = 0.000001,
): boolean {
  return Math.abs(num1 - num2) < threshold;
}

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number, collection?: VariableCollection) {
  try {
    if (isNaN(value)) {
      throw new Error(`Skipping due to invalid value: ${value}`);
    }
    const existingVariableValue = variable.valuesByMode[mode];

    // Handle extended collections: if value matches parent mode, clear override
    const modeObj = collection?.modes.find((m) => m.modeId === mode);
    const parentModeId = (modeObj as any)?.parentModeId;

    if (parentModeId) {
      const parentValue = variable.valuesByMode[parentModeId];
      if (typeof parentValue === 'number') {
        if (isNumberApproximatelyEqual(parentValue, value)) {
          (variable as any).clearValueForMode(mode);
          return;
        }
      }
    }

    if (
      existingVariableValue !== undefined
      && (typeof existingVariableValue === 'number' || isVariableWithAliasReference(existingVariableValue))
    ) {
      // For direct number values, compare using threshold
      if (typeof existingVariableValue === 'number') {
        if (isNumberApproximatelyEqual(existingVariableValue, value)) {
          // return if values are approximately equal
          return;
        }
      }
    }

    variable.setValueForMode(mode, value);
  } catch (e) {
    console.error('Error setting numberVariable on variable', variable.name, e);
  }
}
