import { SettingsState } from '@/app/store/models/settings';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { transformValue } from './helpers';
import updateColorStyles from './updateColorStyles';
import updateEffectStyles from './updateEffectStyles';
import updateTextStyles from './updateTextStyles';
import { notifyUI, postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import type { ThemeObject } from '@/types';

export default async function updateStyles(
  tokens: AnyTokenList,
  settings: SettingsState,
  shouldCreate = false,
  selectedTheme?: ThemeObject,
): Promise<Record<string, string>> {
  // Big O (n * m * l): (n = amount of tokens, m = amount of active themes, l = amount of tokenSets)
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemes = themeInfo.themes
    .filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id))
    .reverse();

  const styleTokens = tokens.map((token) => {
    // When multiple theme has the same active Token set then the last activeTheme wins
    const activeTheme = selectedTheme || activeThemes.find((theme) => Object.entries(theme.selectedTokenSets).some(([tokenSet]) => tokenSet === token.internal__Parent));

    const prefix = settings.prefixStylesWithThemeName && activeTheme ? activeTheme.name : null;
    const slice = settings?.ignoreFirstPartForStyles && token.name.split('.').length > 1 ? 1 : 0;
    const path = convertTokenNameToPath(token.name, prefix, slice);
    return {
      ...token,
      path,
      value: typeof token.value === 'string' ? transformValue(token.value, token.type, settings.baseFontSize) : token.value,
      styleId: activeTheme?.$figmaStyleReferences ? activeTheme?.$figmaStyleReferences[token.name] : '',
    } as SingleToken<true, { path: string, styleId: string }>;
  }).filter((token) => token.path);

  const colorTokens = styleTokens.filter((n) => {
    if (![TokenTypes.COLOR].includes(n.type)) return false;
    // Include gradient tokens only if gradient styles setting is enabled
    if (typeof n.value === 'string' && (n.value.startsWith('linear-gradient') || n.value.startsWith('radial-gradient') || n.value.startsWith('conic-gradient'))) {
      return settings.stylesGradient ?? false;
    }
    return settings.stylesColor ?? true;
  }) as Extract<
    typeof styleTokens[number],
  { type: TokenTypes.COLOR }
  >[];
  const textTokens = styleTokens.filter((n) => [TokenTypes.TYPOGRAPHY].includes(n.type) && (settings.stylesTypography ?? true)) as Extract<
    typeof styleTokens[number],
  { type: TokenTypes.TYPOGRAPHY }
  >[];
  const effectTokens = styleTokens.filter((n) => [TokenTypes.BOX_SHADOW].includes(n.type) && (settings.stylesEffect ?? true)) as Extract<
    typeof styleTokens[number],
  { type: TokenTypes.BOX_SHADOW }
  >[];

  if (!colorTokens && !textTokens && !effectTokens) return {};

  const totalTokens = colorTokens.length + textTokens.length + effectTokens.length;

  // Start unified progress tracking for all styles
  if (totalTokens > 10) {
    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.UI_CREATE_STYLES,
        timePerTask: 75, // Average estimate across all style types
        totalTasks: totalTokens,
        completedTasks: 0,
      },
    });
  }

  let completedTasks = 0;
  const reportProgress = totalTokens > 10 ? (completed: number) => {
    completedTasks += completed;
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
      name: BackgroundJobs.UI_CREATE_STYLES,
      count: completedTasks,
      timePerTask: 75,
    });
  } : undefined;

  // Process style types sequentially to avoid memory pressure and ensure accurate progress reporting
  const styleResults: Record<string, string>[] = [];

  if (colorTokens.length > 0) {
    const colorStyles = await updateColorStyles(colorTokens, shouldCreate, settings.renameExistingStylesAndVariables, reportProgress);
    styleResults.push(colorStyles);
  }

  if (textTokens.length > 0) {
    const textStyles = await updateTextStyles(textTokens, settings.baseFontSize, shouldCreate, settings.renameExistingStylesAndVariables, reportProgress);
    styleResults.push(textStyles);
  }

  if (effectTokens.length > 0) {
    const effectStyles = await updateEffectStyles({
      effectTokens, baseFontSize: settings.baseFontSize, shouldCreate, shouldRename: settings.renameExistingStylesAndVariables, onProgress: reportProgress,
    });
    styleResults.push(effectStyles);
  }

  const allStyleIds = Object.assign({}, ...styleResults);

  // Complete progress tracking
  if (totalTokens > 10) {
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.UI_CREATE_STYLES,
    });
  }
  if (styleTokens.length < tokens.length && shouldCreate) {
    notifyUI('Some styles were ignored due to "Ignore first part of token name" export setting', { error: true });
  }

  return allStyleIds;
}
