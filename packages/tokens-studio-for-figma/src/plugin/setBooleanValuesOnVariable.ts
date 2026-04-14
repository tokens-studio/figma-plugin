import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setBooleanValuesOnVariable(variable: Variable, mode: string, value: string, collection?: VariableCollection) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    const newValue = value === 'true';

    // Handle extended collections: if value matches parent mode, clear override
    const modeObj = collection?.modes.find((m) => m.modeId === mode);
    const parentModeId = (modeObj as any)?.parentModeId;

    if (parentModeId) {
      const parentValue = variable.valuesByMode[parentModeId];
      if (typeof parentValue === 'boolean') {
        if (parentValue === newValue) {
          (variable as any).clearValueForMode(mode);
          return;
        }
      }
    }

    if (
      existingVariableValue !== undefined
      && (typeof existingVariableValue === 'boolean' || isVariableWithAliasReference(existingVariableValue))
    ) {
      if (existingVariableValue === newValue) {
        return;
      }
    }

    variable.setValueForMode(mode, newValue);
  } catch (e) {
    console.error('Error setting booleanVariable', e);
  }
}
