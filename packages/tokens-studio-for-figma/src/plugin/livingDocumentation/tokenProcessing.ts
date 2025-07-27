import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { ProgressTracker } from '../ProgressTracker';
import { defaultWorker } from '../Worker';
import {
  createSetHeading, createSetContainer, createCombinedSetContainer, createTokenTemplate,
} from './frameUtils';
import { AnyTokenList } from '@/types/tokens';

// Cache for template placeholders to avoid repeated DOM queries
const templatePlaceholdersCache = new Map<any, Array<{ node: any; prop: string }>>();

// Cache for templates by token type
const templateCache = new Map<string, any>();

export function filterAndGroupTokens(
  resolvedTokens: AnyTokenList,
  tokenSet: string,
  startsWith: string,
): Record<string, any[]> {
  let tokensBySet: Record<string, any[]> = {};

  if (tokenSet === 'All') {
    // Group all matching tokens by their set
    const filteredTokens = resolvedTokens.filter((t) => t.name.startsWith(startsWith));
    tokensBySet = filteredTokens.reduce((acc, token) => {
      const setName = token.internal__Parent || 'Default';
      if (!acc[setName]) acc[setName] = [];
      acc[setName].push(token);
      return acc;
    }, {} as Record<string, any[]>);
  } else {
    // Use only tokens from the specified set
    const filteredTokens = resolvedTokens.filter((t) => t.name.startsWith(startsWith)
      && (t.internal__Parent === tokenSet || !t.internal__Parent));
    if (filteredTokens.length > 0) {
      tokensBySet[tokenSet] = filteredTokens;
    }
  }

  return tokensBySet;
}

export function applyTokenDataToTemplate(
  template: any,
  token: any,
): void {
  if ('name' in template && 'appendChild' in template) {
    // Get cached placeholders or create them
    let placeholders = templatePlaceholdersCache.get(template);

    if (!placeholders) {
      // Cache miss - find and cache placeholders
      const allNodes = template.findAll((_n: any) => true);
      const placeholderNodes = allNodes.filter((n: any) => n.name.startsWith('__'));

      const newPlaceholders = placeholderNodes.map((node: any) => ({
        node,
        prop: node.name.replace(/^__/, ''),
      }));

      templatePlaceholdersCache.set(template, newPlaceholders);
      placeholders = newPlaceholders;
    }

    // Apply token data to cached placeholders
    const tokenName = JSON.stringify(token.name);
    if (placeholders) {
      placeholders.forEach(({ node, prop }) => {
        node.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, prop, tokenName);
      });
    }
  }
}

export async function processTokenSets(
  tokensBySet: Record<string, any[]>,
  container: FrameNode,
  progressTracker: ProgressTracker,
  userTemplate?: any,
): Promise<void> {
  const BATCH_SIZE = 30; // Match worker pool size

  // Clear caches at the beginning to ensure fresh start
  templatePlaceholdersCache.clear();
  templateCache.clear();

  // If user provided a template, use it for all tokens
  if (userTemplate) {
    // Cache the user template for all token types
    const allTokenTypes = new Set<string>();
    for (const tokens of Object.values(tokensBySet)) {
      for (const token of tokens) {
        allTokenTypes.add(token.type);
      }
    }

    for (const tokenType of allTokenTypes) {
      templateCache.set(tokenType, userTemplate);
    }
  } else {
    // Pre-create all needed templates and cache them
    const allTokenTypes = new Set<string>();
    for (const tokens of Object.values(tokensBySet)) {
      for (const token of tokens) {
        allTokenTypes.add(token.type);
      }
    }

    // Create templates for all token types upfront
    for (const tokenType of allTokenTypes) {
      if (!templateCache.has(tokenType)) {
        const template = await createTokenTemplate(tokenType as any);
        templateCache.set(tokenType, template);
      }
    }
  }

  // Process each set sequentially
  for (const [setName, tokens] of Object.entries(tokensBySet)) {
    // Create combined container for this set (heading + tokens)
    const combinedContainer = await defaultWorker.schedule(async () => {
      try {
        const combinedContainer = createCombinedSetContainer(setName);
        container.appendChild(combinedContainer);
        return combinedContainer;
      } catch (e) {
        console.log('Error creating combined container for set:', setName, e);
        return null;
      }
    });

    // Create heading for this set and append to combined container
    if (combinedContainer) {
      await defaultWorker.schedule(async () => {
        try {
          const heading = await createSetHeading(setName, tokens.length);
          combinedContainer.appendChild(heading);
        } catch (e) {
          console.log('Error creating heading for set:', setName, e);
        }
      });

      // Create tokens container for this set and append to combined container
      const tokensContainer = await defaultWorker.schedule(async () => {
        try {
          const tokenListContainer = createSetContainer(setName);
          combinedContainer.appendChild(tokenListContainer);
          return tokenListContainer;
        } catch (e) {
          console.log('Error creating tokens container for set:', setName, e);
          return null;
        }
      });

      // Process tokens in batches within this set (only if container was created successfully)
      if (tokensContainer) {
        for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
          const batch = tokens.slice(i, i + BATCH_SIZE);
          const promises: Set<Promise<void>> = new Set();

          // Process this batch of tokens
          const batchClones: any[] = [];

          for (const token of batch) {
            promises.add(
              defaultWorker.schedule(async () => {
                console.log('Processing token:', token.name);
                try {
                  // Get or create template for this token type
                  const tokenType = token.type;
                  let template = templateCache.get(tokenType);

                  if (!template) {
                    template = await createTokenTemplate(tokenType);
                    templateCache.set(tokenType, template);
                  }

                  // Verify template still exists before cloning
                  if (!template || !template.id) {
                    console.log('Template not found for token type:', tokenType, 'recreating...');
                    template = await createTokenTemplate(tokenType);
                    templateCache.set(tokenType, template);
                  }

                  const clone = template.clone();
                  applyTokenDataToTemplate(clone, token);
                  batchClones.push(clone);
                } catch (e) {
                  console.log('Error processing token:', token.name, e);
                } finally {
                  // Update progress
                  progressTracker.next();
                  progressTracker.reportIfNecessary();
                }
              }),
            );
          }

          // Wait for all clones to be created
          await Promise.all(promises);
          promises.clear();

          // Append all clones to container
          for (const clone of batchClones) {
            tokensContainer.appendChild(clone as SceneNode);
          }

          console.log('BATCH COMPLETED batch:', batch.length);
        }
      }
    }
  }

  // Clear caches after processing is complete
  templatePlaceholdersCache.clear();

  // Clean up templates from document (but not user template)
  for (const template of templateCache.values()) {
    if (template && template.parent && template !== userTemplate) {
      template.remove();
    }
  }
  templateCache.clear();
}
