import { AnyTokenList, SingleToken } from '@/types/tokens';
import { generateTokensToCreate } from './generateTokensToCreate';
import { ThemeObject } from '@/types';
import { SettingsState } from '@/app/store/models/settings';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import setValuesOnVariable from './setValuesOnVariable';
import { mapTokensToVariableInfo } from '@/utils/mapTokensToVariableInfo';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';
import { ExportNumberVariablesTokenTypes, TokenTypes } from '@/constants/TokenTypes';

export type CreateVariableTypes = {
  collection: VariableCollection;
  mode: string;
  theme: ThemeObject;
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState;
};

export type VariableToken = SingleToken<true, { path: string, variableId: string }>;

export default async function updateVariables({
  collection, mode, theme, tokens, settings,
}: CreateVariableTypes) {
  const tokensToCreate = generateTokensToCreate(theme, tokens, tokenTypesToCreateVariable);
  const variablesToCreate: VariableToken[] = [];
  tokensToCreate.forEach((token) => {
    if (checkIfTokenCanCreateVariable(token)) {
      if (
        (token.type === TokenTypes.COLOR && settings.variablesColor)
        || (ExportNumberVariablesTokenTypes.includes(token.type) && settings.variablesNumber)
        || (token.type === TokenTypes.TEXT && settings.variablesString)
        || (token.type === TokenTypes.BOOLEAN && settings.variablesBoolean)
      ) {
        variablesToCreate.push(mapTokensToVariableInfo(token, theme, settings));
      }
    }
  });
  console.log('variables to create', variablesToCreate);
  const variableObj = await setValuesOnVariable(figma.variables.getLocalVariables().filter((v) => v.variableCollectionId === collection.id), variablesToCreate, collection, mode);
  console.log('variableObj', variableObj);
  return {
    variableIds: variableObj.variableKeyMap,
    referenceVariableCandidate: variableObj.referenceVariableCandidates,
  };
}
