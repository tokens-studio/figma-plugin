import { defaultWorker } from '../Worker';
import {
  createSetHeading as createSetHeadingFrame,
  createSetContainer,
  createCombinedSetContainer,
  createColumnHeaders,
} from './frameUtils';

/**
 * Create combined container for a set (heading + tokens)
 */
export async function createCombinedContainer(setName: string, container: FrameNode): Promise<FrameNode | null> {
  return defaultWorker.schedule(async () => {
    try {
      const combinedContainer = createCombinedSetContainer(setName);
      container.appendChild(combinedContainer);
      return combinedContainer;
    } catch (e) {
      console.log('Error creating combined container for set:', setName, e);
      return null;
    }
  });
}

/**
 * Create and append heading for a set
 */
export async function createAndAppendSetHeading(
  setName: string,
  tokenCount: number,
  combinedContainer: FrameNode,
): Promise<void> {
  await defaultWorker.schedule(async () => {
    try {
      const heading = await createSetHeadingFrame(setName, tokenCount);
      combinedContainer.appendChild(heading);
    } catch (e) {
      console.log('Error creating heading for set:', setName, e);
    }
  });
}

/**
 * Create and append tokens container for a set
 */
export async function createTokensContainer(setName: string, combinedContainer: FrameNode): Promise<FrameNode | null> {
  return defaultWorker.schedule(async () => {
    try {
      const tokenListContainer = createSetContainer(setName);
      combinedContainer.appendChild(tokenListContainer);
      return tokenListContainer;
    } catch (e) {
      console.log('Error creating tokens container for set:', setName, e);
      return null;
    }
  });
}

/**
 * Create the complete structure for a token set (container, heading, tokens container)
 */
export async function createSetStructure(
  setName: string,
  tokens: any[],
  container: FrameNode,
  hasUserTemplate: boolean = false,
): Promise<{ combinedContainer: FrameNode | null; tokensContainer: FrameNode | null }> {
  // Create combined container for this set (heading + tokens)
  const combinedContainer = await createCombinedContainer(setName, container);

  if (!combinedContainer) {
    return { combinedContainer: null, tokensContainer: null };
  }

  // Create heading for this set and append to combined container
  await createAndAppendSetHeading(setName, tokens.length, combinedContainer);

  // Add column headers after the heading (only if no user template)
  if (!hasUserTemplate) {
    const columnHeaders = await createColumnHeaders();
    combinedContainer.appendChild(columnHeaders);
  }

  // Create tokens container for this set and append to combined container
  const tokensContainer = await createTokensContainer(setName, combinedContainer);

  return { combinedContainer, tokensContainer };
}
