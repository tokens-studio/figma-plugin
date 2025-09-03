import { SingleColorToken } from '@/types/tokens';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import { getPaintStylesIdMap } from '@/utils/getPaintStylesIdMap';
import { getPaintStylesKeyMap } from '@/utils/getPaintStylesKeyMap';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { processBatches } from '@/utils/processBatches';

// Iterate over colorTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateColorStyles(colorTokens: SingleColorToken<true, { path: string, styleId: string }>[], shouldCreate = false, shouldRename = false) {
  const paintToIdMap = getPaintStylesIdMap();
  const paintToKeyMap = getPaintStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  // Start progress tracking
  if (colorTokens.length > 10) {
    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.UI_CREATE_STYLES,
        timePerTask: 50, // Estimate 50ms per color token (faster than typography)
        totalTasks: colorTokens.length,
        completedTasks: 0,
      },
    });
  }

  // Process tokens in batches of 50 to avoid overwhelming memory and API limits
  await processBatches(colorTokens, 50, async (token) => {
    if (paintToIdMap.has(token.styleId)) {
      const paint = paintToIdMap.get(token.styleId)!;
      if (shouldRename) {
        paint.name = token.path;
      }
      tokenToStyleMap[token.name] = paint.id;
      await setColorValuesOnTarget({ target: paint, token: token.name, key: 'paints' });
    } else if (paintToKeyMap.has(token.path)) {
      const paint = paintToKeyMap.get(token.path)!;
      tokenToStyleMap[token.name] = paint.id;
      await setColorValuesOnTarget({ target: paint, token: token.name, key: 'paints' });
    } else if (shouldCreate) {
      const style = figma.createPaintStyle();
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;
      await setColorValuesOnTarget({ target: style, token: token.name, key: 'paints' });
    }
  }, colorTokens.length > 10 ? (completed: number) => {
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
      name: BackgroundJobs.UI_CREATE_STYLES,
      count: completed,
      timePerTask: 50,
    });
  } : undefined);

  // Complete progress tracking
  if (colorTokens.length > 10) {
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.UI_CREATE_STYLES,
    });
  }
  return tokenToStyleMap;
}
