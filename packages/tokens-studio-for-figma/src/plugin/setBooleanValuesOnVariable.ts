import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { resolveCollectionContext } from './extendedCollections/collectionContext';
import { applyChildModeValue } from './extendedCollections/applyChildModeValue';

export default function setBooleanValuesOnVariable(variable: Variable, mode: string, value: string, collection?: VariableCollection, forceUpdate = false) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (
      existingVariableValue !== undefined
      && !(typeof existingVariableValue === 'boolean' || isVariableWithAliasReference(existingVariableValue))
    ) return;

    const newValue = value === 'true';

    // Extended collections: inherit-vs-override decided in one shared place
    const { parentModeId } = resolveCollectionContext(collection, mode);
    if (parentModeId) {
      applyChildModeValue(variable, mode, parentModeId, newValue);
      return;
    }

    if (forceUpdate || existingVariableValue !== newValue) {
      variable.setValueForMode(mode, newValue);
    }
  } catch (e) {
    console.error('Error setting booleanVariable', e);
  }
}
