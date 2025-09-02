import { AnyTokenList } from '@/types/tokens';
import { ProgressTracker } from '../ProgressTracker';
import { initializeTemplates, cleanupTemplates } from './templateManagement';
import { createSetStructure } from './containerCreation';
import { processTokenBatch, appendTokenClones } from './tokenProcessing';

/**
 * Filter and group tokens by set, applying proper token set order and alphabetical sorting within sets
 */
export function filterAndGroupTokens(
  resolvedTokens: AnyTokenList,
  tokenSet: string,
  startsWith: string,
): Record<string, any[]> {
  let tokensBySet: Record<string, any[]> = {};

  if (tokenSet === 'All') {
    // Group all matching tokens by their set
    const filteredTokens = resolvedTokens.filter((t) => t.name.startsWith(startsWith));
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
      (t) => t.name.startsWith(startsWith) && (t.internal__Parent === tokenSet || !t.internal__Parent),
    );
    if (filteredTokens.length > 0) {
      tokensBySet[tokenSet] = filteredTokens;
    }
  }

  // Extract the token set order from the resolvedTokens (they should already be ordered correctly by mergeTokenGroups)
  const tokenSetOrder: string[] = [];
  const seenSets = new Set<string>();

  for (const token of resolvedTokens) {
    const setName = token.internal__Parent || 'Default';
    if (!seenSets.has(setName)) {
      tokenSetOrder.push(setName);
      seenSets.add(setName);
    }
  }

  // Sort tokens within each set alphabetically by name
  Object.keys(tokensBySet).forEach((setName) => {
    tokensBySet[setName].sort((a, b) => a.name.localeCompare(b.name));
  });

  // Create the final ordered result using the correct token set order
  const orderedTokensBySet: Record<string, any[]> = {};

  // First, add sets in the order they appear in resolvedTokens (which respects user's token set order)
  for (const setName of tokenSetOrder) {
    if (tokensBySet[setName]) {
      orderedTokensBySet[setName] = tokensBySet[setName];
    }
  }

  // Then add any remaining sets (edge case for sets not in resolvedTokens)
  for (const setName of Object.keys(tokensBySet)) {
    if (!orderedTokensBySet[setName]) {
      orderedTokensBySet[setName] = tokensBySet[setName];
    }
  }

  return orderedTokensBySet;
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
