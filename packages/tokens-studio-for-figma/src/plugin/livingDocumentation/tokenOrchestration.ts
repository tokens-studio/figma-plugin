import { AnyTokenList } from '@/types/tokens';
import { ProgressTracker } from '../ProgressTracker';
import { initializeTemplates, cleanupTemplates } from './templateManagement';
import { createSetStructure } from './containerCreation';
import { processTokenBatch, appendTokenClones } from './tokenProcessing';

/**
 * Filter and group tokens by set
 */
export function filterAndGroupTokens(
  resolvedTokens: AnyTokenList,
  tokenSet: string,
  startsWith: string,
  useRegex?: boolean,
): Record<string, any[]> {
  let tokensBySet: Record<string, any[]> = {};

  // Helper function to test if a token name matches the pattern
  const matchesPattern = (tokenName: string): boolean => {
    if (!startsWith) return true; // Empty pattern matches all

    if (useRegex) {
      try {
        const regex = new RegExp(startsWith);
        return regex.test(tokenName);
      } catch (e) {
        // If regex is invalid, fall back to startsWith
        return tokenName.startsWith(startsWith);
      }
    } else {
      return tokenName.startsWith(startsWith);
    }
  };

  if (tokenSet === 'All') {
    // Group all matching tokens by their set
    const filteredTokens = resolvedTokens.filter((t) => matchesPattern(t.name));
    tokensBySet = filteredTokens.reduce(
      (acc, token) => {
        const setName = token.internal__Parent || 'Default';
        if (!acc[setName]) acc[setName] = [];
        acc[setName].push(token);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  } else {
    // Use only tokens from the specified set
    const filteredTokens = resolvedTokens.filter(
      (t) => matchesPattern(t.name) && (t.internal__Parent === tokenSet || !t.internal__Parent),
    );
    if (filteredTokens.length > 0) {
      tokensBySet[tokenSet] = filteredTokens;
    }
  }

  return tokensBySet;
}

/**
 * Main function to process token sets and create living documentation
 */
export async function processTokenSets(
  tokensBySet: Record<string, any[]>,
  container: FrameNode,
  progressTracker: ProgressTracker,
  userTemplate?: any,
): Promise<void> {
  const BATCH_SIZE = 30; // Match worker pool size

  // Initialize templates based on user template or create type-specific ones
  await initializeTemplates(tokensBySet, userTemplate);

  // Process each set sequentially
  for (const [setName, tokens] of Object.entries(tokensBySet)) {
    // Create the complete structure for this set
    const { tokensContainer } = await createSetStructure(setName, tokens, container, !!userTemplate);

    // Process tokens in batches within this set (only if container was created successfully)
    if (tokensContainer) {
      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        const batch = tokens.slice(i, i + BATCH_SIZE);

        // Process this batch of tokens
        const batchClones = await processTokenBatch(batch, progressTracker);

        // Append all clones to container
        appendTokenClones(batchClones, tokensContainer);

        console.log('BATCH COMPLETED batch:', batch.length);
      }
    }
  }

  // Clean up templates after processing is complete
  cleanupTemplates(userTemplate);
}
