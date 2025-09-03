import { SingleBoxShadowToken } from '@/types/tokens';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import { getEffectStylesIdMap } from '@/utils/getEffectStylesIdMap';
import { getEffectStylesKeyMap } from '@/utils/getEffectStylesKeyMap';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { processBatches } from '@/utils/processBatches';

// Iterate over effectTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateEffectStyles({
  effectTokens,
  baseFontSize,
  shouldCreate = false,
  shouldRename = false,
}: {
  effectTokens: SingleBoxShadowToken<true, { path: string; styleId: string }>[];
  baseFontSize: string;
  shouldCreate?: boolean;
  shouldRename?: boolean;
}) {
  const effectStylesToIdMap = getEffectStylesIdMap();
  const effectStylesToKeyMap = getEffectStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  // Start progress tracking
  if (effectTokens.length > 10) {
    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.UI_CREATE_STYLES,
        timePerTask: 75, // Estimate 75ms per effect token (between color and typography)
        totalTasks: effectTokens.length,
        completedTasks: 0,
      },
    });
  }

  // Process tokens in batches of 50 to avoid overwhelming memory and API limits
  await processBatches(effectTokens, 50, async (token) => {
    if (effectStylesToIdMap.has(token.styleId)) {
      const effectStyle = effectStylesToIdMap.get(token.styleId)!;
      if (shouldRename) {
        effectStyle.name = token.path;
      }
      tokenToStyleMap[token.name] = effectStyle.id;
      await setEffectValuesOnTarget(effectStyle, token.name, baseFontSize);
    } else if (effectStylesToKeyMap.has(token.path)) {
      const effectStyle = effectStylesToKeyMap.get(token.path)!;
      tokenToStyleMap[token.name] = effectStyle.id;

      await setEffectValuesOnTarget(effectStyle, token.name, baseFontSize);
    } else if (shouldCreate) {
      const style = figma.createEffectStyle();
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;

      await setEffectValuesOnTarget(style, token.name, baseFontSize);
    }
  }, effectTokens.length > 10 ? (completed: number) => {
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
      name: BackgroundJobs.UI_CREATE_STYLES,
      count: completed,
      timePerTask: 75,
    });
  } : undefined);

  // Complete progress tracking
  if (effectTokens.length > 10) {
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.UI_CREATE_STYLES,
    });
  }

  return tokenToStyleMap;
}
