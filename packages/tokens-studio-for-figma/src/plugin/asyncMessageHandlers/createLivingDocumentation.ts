import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { UiSettingsProperty } from '@/figmaStorage';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { ProgressTracker } from '../ProgressTracker';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { defaultWorker } from '../Worker';
import { postToUI } from '../notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { defaultNodeManager } from '../NodeManager';
import { updateNodes } from '../updateNodes';
import { UpdateMode } from '@/constants/UpdateMode';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import { getThemeReferences } from './getThemeReferences';

async function createDefaultTemplate(): Promise<FrameNode> {
  // Load default font first
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const frame = figma.createFrame();
  frame.name = 'Token Template';
  frame.layoutMode = 'HORIZONTAL';
  frame.itemSpacing = 16;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.paddingLeft = 16;
  frame.paddingRight = 16;
  frame.paddingTop = 16;
  frame.paddingBottom = 16;
  frame.cornerRadius = 3;
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // White background

  // Create fill rectangle
  const fillRect = figma.createRectangle();
  fillRect.name = '__fill';
  fillRect.resize(16, 16);
  fillRect.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }]; // Gray placeholder
  frame.appendChild(fillRect);

  // Create token name text
  const tokenNameText = figma.createText();
  tokenNameText.name = '__tokenName';
  tokenNameText.fontName = { family: 'Inter', style: 'Regular' };
  tokenNameText.characters = 'Token Name';
  tokenNameText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; // Black text
  frame.appendChild(tokenNameText);

  // Create token value text
  const tokenValueText = figma.createText();
  tokenValueText.name = '__tokenValue';
  tokenValueText.fontName = { family: 'Inter', style: 'Regular' };
  tokenValueText.characters = 'Token Value';
  tokenValueText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; // Black text
  frame.appendChild(tokenValueText);

  return frame;
}

export const createLivingDocumentation: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LIVING_DOCUMENTATION] = async (msg) => {
  const {
    tokenSet, startsWith, applyTokens, resolvedTokens,
  } = msg;

  // Filter the resolved tokens based on the requested criteria
  let allTokens: any[] = [];
  if (tokenSet === 'All') {
    // Use all resolved tokens that match the startsWith filter
    allTokens = resolvedTokens.filter((t) => t.name.startsWith(startsWith));
  } else {
    // Use only tokens from the specified set that match the startsWith filter
    allTokens = resolvedTokens.filter((t) => t.name.startsWith(startsWith)
      && (t.internal__Parent === tokenSet || !t.internal__Parent));
  }

  console.log('allTokens', allTokens);

  if (!allTokens.length) return;

  // Start the background job
  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.UI_CREATE_LIVING_DOCUMENTATION,
      timePerTask: 100, // Estimate 100ms per token
      completedTasks: 0,
      totalTasks: allTokens.length,
    },
  });

  // Initialize progress tracker
  const progressTracker = new ProgressTracker(BackgroundJobs.UI_CREATE_LIVING_DOCUMENTATION);

  // Check if user has selected a template, if not create default
  let template: any;
  let isGeneratedTemplate = false;
  const [selectedTemplate] = figma.currentPage.selection;

  if (!selectedTemplate || !('clone' in selectedTemplate)) {
    // Create default template
    template = await createDefaultTemplate();
    isGeneratedTemplate = true;
  } else {
    template = selectedTemplate;
  }

  const container = figma.createFrame();
  container.layoutMode = 'VERTICAL';
  container.itemSpacing = 16;
  container.primaryAxisSizingMode = 'AUTO';
  container.counterAxisSizingMode = 'AUTO';
  container.paddingLeft = 32;
  container.paddingRight = 32;
  container.paddingTop = 32;
  container.paddingBottom = 32;

  // Use worker to schedule each token processing
  const promises: Set<Promise<void>> = new Set();

  allTokens.forEach((token) => {
    promises.add(
      defaultWorker.schedule(async () => {
        try {
          const clone = template.clone();
          if ('name' in clone && 'appendChild' in clone) {
            console.log('cloning', token.name);

            const allNodes = clone.findAll((_n) => true);

            const placeholders = allNodes.filter((n) => n.name.startsWith('__'));
            // Now apply changes to all placeholders
            placeholders.forEach((node) => {
              const prop = node.name.replace(/^__/, '');
              console.log('applying', prop, token.name, 'to node:', node.name);

              node.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, prop, JSON.stringify(token.name));
            });
            container.appendChild(clone as SceneNode);
          }
        } catch (e) {
          console.log('Error processing token:', token.name, e);
        } finally {
          // Update progress
          progressTracker.next();
          progressTracker.reportIfNecessary();
        }
      }),
    );
  });

  // Wait for all tokens to be processed
  await Promise.all(promises);

  figma.currentPage.appendChild(container);

  // Remove the generated template if we created one
  if (isGeneratedTemplate) {
    template.remove();
  }

  // Apply tokens to created layers if requested
  if (applyTokens) {
    try {
      // Get current UI settings for token application
      const uiSettings = await UiSettingsProperty.read(figma.root);

      // Get theme references using the UI settings
      const { figmaVariableReferences, figmaStyleReferences, stylePathPrefix } = await getThemeReferences(
        uiSettings?.prefixStylesWithThemeName ?? false,
      );

      // Use the already resolved tokens that were passed in
      defaultTokenValueRetriever.initiate({
        tokens: resolvedTokens,
        variableReferences: figmaVariableReferences,
        styleReferences: figmaStyleReferences,
        stylePathPrefix,
        ignoreFirstPartForStyles: uiSettings?.ignoreFirstPartForStyles ?? false,
        createStylesWithVariableReferences: uiSettings?.createStylesWithVariableReferences ?? false,
        applyVariablesStylesOrRawValue:
            uiSettings?.applyVariablesStylesOrRawValue || ApplyVariablesStylesOrRawValues.RAW_VALUES,
      });

      // Select the container to apply tokens to all child nodes
      figma.currentPage.selection = [container];

      // Find all nodes with token data in the selection
      const nodesWithData = await defaultNodeManager.findBaseNodesWithData({
        updateMode: UpdateMode.SELECTION,
      });

      if (nodesWithData.length > 0) {
        // Apply tokens using the current settings
        await updateNodes(nodesWithData, String(uiSettings?.baseFontSize || 16));
      }
    } catch (error) {
      console.log('Error applying tokens:', error);
    }
  }

  // Complete the background job
  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.UI_CREATE_LIVING_DOCUMENTATION,
  });
};
