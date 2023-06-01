import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { generateTokensToCreate } from '../generateTokensToCreate';
import { TokenTypes } from '@/constants/TokenTypes';
import { getAttachedVariable } from '@/utils/getAttachedVariable';

export const attachLocalVariablesToTheme: AsyncMessageChannelHandlers[AsyncMessageTypes.ATTACH_LOCAL_VARIABLES_TO_THEME] = async (msg) => {
  const {
    tokens, theme,
  } = msg;
  const allFigmaCollections = figma.variables.getLocalVariableCollections();
  const collection = allFigmaCollections.find((co) => co.name === (theme.group ?? theme.name));
  const mode = collection?.modes.find((m) => m.name === theme.name);
  if (collection && mode) {
    const collectionVariableIds: Record<string, string> = {};
    const tokensToCreateVariablesFor = generateTokensToCreate(theme, tokens, [TokenTypes.DIMENSION, TokenTypes.BORDER_RADIUS, TokenTypes.BORDER_WIDTH, TokenTypes.SPACING, TokenTypes.SIZING, TokenTypes.BOOLEAN, TokenTypes.COLOR]);
    tokensToCreateVariablesFor.forEach((token) => {
      if (token.type === TokenTypes.COLOR) {
        const variable = getAttachedVariable(collection.id, 'COLOR', token.name);
        if (variable) {
          collectionVariableIds[token.name] = variable.id;
        }
      } else if (token.type === TokenTypes.BOOLEAN) {
        const variable = getAttachedVariable(collection.id, 'BOOLEAN', token.name);
        if (variable) {
          collectionVariableIds[token.name] = variable.id;
        }
      } else if ([TokenTypes.DIMENSION, TokenTypes.BORDER_RADIUS, TokenTypes.BORDER_WIDTH, TokenTypes.SPACING, TokenTypes.SIZING].includes(token.type)) {
        const variable = getAttachedVariable(collection.id, 'FLOAT', token.name);
        if (variable) {
          collectionVariableIds[token.name] = variable.id;
        }
      }
    });
    return {
      variableInfo: {
        collectionId: collection.id,
        modeId: mode.modeID,
        variableIds: collectionVariableIds,
      },
    };
  }
  return {
    variableInfo: null,
  };
};
