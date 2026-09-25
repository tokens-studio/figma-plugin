import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { resolveCollectionContext } from './extendedCollections/collectionContext';
import { applyChildModeValue } from './extendedCollections/applyChildModeValue';

export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string, collection?: VariableCollection, forceUpdate = false) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (
      existingVariableValue
      && !(typeof existingVariableValue === 'string' || isVariableWithAliasReference(existingVariableValue))
    ) return;

    // Extended collections: inherit-vs-override decided in one shared place
    const { parentModeId } = resolveCollectionContext(collection, mode);
    if (parentModeId) {
      applyChildModeValue(variable, mode, parentModeId, value);
      return;
    }

    if (forceUpdate || existingVariableValue !== value) {
      variable.setValueForMode(mode, value);
    }
  } catch (e) {
    console.error('Error setting stringVariable', e);
  }
}
