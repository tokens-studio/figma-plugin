import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { VariableChangePreview } from '@/types/AsyncMessages';
import { generateTokensToCreate } from './generateTokensToCreate';
import { mapTokensToVariableInfo } from '@/utils/mapTokensToVariableInfo';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import { getOverallConfig } from '@/utils/tokenHelpers';
import { convertTokenTypeToVariableType } from '@/utils/convertTokenTypeToVariableType';
import { transformValue } from './helpers';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export type PreviewVariableSyncParams = {
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState;
  selectedThemes?: string[];
  selectedSets?: ExportTokenSet[];
};

export default async function previewVariableSync({
  tokens,
  settings,
  selectedThemes,
  selectedSets,
}: PreviewVariableSyncParams): Promise<{
  changes: VariableChangePreview[];
  summary: { toCreate: number; toUpdate: number; toDelete: number };
}> {
  const changes: VariableChangePreview[] = [];
  
  // Get theme info
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });

  // Get existing variables
  const existingVariables = figma.variables.getLocalVariables();
  const existingVariablesByName = existingVariables.reduce<Record<string, Variable>>((acc, variable) => {
    acc[variable.name] = variable;
    return acc;
  }, {});

  // Create a set to track which variables will be handled
  const handledVariableKeys = new Set<string>();

  if (selectedThemes && selectedThemes.length > 0) {
    const selectedThemeObjects = themeInfo.themes.filter((theme) => selectedThemes.includes(theme.id));
    const overallConfig = getOverallConfig(themeInfo.themes, selectedThemes);

    for (const theme of selectedThemeObjects) {
      const tokensToCreate = generateTokensToCreate({
        theme,
        tokens,
        overallConfig,
      });

      const variablesToCreate = tokensToCreate
        .filter((token) => checkIfTokenCanCreateVariable(token, settings))
        .map((token) => mapTokensToVariableInfo(token, theme, settings));

      for (const token of variablesToCreate) {
        const existingVariable = existingVariables.find((v) => 
          (v.key === token.variableId && !v.remote) || v.name === token.path
        );

        if (existingVariable) {
          handledVariableKeys.add(existingVariable.key);
          
          // Check if this is an update
          const variableType = convertTokenTypeToVariableType(token.type, token.value);
          const currentValue = getCurrentVariableValue(existingVariable, theme.$figmaModeId);
          const newValue = getFormattedTokenValue(token, settings);
          
          if (shouldUpdateVariable(existingVariable, token, theme.$figmaModeId, settings)) {
            changes.push({
              type: 'update',
              name: token.name,
              path: token.path,
              tokenType: token.type,
              currentValue,
              newValue,
              description: token.description,
              variableId: existingVariable.id,
              collectionName: getCollectionName(existingVariable),
              mode: theme.name,
              tokenData: {
                value: token.value,
                rawValue: token.rawValue,
                type: token.type,
                parent: token.internal__Parent,
              },
            });
          }
        } else {
          // This is a new variable
          changes.push({
            type: 'create',
            name: token.name,
            path: token.path,
            tokenType: token.type,
            newValue: getFormattedTokenValue(token, settings),
            description: token.description,
            collectionName: theme.group ?? theme.name,
            mode: theme.name,
            tokenData: {
              value: token.value,
              rawValue: token.rawValue,
              type: token.type,
              parent: token.internal__Parent,
            },
          });
        }
      }
    }
  }

  // Handle token sets (without modes)
  if (selectedSets && selectedSets.length > 0) {
    const enabledSets = selectedSets.filter(set => set.status === TokenSetStatus.ENABLED);
    
    for (const tokenSet of enabledSets) {
      const setTokens = tokens[tokenSet.set] || [];
      const tokensToCreate = setTokens.filter((token) => checkIfTokenCanCreateVariable(token, settings));
      
      for (const token of tokensToCreate) {
        const mappedToken = mapTokensToVariableInfo(token, { name: 'Default', selectedTokenSets: { [tokenSet.set]: TokenSetStatus.ENABLED } } as any, settings);
        const existingVariable = existingVariablesByName[mappedToken.path];

        if (existingVariable) {
          handledVariableKeys.add(existingVariable.key);
          
          const currentValue = getCurrentVariableValue(existingVariable);
          const newValue = getFormattedTokenValue(mappedToken, settings);
          
          if (shouldUpdateVariable(existingVariable, mappedToken, undefined, settings)) {
            changes.push({
              type: 'update',
              name: mappedToken.name,
              path: mappedToken.path,
              tokenType: mappedToken.type,
              currentValue,
              newValue,
              description: mappedToken.description,
              variableId: existingVariable.id,
              collectionName: getCollectionName(existingVariable),
              tokenData: {
                value: token.value,
                rawValue: token.rawValue,
                type: token.type,
                parent: token.internal__Parent,
              },
            });
          }
        } else {
          changes.push({
            type: 'create',
            name: mappedToken.name,
            path: mappedToken.path,
            tokenType: mappedToken.type,
            newValue: getFormattedTokenValue(mappedToken, settings),
            description: mappedToken.description,
            tokenData: {
              value: token.value,
              rawValue: token.rawValue,
              type: token.type,
              parent: token.internal__Parent,
            },
          });
        }
      }
    }
  }

  // Find variables to delete (if removal setting is enabled)
  if (settings.removeStylesAndVariablesWithoutConnection) {
    for (const variable of existingVariables) {
      if (!handledVariableKeys.has(variable.key)) {
        changes.push({
          type: 'delete',
          name: variable.name,
          path: variable.name,
          tokenType: getVariableTypeString(variable.resolvedType),
          currentValue: getCurrentVariableValue(variable),
          variableId: variable.id,
          collectionName: getCollectionName(variable),
        });
      }
    }
  }

  // Calculate summary
  const summary = {
    toCreate: changes.filter(c => c.type === 'create').length,
    toUpdate: changes.filter(c => c.type === 'update').length,
    toDelete: changes.filter(c => c.type === 'delete').length,
  };

  return { changes, summary };
}

function getCurrentVariableValue(variable: Variable, modeId?: string): string {
  try {
    const modes = Object.keys(variable.valuesByMode);
    const targetModeId = modeId || modes[0];
    const value = variable.valuesByMode[targetModeId];
    
    if (typeof value === 'object' && 'type' in value) {
      if (value.type === 'VARIABLE_ALIAS') {
        return `{reference to variable}`;
      }
    }
    
    return String(value || '');
  } catch (e) {
    return 'Unable to read';
  }
}

function getFormattedTokenValue(token: any, settings: SettingsState): string {
  if (typeof token.rawValue === 'string' && token.rawValue.startsWith('{')) {
    return `{${token.rawValue.slice(1, -1)}}`;
  }
  
  if (token.type === 'dimension' || token.type === 'spacing' || token.type === 'sizing') {
    const transformedValue = transformValue(String(token.value), token.type, settings.baseFontSize, true);
    return String(transformedValue);
  }
  
  return String(token.value || '');
}

function shouldUpdateVariable(variable: Variable, token: any, modeId?: string, settings?: SettingsState): boolean {
  const currentValue = getCurrentVariableValue(variable, modeId);
  const newValue = getFormattedTokenValue(token, settings || {} as SettingsState);
  
  // Check if values are different
  if (currentValue !== newValue) {
    return true;
  }
  
  // Check if description changed
  if (variable.description !== (token.description || '')) {
    return true;
  }
  
  return false;
}

function getCollectionName(variable: Variable): string {
  try {
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
    return collection?.name || 'Unknown Collection';
  } catch (e) {
    return 'Unknown Collection';
  }
}

function getVariableTypeString(type: VariableResolvedDataType): string {
  switch (type) {
    case 'BOOLEAN': return 'boolean';
    case 'COLOR': return 'color';
    case 'FLOAT': return 'number';
    case 'STRING': return 'string';
    default: return 'unknown';
  }
}