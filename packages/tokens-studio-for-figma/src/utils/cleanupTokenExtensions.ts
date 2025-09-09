/**
 * Removes the 'id' field from studio.tokens extensions if it exists.
 * Also cleans up empty extension objects to keep tokens clean.
 */
export function cleanupTokenExtensions(token: any): any {
  if (!token || typeof token !== 'object') {
    return token;
  }

  // If token doesn't have extensions, return as-is
  if (!token.$extensions || typeof token.$extensions !== 'object') {
    return token;
  }

  // Create a copy to avoid mutating the original
  const cleanedToken = { ...token };
  const extensions = { ...token.$extensions };

  // Check if studio.tokens extension exists
  if (extensions['studio.tokens'] && typeof extensions['studio.tokens'] === 'object') {
    const studioTokens = { ...extensions['studio.tokens'] };

    // Remove the id field if it exists
    if ('id' in studioTokens) {
      delete studioTokens.id;
    }

    // If studio.tokens is now empty, remove it entirely
    if (Object.keys(studioTokens).length === 0) {
      delete extensions['studio.tokens'];
    } else {
      extensions['studio.tokens'] = studioTokens;
    }
  }

  // If extensions is now empty, remove it entirely
  if (Object.keys(extensions).length === 0) {
    delete cleanedToken.$extensions;
  } else {
    cleanedToken.$extensions = extensions;
  }

  return cleanedToken;
}
