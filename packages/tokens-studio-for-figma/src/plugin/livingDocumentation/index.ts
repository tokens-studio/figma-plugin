import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ProgressTracker } from '../ProgressTracker';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { postToUI, trackFromPlugin } from '../notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { createMainContainer } from './frameUtils';
import { filterAndGroupTokens, processTokenSets } from './tokenProcessing';
import { applyTokensToDocumentation } from './applyTokens';

export const createLivingDocumentation: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LIVING_DOCUMENTATION] = async (msg) => {
  const {
    tokenSet, startsWith, applyTokens, resolvedTokens, useUserTemplate,
  } = msg;

  // Filter and group tokens by set
  const tokensBySet = filterAndGroupTokens(resolvedTokens, tokenSet, startsWith);
  const totalTokens = Object.values(tokensBySet).flat().length;

  if (!totalTokens) return;

  // Start the background job
  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.UI_CREATE_LIVING_DOCUMENTATION,
      timePerTask: 0.5, // Estimate 100ms per token
      completedTasks: 0,
      totalTasks: totalTokens,
    },
  });

  // Check if user has selected a template, but only use it if they chose to use their own template
  const [selectedTemplate] = figma.currentPage.selection;
  const hasUserTemplate = selectedTemplate && 'clone' in selectedTemplate;

  // Determine which template to use based on user choice
  let shouldUseUserTemplate = false;
  if (useUserTemplate) {
    if (hasUserTemplate) {
      shouldUseUserTemplate = true;
    } else {
      // User wants to use their own template but has no selection
      figma.notify('Please select a template frame containing layers named with __ prefixes.', { error: true });
      return;
    }
  }

  // Track when living documentation creation actually starts in the plugin with template information
  trackFromPlugin('Living Documentation Creation Started in Plugin', {
    tokenSetChoice: tokenSet === 'All' ? 'ALL' : 'SETS',
    tokenSetCount: tokenSet === 'All' ? Object.keys(resolvedTokens).length : 1,
    startsWithFilled: !!startsWith.trim(),
    applyTokensChecked: applyTokens,
    hasUserTemplate: shouldUseUserTemplate,
    userRequestedOwnTemplate: useUserTemplate,
  });

  // Initialize progress tracker
  const progressTracker = new ProgressTracker(BackgroundJobs.UI_CREATE_LIVING_DOCUMENTATION);

  // Create main container
  const container = await createMainContainer();

  // Process all token sets
  await processTokenSets(tokensBySet, container, progressTracker, shouldUseUserTemplate ? selectedTemplate : null);

  // Add container to page
  figma.currentPage.appendChild(container);

  // Apply tokens to created layers if requested
  if (applyTokens) {
    await applyTokensToDocumentation(container, resolvedTokens);
  }

  // Complete the background job
  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.UI_CREATE_LIVING_DOCUMENTATION,
  });
};
