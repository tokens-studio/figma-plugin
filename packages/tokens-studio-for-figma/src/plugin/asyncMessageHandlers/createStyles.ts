import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import updateStyles from '../updateStyles';
import { getThemeReferences } from './getThemeReferences';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';

export const createStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_STYLES] = async (msg) => {
  try {
    const {
      figmaVariableReferences, figmaStyleReferences, stylePathPrefix,
    } = await getThemeReferences(msg.settings.prefixStylesWithThemeName);
    defaultTokenValueRetriever.initiate({
      tokens: msg.tokens,
      variableReferences: figmaVariableReferences,
      styleReferences: figmaStyleReferences,
      stylePathPrefix,
      ignoreFirstPartForStyles: msg.settings.ignoreFirstPartForStyles,
      createStylesWithVariableReferences: msg.settings.createStylesWithVariableReferences,
      applyVariablesStylesOrRawValue: msg.settings.applyVariablesStylesOrRawValue,
      selectedTheme: msg.selectedTheme,
    });
    const styleIds = await updateStyles(msg.tokens, msg.settings, true, msg.selectedTheme);

    return {
      styleIds,
    };
  } catch (e) {
    console.error(e);
  }

  return {
    styleIds: {},
  };
};
