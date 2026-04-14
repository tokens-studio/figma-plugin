import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string, collection?: VariableCollection) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];

    // Handle extended collections: if value matches parent mode, clear override
    const modeObj = collection?.modes.find((m) => m.modeId === mode);
    const parentModeId = (modeObj as any)?.parentModeId;

    if (parentModeId) {
      const parentValue = variable.valuesByMode[parentModeId];
      if (typeof parentValue === 'string') {
        if (parentValue === value) {
          (variable as any).clearValueForMode(mode);
          return;
        }
      }
    }

    if (
      existingVariableValue !== undefined
      && (typeof existingVariableValue === 'string' || isVariableWithAliasReference(existingVariableValue))
    ) {
      if (existingVariableValue === value) {
        return;
      }
    }

    variable.setValueForMode(mode, value);
  } catch (e) {
    console.error('Error setting stringVariable', e);
  }
}
