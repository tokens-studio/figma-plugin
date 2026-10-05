import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { resolveCollectionContext } from './extendedCollections/collectionContext';
import { applyChildModeValue } from './extendedCollections/applyChildModeValue';

// Helper function to check if two numbers are approximately equal within a threshold
function isNumberApproximatelyEqual(
  num1: number,
  num2: number,
  threshold: number = 0.000001,
): boolean {
  return Math.abs(num1 - num2) < threshold;
}

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number, collection?: VariableCollection, forceUpdate = false) {
  try {
    if (isNaN(value)) {
      throw new Error(`Skipping due to invalid value: ${value}`);
    }
    const existingVariableValue = variable.valuesByMode[mode];

    if (
      existingVariableValue !== undefined
      && !(typeof existingVariableValue === 'number' || isVariableWithAliasReference(existingVariableValue))
    ) return;

    // Extended collections: inherit-vs-override decided in one shared place
    const { parentModeId } = resolveCollectionContext(collection, mode);
    if (parentModeId) {
      applyChildModeValue(variable, mode, parentModeId, value);
      return;
    }

    // For direct number values, compare using threshold
    if (typeof existingVariableValue === 'number') {
      if (!forceUpdate && isNumberApproximatelyEqual(existingVariableValue, value)) {
        // return if values are approximately equal and not forcing update
        return;
      }
    }

    variable.setValueForMode(mode, value);
  } catch (e) {
    console.error('Error setting numberVariable on variable', variable.name, e);
  }
}
