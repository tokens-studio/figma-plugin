import { valuesEquivalent } from './valuesEquivalent';

export type ChildModeWriteResult = 'cleared' | 'set' | 'unchanged';

/**
 * What to do when the desired value equals the parent's value and the child mode
 * holds an explicit override:
 * - 'clear': remove the override so the mode inherits. Only safe once the parent's
 *   value is final for this export (the alias-linking pass).
 * - 'overwrite': write the desired value explicitly. Used by the raw-value pass,
 *   where the parent may still hold a temporary raw value that the alias pass
 *   replaces later, so clearing could leave the child inheriting the wrong value.
 * - 'keep': leave the override alone. Used by single-token edits, which write the
 *   edited set's value to every theme without knowing whether a higher-precedence
 *   set (e.g. a brand set) overrides the token in this child theme.
 */
export type InheritBehavior = 'clear' | 'overwrite' | 'keep';

function getOverridesForVariable(
  collection: VariableCollection | null | undefined,
  variable: Variable,
): Record<string, VariableValue> | undefined {
  // isExtension isn't reliably exposed on existing collections, so check for the field itself
  if (!collection || !('variableOverrides' in collection)) return undefined;
  return (collection as ExtendedVariableCollection).variableOverrides?.[variable.id];
}

/**
 * The single decision point for writing a value to an extended-collection
 * child mode. Compares the desired value against the parent mode's value:
 *
 * - equivalent to parent → the child should inherit; an existing override is
 *   handled according to `inheritBehavior`.
 * - different from parent → setValueForMode (explicit override), skipped when the
 *   child mode already holds an equivalent explicit value.
 */
export function applyChildModeValue(
  variable: Variable,
  childModeId: string,
  parentModeId: string,
  desiredValue: VariableValue,
  collection?: VariableCollection | null,
  inheritBehavior: InheritBehavior = 'overwrite',
): ChildModeWriteResult {
  const parentValue = variable.valuesByMode[parentModeId];
  const overrides = getOverridesForVariable(collection, variable);
  const hasOverride = overrides
    ? Object.prototype.hasOwnProperty.call(overrides, childModeId)
    : Object.prototype.hasOwnProperty.call(variable.valuesByMode, childModeId);
  const childValue = overrides?.[childModeId] ?? variable.valuesByMode[childModeId];

  if (valuesEquivalent(desiredValue, parentValue)) {
    if (!hasOverride || inheritBehavior === 'keep') {
      return 'unchanged';
    }
    if (inheritBehavior === 'clear' && typeof variable.removeOverrideForMode === 'function') {
      variable.removeOverrideForMode(childModeId);
      return 'cleared';
    }
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
