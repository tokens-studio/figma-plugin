import { valuesEquivalent } from './valuesEquivalent';

export type ChildModeWriteResult = 'cleared' | 'set' | 'unchanged';

type ExtendedCollectionLike = {
  variableOverrides?: Record<string, Record<string, VariableValue>>;
  removeOverridesForVariable?: (variable: Variable) => void;
};

function getCollectionOverrides(
  collection: VariableCollection | null | undefined,
  variable: Variable,
): Record<string, VariableValue> | undefined {
  return (collection as unknown as ExtendedCollectionLike | null | undefined)?.variableOverrides?.[variable.id];
}

/**
 * Remove an explicit child-mode override so the mode inherits from its parent.
 *
 * Figma's documented way to clear overrides is
 * ExtendedVariableCollection.removeOverridesForVariable, which drops the overrides
 * for EVERY mode of the child collection. Overrides held by the other modes are
 * snapshotted first and written back. Some runtimes also expose
 * Variable.clearValueForMode, which we prefer when present.
 */
function clearChildModeOverride(
  variable: Variable,
  childModeId: string,
  collection?: VariableCollection | null,
): boolean {
  const anyVar = variable as any;
  if (typeof anyVar.clearValueForMode === 'function') {
    anyVar.clearValueForMode(childModeId);
    return true;
  }

  const extended = collection as unknown as ExtendedCollectionLike | null | undefined;
  if (typeof extended?.removeOverridesForVariable === 'function') {
    const overrides = getCollectionOverrides(collection, variable) ?? {};
    const keep = Object.entries(overrides).filter(([modeId]) => modeId !== childModeId);
    extended.removeOverridesForVariable(variable);
    keep.forEach(([modeId, value]) => variable.setValueForMode(modeId, value));
    return true;
  }
  return false;
}

function hasExplicitChildValue(
  variable: Variable,
  childModeId: string,
  collection?: VariableCollection | null,
): boolean {
  const overrides = getCollectionOverrides(collection, variable);
  if (overrides && Object.prototype.hasOwnProperty.call(overrides, childModeId)) return true;
  return Object.prototype.hasOwnProperty.call(variable.valuesByMode, childModeId);
}

/**
 * The single decision point for writing a value to an extended-collection
 * child mode. Compares the desired value against the parent mode's value:
 *
 * - equivalent to parent  → clearValueForMode (inherit; white dot in Figma).
 *   Runs even when the child already holds the desired value explicitly, so
 *   stale overrides from earlier runs self-heal on every export.
 * - different from parent → setValueForMode (explicit override; blue dot),
 *   skipped when the child mode already holds an equivalent explicit value.
 *
 * IMPORTANT: only call this after the parent mode's value is final for this
 * export — comparing against a parent that is still being written produces
 * spurious overrides.
 */
export function applyChildModeValue(
  variable: Variable,
  childModeId: string,
  parentModeId: string,
  desiredValue: VariableValue,
  collection?: VariableCollection | null,
): ChildModeWriteResult {
  const parentValue = variable.valuesByMode[parentModeId];
  const childValue = getCollectionOverrides(collection, variable)?.[childModeId]
    ?? variable.valuesByMode[childModeId];

  if (valuesEquivalent(desiredValue, parentValue)) {
    // The child should inherit. If it holds no explicit value for this mode it
    // already inherits — do nothing (the common case, and the only correct move
    // when no clear API exists).
    if (!hasExplicitChildValue(variable, childModeId, collection)) {
      return 'unchanged';
    }
    // An explicit override exists. Prefer to remove it so the mode inherits.
    if (clearChildModeOverride(variable, childModeId, collection)) {
      return 'cleared';
    }
    // No clear API in this runtime. We cannot restore true inheritance, but a
    // stale override that already equals the desired value is at least correct;
    // one that differs (e.g. a leftover raw value from a previous export) must be
    // overwritten with the desired value so it stops showing the wrong value.
    if (valuesEquivalent(desiredValue, childValue)) {
      return 'unchanged';
    }
    variable.setValueForMode(childModeId, desiredValue);
    return 'set';
  }

  if (valuesEquivalent(desiredValue, childValue)) {
    return 'unchanged';
  }

  variable.setValueForMode(childModeId, desiredValue);
  return 'set';
}
