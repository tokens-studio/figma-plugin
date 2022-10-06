import { createCustomEqual } from 'fast-equals';

// @README fast-equals is roughly 3 times faster than just-compare
export const isEqual = createCustomEqual((defaultOptions) => ({
  areObjectsEqual: (a, b, defaultIsEqual, meta) => {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return defaultOptions.areObjectsEqual(a, b, defaultIsEqual, meta) && (
      defaultOptions.areArraysEqual(keysA, keysB, defaultIsEqual, meta)
    );
  },
}));
