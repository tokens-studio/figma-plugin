import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { generateTokensToCreate } from '../generateTokensToCreate';

export const attachLocalVariablesToTheme: AsyncMessageChannelHandlers[AsyncMessageTypes.ATTACH_LOCAL_VARIABLES_TO_THEME] = async (msg) => {
  const { tokens, theme } = msg;
  const allFigmaCollections = figma.variables.getLocalVariableCollections();
  const collection = allFigmaCollections.find((co) => co.name === (theme.group ?? theme.name));
  const mode = collection?.modes.find((m) => m.name === theme.name);
  const figmaVariableMaps = new Map(
    figma.variables
      .getLocalVariables()
      .filter((v) => v.variableCollectionId === collection?.id)
      .map((variable) => [variable.name, variable]),
  );
  if (collection && mode) {
    const collectionVariableIds: Record<string, string> = {};
    const { tokensToCreate } = generateTokensToCreate({ theme, tokens });
    tokensToCreate.forEach((token) => {
      const variable = figmaVariableMaps.get(token.name.split('.').join('/'));
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
