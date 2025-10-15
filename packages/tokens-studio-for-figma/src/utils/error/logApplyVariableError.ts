/**
 * Logs errors that occur when applying variables to Figma nodes
 * @param error The error that occurred
 * @param context Additional context about where the error occurred
 */
export function logApplyVariableError(error: unknown, context?: string): void {
  if (context) {
    console.log(`error applying variable (${context}):`, error);
  } else {
    console.log('error', error);
  }
}
