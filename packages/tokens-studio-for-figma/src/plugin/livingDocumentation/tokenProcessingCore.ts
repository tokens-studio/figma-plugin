import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { ProgressTracker } from '../ProgressTracker';
import { defaultWorker } from '../Worker';
import { createTokenTemplate } from './frameUtils';
import {
  getTemplateForTokenType,
  setTemplateForTokenType,
  getTemplatePlaceholders,
  setTemplatePlaceholders,
} from './templateManagement';

/**
 * Apply token data to template placeholders
 */
export function applyTokenDataToTemplate(
  template: any,
  token: any,
): void {
  if ('name' in template && 'appendChild' in template) {
    // Get cached placeholders or create them
    let placeholders = getTemplatePlaceholders(template);

    if (!placeholders) {
      // Cache miss - find and cache placeholders
      const allNodes = template.findAll((_n: any) => true);
      const placeholderNodes = allNodes.filter((n: any) => n.name.startsWith('__'));

      const newPlaceholders = placeholderNodes.map((node: any) => ({
        node,
        prop: node.name.replace(/^__/, ''),
      }));

      setTemplatePlaceholders(template, newPlaceholders);
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

/**
 * Process a single token and return the cloned template
 */
export async function processSingleToken(
  token: any,
  progressTracker: ProgressTracker,
): Promise<any> {
  return defaultWorker.schedule(async () => {
    console.log('Processing token:', token.name);
    try {
      // Get or create template for this token type
      const tokenType = token.type;
      let template = getTemplateForTokenType(tokenType);

      if (!template) {
        template = await createTokenTemplate(tokenType);
        setTemplateForTokenType(tokenType, template);
      }

      // Verify template still exists before cloning
      if (!template || !template.id) {
        console.log('Template not found for token type:', tokenType, 'recreating...');
        template = await createTokenTemplate(tokenType);
        setTemplateForTokenType(tokenType, template);
      }

      const clone = template.clone();
      applyTokenDataToTemplate(clone, token);
      return clone;
    } catch (e) {
      console.log('Error processing token:', token.name, e);
      return null;
    } finally {
      // Update progress
      progressTracker.next();
      progressTracker.reportIfNecessary();
    }
  });
}

/**
 * Process a batch of tokens and return the cloned templates
 */
export async function processTokenBatch(
  batch: any[],
  progressTracker: ProgressTracker,
): Promise<any[]> {
  const promises: Set<Promise<any>> = new Set();

  // Process this batch of tokens
  for (const token of batch) {
    promises.add(processSingleToken(token, progressTracker));
  }

  // Wait for all clones to be created
  const results = await Promise.all(promises);
  promises.clear();

  // Filter out null results (failed tokens)
  return results.filter((result) => result !== null);
}

/**
 * Append token clones to the tokens container
 */
export function appendTokenClones(clones: any[], tokensContainer: FrameNode): void {
  for (const clone of clones) {
    tokensContainer.appendChild(clone as SceneNode);
  }
}
