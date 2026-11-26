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
    const parsed = toFigmaEasing(value);
    if (!parsed) {
      // Surface the actual bad value instead of silently writing linear —
      // otherwise the variable ends up as `cubic-bezier(0,0,1,1)` with no
      // clue in the console. Only fall back to the linear default when the
      // variable has never been written for this mode (Figma requires a
      // value in every mode).
      console.error(
        `Could not parse cubicBezier value for variable ${variable.name} (mode ${mode}):`,
        value,
        `typeof=${typeof value}`,
      );
      const existing = variable.valuesByMode[mode];
      if (existing === undefined) {
        variable.setValueForMode(mode, defaultFigmaEasing());
      }
      return;
    }
    const easing = parsed;
    const existing = variable.valuesByMode[mode];
    if (existing !== undefined && !(typeof existing === 'object' || isVariableWithAliasReference(existing))) return;
    if (!forceUpdate && existing && typeof existing === 'object' && JSON.stringify(existing) === JSON.stringify(easing)) return;
    variable.setValueForMode(mode, easing);
  } catch (e) {
    console.error('Error setting EASING variable', variable.name, e);
  }
}
