import { UiSettingsProperty } from '@/figmaStorage';
import { UpdateMode } from '@/constants/UpdateMode';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import { getThemeReferences } from '../asyncMessageHandlers/getThemeReferences';
import { defaultNodeManager } from '../NodeManager';
import { updateNodes } from '../updateNodes';
import { AnyTokenList } from '@/types/tokens';
import { notifyException } from '../notifiers';

export async function applyTokensToDocumentation(
  container: FrameNode,
  resolvedTokens: AnyTokenList,
): Promise<void> {
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
    notifyException('Generation error', {
      title: 'Error applying tokens',
      error,
    });

    console.log('Error applying tokens:', error);
  }
}
