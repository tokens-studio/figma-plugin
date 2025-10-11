/**
 * Utility function to handle 404 errors in a consistent way across storage providers.
 *
 * This function determines whether a 404 error should be treated as a "missing file that should be created"
 * or as a "connection/network error that should be reported to the user".
 *
 * @param error - The error object to check
 * @returns true if this is a missing file error that should allow automatic creation, false otherwise
 */
export function isMissingFileError(error: any): boolean {
  if (!error) {
    return false;
  }

  const is404 = (
    (error as any).status === 404
    || (error as any).response?.status === 404
    || (error as any).cause?.response?.status === 404
  );

  if (!is404) {
    return false;
  }

  // Check if it has specific "Not Found" messages that indicate a missing file
  const hasNotFoundMessage = (
    (error as any).message?.includes('Not Found')
    || (error as any).response?.data?.message?.includes('Not Found')
    || (error as any).cause?.description?.includes('Not Found')
    || String(error).includes('Not Found')
  );

  return hasNotFoundMessage;
}
