import { SingleTypographyToken } from '@/types/tokens';
import { setTextValuesOnTarget } from './setTextValuesOnTarget';
import { getTextStylesIdMap } from '@/utils/getTextStylesIdMap';
import { getTextStylesKeyMap } from '@/utils/getTextStylesKeyMap';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { processBatches } from '@/utils/processBatches';

// Iterate over colorTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateTextStyles(textTokens: SingleTypographyToken<true, { path: string, styleId: string }>[], baseFontSize: string, shouldCreate = false, shouldRename = false) {
  // Iterate over textTokens to create objects that match figma styles
  const textStylesToIdMap = getTextStylesIdMap();
  const textStylesToKeyMap = getTextStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  // Start progress tracking
  if (textTokens.length > 10) {
    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.UI_CREATE_STYLES,
        timePerTask: 100, // Estimate 100ms per token
        totalTasks: textTokens.length,
        completedTasks: 0,
      },
    });
  }

  // Process tokens in batches of 50 to avoid overwhelming memory and API limits
  await processBatches(textTokens, 50, async (token) => {
    if (textStylesToIdMap.has(token.styleId)) {
      const textStyle = textStylesToIdMap.get(token.styleId)!;
      if (shouldRename) {
        textStyle.name = token.path;
      }
      tokenToStyleMap[token.name] = textStyle.id;
      await setTextValuesOnTarget(textStyle, token.name, baseFontSize);
    } else if (textStylesToKeyMap.has(token.path)) {
      const textStyle = textStylesToKeyMap.get(token.path)!;
      tokenToStyleMap[token.name] = textStyle.id;
      await setTextValuesOnTarget(textStyle, token.name, baseFontSize);
    } else if (shouldCreate) {
      const style = figma.createTextStyle();
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;
      await setTextValuesOnTarget(style, token.name, baseFontSize);
    }
  }, textTokens.length > 10 ? (completed: number) => {
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
      name: BackgroundJobs.UI_CREATE_STYLES,
      count: completed,
      timePerTask: 100,
    });
  } : undefined);

  // Complete progress tracking
  if (textTokens.length > 10) {
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.UI_CREATE_STYLES,
    });
  }

  return tokenToStyleMap;
}
