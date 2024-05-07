import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import updateStyles from '../updateStyles';
import { getThemeReferences } from './getThemeReferences';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';

export const createStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_STYLES] = async (msg) => {
  const {
    figmaVariableReferences, figmaStyleReferences, stylePathPrefix,
  } = await getThemeReferences(msg.settings.prefixStylesWithThemeName);
  console.log('figmaVariableReferences: ', figmaVariableReferences);
  console.log('figmaStyleReferences: ', figmaStyleReferences);
  defaultTokenValueRetriever.initiate({
    tokens: msg.tokens,
    variableReferences: figmaVariableReferences,
    styleReferences: figmaStyleReferences,
    stylePathPrefix,
    ignoreFirstPartForStyles: msg.settings.ignoreFirstPartForStyles,
    createStylesWithVariableReferences: msg.settings.createStylesWithVariableReferences,
  });
  try {
    return {
      styleIds: await updateStyles(msg.tokens, msg.settings, true),
    };
  } catch (e) {
    console.error(e);
  }

  return {
    styleIds: {},
  };
};
