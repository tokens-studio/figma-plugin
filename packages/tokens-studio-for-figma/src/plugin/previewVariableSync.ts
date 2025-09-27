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
import { TokenTypes } from '@/constants/TokenTypes';
import { figmaRGBToHex } from '@figma-plugin/helpers';

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
        console.log('🔍 [DEBUG] Processing token for variable creation:', {
          name: token.name,
          path: token.path,
          type: token.type,
          value: token.value,
          rawValue: token.rawValue,
          description: token.description,
        });

        const existingVariable = existingVariables.find((v) => 
          (v.key === token.variableId && !v.remote) || v.name === token.path
        );

        if (existingVariable) {
          handledVariableKeys.add(existingVariable.key);
          console.log('🔍 [DEBUG] Found existing variable:', existingVariable.name);
          
          // Check if this is an update
          const variableType = convertTokenTypeToVariableType(token.type, token.value);
          const currentValue = getCurrentVariableValue(existingVariable, theme.$figmaModeId);
          const newValue = getFormattedTokenValue(token, settings);
          
          console.log('🔍 [DEBUG] Update check:', {
            variableType,
            currentValue,
            newValue,
            shouldUpdate: shouldUpdateVariable(existingVariable, token, theme.$figmaModeId, settings),
          });
          
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
                value: normalizeTokenValue(token),  // Use normalized value
                rawValue: token.rawValue,
                type: token.type,
                parent: token.internal__Parent,
              },
            });
          }
        } else {
          console.log('🔍 [DEBUG] Creating new variable change preview');
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
              value: normalizeTokenValue(token),  // Use normalized value
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
                value: normalizeTokenValue(token),  // Use normalized value
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
            collectionName: 'Default', // Token sets use default collection
            tokenData: {
              value: normalizeTokenValue(token),  // Use normalized value
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
    
    console.log('🔍 [DEBUG] getCurrentVariableValue raw value:', {
      variableName: variable.name,
      variableType: variable.resolvedType,
      modeId: targetModeId,
      rawValue: value,
    });
    
    // Handle variable references
    if (typeof value === 'object' && value && 'type' in value) {
      if (value.type === 'VARIABLE_ALIAS') {
        // Try to get the referenced variable name for comparison
        try {
          const referencedVariable = figma.variables.getVariableById(value.id);
          const result = `{${referencedVariable?.name?.split('/').join('.') || 'unknown'}}`;
          console.log('🔍 [DEBUG] Variable alias formatted as:', result);
          return result;
        } catch (e) {
          console.warn('🔍 [DEBUG] Could not resolve variable reference:', e);
          return `{reference to variable}`;
        }
      }
    }
    
    // Handle color objects (RGB/RGBA)
    if (typeof value === 'object' && value && 'r' in value && 'g' in value && 'b' in value) {
      try {
        // Use figma helper to convert RGB to hex
        const result = figmaRGBToHex(value);
        console.log('🔍 [DEBUG] Color object formatted as hex using figmaRGBToHex:', result);
        return result;
      } catch (e) {
        // Fallback to manual conversion
        const r = Math.round(value.r * 255);
        const g = Math.round(value.g * 255);
        const b = Math.round(value.b * 255);
        const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        console.log('🔍 [DEBUG] Color object formatted as hex (fallback):', result);
        return result;
      }
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      const result = value.toString();
      console.log('🔍 [DEBUG] Boolean value formatted:', result);
      return result;
    }
    
    // Handle number values
    if (typeof value === 'number') {
      const result = value.toString();
      console.log('🔍 [DEBUG] Number value formatted:', result);
      return result;
    }
    
    // Handle string values
    if (typeof value === 'string') {
      console.log('🔍 [DEBUG] String value used as-is:', value);
      return value;
    }
    
    // Fallback for any other type
    const result = String(value || '');
    console.log('🔍 [DEBUG] Unknown type formatted as string:', result);
    return result;
  } catch (e) {
    console.error('🔍 [DEBUG] Error getting current variable value:', e);
    return 'Unable to read';
  }
}

function normalizeTokenValue(token: any): any {
  // Handle font weight arrays - take first element like in original logic
  if (token.type === TokenTypes.FONT_WEIGHTS && Array.isArray(token.value)) {
    console.log('🔍 [DEBUG] Normalizing font weight array:', token.value, '->', token.value[0]);
    return token.value[0];
  }
  
  return token.value;
}

function getFormattedTokenValue(token: any, settings: SettingsState): string {
  console.log('🔍 [DEBUG] getFormattedTokenValue called with:', {
    tokenValue: token.value,
    tokenRawValue: token.rawValue,
    tokenType: token.type,
  });

  // Handle references - check rawValue for reference syntax
  if (typeof token.rawValue === 'string' && token.rawValue.includes('{')) {
    // If it's a simple reference like "{dimension.xs}", format it
    if (token.rawValue.startsWith('{') && token.rawValue.endsWith('}') && !token.rawValue.includes('*') && !token.rawValue.includes('+') && !token.rawValue.includes('-') && !token.rawValue.includes('/')) {
      const refName = token.rawValue.slice(1, -1);
      const result = `{${refName}}`;
      console.log('🔍 [DEBUG] Formatted as simple reference:', result);
      return result;
    } else if (token.rawValue.includes('{')) {
      // Complex reference like "{dimension.xs} * {dimension.scale}" - return as-is
      console.log('🔍 [DEBUG] Formatted as complex reference:', token.rawValue);
      return token.rawValue;
    }
  }
  
  // Use normalized value for formatting
  const normalizedValue = normalizeTokenValue(token);
  
  if (token.type === 'dimension' || token.type === 'spacing' || token.type === 'sizing') {
    // Only transform if it's not a reference
    if (typeof token.rawValue !== 'string' || !token.rawValue.includes('{')) {
      const transformedValue = transformValue(String(normalizedValue), token.type, settings.baseFontSize, true);
      console.log('🔍 [DEBUG] Transformed dimension value:', normalizedValue, '->', transformedValue);
      return String(transformedValue);
    }
  }
  
  const result = String(normalizedValue || '');
  console.log('🔍 [DEBUG] Formatted as direct value:', result);
  return result;
}

function shouldUpdateVariable(variable: Variable, token: any, modeId?: string, settings?: SettingsState): boolean {
  const currentValue = getCurrentVariableValue(variable, modeId);
  const newValue = getFormattedTokenValue(token, settings || {} as SettingsState);
  
  console.log('🔍 [DEBUG] shouldUpdateVariable comparison:', {
    variableName: variable.name,
    currentValue,
    newValue,
    areEqual: currentValue === newValue,
    currentDescription: variable.description,
    newDescription: token.description || '',
    descriptionChanged: variable.description !== (token.description || ''),
  });
  
  // Check if values are different
  if (currentValue !== newValue) {
    console.log('✅ [DEBUG] Values are different - update needed');
    return true;
  }
  
  // Check if description changed
  if (variable.description !== (token.description || '')) {
    console.log('✅ [DEBUG] Description changed - update needed');
    return true;
  }
  
  console.log('❌ [DEBUG] No changes detected - update not needed');
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