import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import updateStyles from '../updateStyles';
import { getThemeReferences } from './getThemeReferences';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';

export const createStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_STYLES] = async (msg) => {
  const {
    figmaVariableReferences, figmaStyleReferences, stylePathPrefix,
  } = await getThemeReferences(msg.settings.prefixStylesWithThemeName);
  defaultTokenValueRetriever.initiate({
    tokens: msg.tokens, variableReferences: figmaVariableReferences, styleReferences: figmaStyleReferences, stylePathPrefix, ignoreFirstPartForStyles: msg.settings.prefixStylesWithThemeName,
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
