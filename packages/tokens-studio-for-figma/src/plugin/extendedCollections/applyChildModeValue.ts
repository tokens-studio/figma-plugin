import { valuesEquivalent } from './valuesEquivalent';

export type ChildModeWriteResult = 'cleared' | 'set' | 'unchanged';

/**
 * Remove an explicit child-mode override so the mode inherits from its parent.
 *
 * Figma's public Variable API has NO method to clear a single mode value — only
 * setValueForMode. Some enterprise runtimes expose clearValueForMode at runtime;
 * where they do we use it, otherwise we cannot remove an existing override and
 * report that. A variable that never had an explicit child-mode entry is already
 * inherited, so the common case needs no API at all.
 */
function clearChildModeOverride(variable: Variable, childModeId: string): boolean {
  const anyVar = variable as any;
  if (typeof anyVar.clearValueForMode === 'function') {
    anyVar.clearValueForMode(childModeId);
    return true;
  }
  return false;
}

function hasExplicitChildValue(variable: Variable, childModeId: string): boolean {
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
): ChildModeWriteResult {
  const parentValue = variable.valuesByMode[parentModeId];
  const childValue = variable.valuesByMode[childModeId];

  if (valuesEquivalent(desiredValue, parentValue)) {
    // The child should inherit. If it holds no explicit value for this mode it
    // already inherits — do nothing (the common case, and the only correct move
    // when no clear API exists).
    if (!hasExplicitChildValue(variable, childModeId)) {
      return 'unchanged';
    }
    // An explicit override exists. Prefer to remove it so the mode inherits.
    if (clearChildModeOverride(variable, childModeId)) {
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
