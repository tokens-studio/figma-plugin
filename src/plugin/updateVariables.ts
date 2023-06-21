import { AnyTokenList, SingleToken } from '@/types/tokens';
import { generateTokensToCreate } from './generateTokensToCreate';
import { ThemeObject } from '@/types';
import { TokenTypes } from '@/constants/TokenTypes';
import { SettingsState } from '@/app/store/models/settings';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import setValuesOnVariable, { ReferenceVariableType } from './setValuesOnVariable';
import { mapTokensToVariableInfo } from '@/utils/mapTokensToVariableInfo';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';

export type CreateVariableTypes = {
  collection: VariableCollection;
  mode: string;
  theme: ThemeObject;
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState;
  shouldCreate: boolean;
};

export type VariableToken = SingleToken<true, { path: string, variableId: string }>;

export default function updateVariables({
  collection, mode, theme, tokens, settings, shouldCreate,
}: CreateVariableTypes) {
  const tokensToCreate = generateTokensToCreate(theme, tokens, tokenTypesToCreateVariable);
  const variablesToCreate: VariableToken[] = [];
  tokensToCreate.forEach((token) => {
    if (checkIfTokenCanCreateVariable(token)) {
      variablesToCreate.push(mapTokensToVariableInfo(token, theme, settings));
    }
  });
  const colorVariables = variablesToCreate.filter((t) => t.type === TokenTypes.COLOR) as Extract<VariableToken, { type: TokenTypes.COLOR }>[];
  const booleanVariables = variablesToCreate.filter((t) => t.type === TokenTypes.BOOLEAN) as Extract<VariableToken, { type: TokenTypes.BOOLEAN }>[];
  const numberVariables = variablesToCreate.filter((t) => [TokenTypes.DIMENSION, TokenTypes.BORDER_RADIUS, TokenTypes.BORDER_WIDTH, TokenTypes.SPACING, TokenTypes.SIZING, TokenTypes.NUMBER].includes(t.type));
  const stringVariables = variablesToCreate.filter((t) => t.type === TokenTypes.TEXT) as Extract<VariableToken, { type: TokenTypes.TEXT }>[];
  const variableObj: Record<string, ReferenceVariableType> = {
    ...setValuesOnVariable(figma.variables.getLocalVariables('COLOR').filter((v) => v.variableCollectionId === collection.id), colorVariables, 'COLOR', collection, mode, shouldCreate),
    ...setValuesOnVariable(figma.variables.getLocalVariables('BOOLEAN').filter((v) => v.variableCollectionId === collection.id), booleanVariables, 'BOOLEAN', collection, mode, shouldCreate),
    ...setValuesOnVariable(figma.variables.getLocalVariables('FLOAT').filter((v) => v.variableCollectionId === collection.id), numberVariables, 'FLOAT', collection, mode, shouldCreate),
    ...setValuesOnVariable(figma.variables.getLocalVariables('STRING').filter((v) => v.variableCollectionId === collection.id), stringVariables, 'STRING', collection, mode, shouldCreate),
  };
  const returnVariableIds: Record<string, string> = {};
  const referenceVariableCandidate: ReferenceVariableType[] = [];
  Object.entries(variableObj).forEach(([tokenName, referenceVariable]) => {
    if (referenceVariable.shouldReferenceToVariable) {
      referenceVariableCandidate.push(referenceVariable);
    }
    returnVariableIds[tokenName] = referenceVariable.variable.id;
  });
  return {
    variableIds: returnVariableIds,
    referenceVariableCandidate,
  };
}
