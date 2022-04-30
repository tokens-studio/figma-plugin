export function attemptOrFallback<R>(fn: () => R, fallback: R) {
  try {
    return fn();
  } catch (err) {
    console.error(err);
    return fallback;
  }
}
