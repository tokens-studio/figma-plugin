import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { generateTokensToCreate } from '../generateTokensToCreate';
import { TokenTypes } from '@/constants/TokenTypes';
import { getAttachedVariable } from '@/utils/getAttachedVariable';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';

export const attachLocalVariablesToTheme: AsyncMessageChannelHandlers[AsyncMessageTypes.ATTACH_LOCAL_VARIABLES_TO_THEME] = async (msg) => {
  const {
    tokens, theme,
  } = msg;
  const allFigmaCollections = figma.variables.getLocalVariableCollections();
  const collection = allFigmaCollections.find((co) => co.name === (theme.group ?? theme.name));
  const mode = collection?.modes.find((m) => m.name === theme.name);
  if (collection && mode) {
    const collectionVariableIds: Record<string, string> = {};
    const tokensToCreateVariablesFor = generateTokensToCreate(theme, tokens, tokenTypesToCreateVariable);
    tokensToCreateVariablesFor.forEach((token) => {
      let variable: Variable | undefined;
      switch (token.type) {
        case TokenTypes.COLOR:
          variable = getAttachedVariable(collection.id, 'COLOR', token.name);
          break;
        case TokenTypes.BOOLEAN:
          variable = getAttachedVariable(collection.id, 'BOOLEAN', token.name);
          break;
        case TokenTypes.TEXT:
          variable = getAttachedVariable(collection.id, 'STRING', token.name);
          break;
        case TokenTypes.SIZING:
        case TokenTypes.DIMENSION:
        case TokenTypes.BORDER_RADIUS:
        case TokenTypes.BORDER_WIDTH:
        case TokenTypes.SPACING:
        case TokenTypes.NUMBER:
          variable = getAttachedVariable(collection.id, 'FLOAT', token.name);
          break;
        default: break;
      }
      if (variable) {
        collectionVariableIds[token.name] = variable.key;
      }
    });
    return {
      variableInfo: {
        collectionId: collection.id,
        modeId: mode.modeId,
        variableIds: collectionVariableIds,
      },
    };
  }
  return {
    variableInfo: null,
  };
};
