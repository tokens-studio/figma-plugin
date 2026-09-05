import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { defaultFigmaEasing, timingToSeconds, toFigmaEasing } from './figmaTransforms/motion';

export function setTimingValueOnVariable(variable: Variable, mode: string, value: unknown, forceUpdate = false) {
  try {
    const seconds = timingToSeconds(value);
    if (seconds === null) {
      throw new Error(`Skipping due to invalid TIMING value: ${JSON.stringify(value)}`);
    }
    const existing = variable.valuesByMode[mode];
    if (existing !== undefined && !(typeof existing === 'number' || isVariableWithAliasReference(existing))) return;
    if (!forceUpdate && typeof existing === 'number' && Math.abs(existing - seconds) < 1e-6) return;
    variable.setValueForMode(mode, seconds);
  } catch (e) {
    console.error('Error setting TIMING variable', variable.name, e);
  }
}

export function setEasingValueOnVariable(variable: Variable, mode: string, value: unknown, forceUpdate = false) {
  try {
    const easing = toFigmaEasing(value) ?? defaultFigmaEasing();
    const existing = variable.valuesByMode[mode];
    if (existing !== undefined && !(typeof existing === 'object' || isVariableWithAliasReference(existing))) return;
    if (!forceUpdate && existing && typeof existing === 'object' && JSON.stringify(existing) === JSON.stringify(easing)) return;
    variable.setValueForMode(mode, easing);
  } catch (e) {
    console.error('Error setting EASING variable', variable.name, e);
  }
}
