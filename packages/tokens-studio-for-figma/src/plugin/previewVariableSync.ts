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
          valueType: typeof token.value,
          rawValueType: typeof token.rawValue,
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
      console.log('🔍 [DEBUG] Processing token set:', tokenSet.set);
      const setTokens = tokens[tokenSet.set] || [];
      console.log('🔍 [DEBUG] Raw tokens in set:', setTokens.length);
      
      const tokensToCreate = setTokens.filter((token) => checkIfTokenCanCreateVariable(token, settings));
      console.log('🔍 [DEBUG] Filtered tokens that can create variables:', tokensToCreate.length);
      
      for (const token of tokensToCreate) {
        console.log('🔍 [DEBUG] Processing token set token:', {
          name: token.name,
          value: token.value,
          rawValue: token.rawValue,
          type: token.type,
          valueType: typeof token.value,
        });
        
        const mappedToken = mapTokensToVariableInfo(token, { name: 'Default', selectedTokenSets: { [tokenSet.set]: TokenSetStatus.ENABLED } } as any, settings);
        console.log('🔍 [DEBUG] Mapped token:', {
          name: mappedToken.name,
          value: mappedToken.value,
          rawValue: mappedToken.rawValue,
          type: mappedToken.type,
        });
        
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
    
    // Handle variable references - try to resolve them to actual values
    if (typeof value === 'object' && value && 'type' in value) {
      if (value.type === 'VARIABLE_ALIAS') {
        try {
          const referencedVariable = figma.variables.getVariableById(value.id);
          if (referencedVariable) {
            // Try to get the resolved value from the referenced variable
            const collection = figma.variables.getVariableCollectionById(referencedVariable.variableCollectionId);
            const firstModeId = collection?.modes[0]?.modeId || Object.keys(referencedVariable.valuesByMode)[0];
            const referencedValue = referencedVariable.valuesByMode[firstModeId];
            
            // If the referenced variable has a direct value (not another alias), use it
            if (typeof referencedValue === 'number' || typeof referencedValue === 'string' || typeof referencedValue === 'boolean') {
              const result = String(referencedValue);
              console.log('🔍 [DEBUG] Variable alias resolved to value:', result);
              return result;
            }
            
            // If it's a color object, format it
            if (typeof referencedValue === 'object' && referencedValue && 'r' in referencedValue) {
              try {
                const result = figmaRGBToHex(referencedValue);
                console.log('🔍 [DEBUG] Variable alias resolved to color:', result);
                return result;
              } catch (e) {
                // Fallback to manual conversion
                const r = Math.round(referencedValue.r * 255);
                const g = Math.round(referencedValue.g * 255);
                const b = Math.round(referencedValue.b * 255);
                const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
                console.log('🔍 [DEBUG] Variable alias resolved to color (fallback):', result);
                return result;
              }
            }
          }
          
          // Fallback: show as reference if we can't resolve
          const result = `{${referencedVariable?.name?.split('/').join('.') || 'unknown'}}`;
          console.log('🔍 [DEBUG] Variable alias kept as reference (unresolvable):', result);
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
    
    // Handle number values - apply rounding to match token processing
    if (typeof value === 'number') {
      // Round to reasonable precision to avoid floating point errors
      const rounded = Math.round(value * 1000) / 1000; // 3 decimal places
      const result = rounded.toString();
      console.log('🔍 [DEBUG] Number value formatted with rounding:', value, '->', result);
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
  
  // Handle empty or undefined values
  if (token.value === undefined || token.value === null || token.value === '') {
    console.log('🔍 [DEBUG] Token value is empty/null/undefined:', token.value);
    return '';
  }
  
  return token.value;
}

function getFormattedTokenValue(token: any, settings: SettingsState): string {
  console.log('🔍 [DEBUG] getFormattedTokenValue called with:', {
    tokenValue: token.value,
    tokenRawValue: token.rawValue,
    tokenType: token.type,
  });

  // Use normalized value for formatting (this handles the resolved value)
  const normalizedValue = normalizeTokenValue(token);
  
  // Check if this is still a reference that couldn't be resolved
  // Only treat as reference if the VALUE itself contains curly braces, not rawValue
  if (typeof normalizedValue === 'string' && normalizedValue.includes('{') && normalizedValue.includes('}')) {
    console.log('🔍 [DEBUG] Formatted as unresolved reference:', normalizedValue);
    return normalizedValue;
  }
  
  // For dimension/spacing/sizing tokens, apply transformations to the resolved value
  if (token.type === 'dimension' || token.type === 'spacing' || token.type === 'sizing') {
    const transformedValue = transformValue(String(normalizedValue), token.type, settings.baseFontSize, true);
    // Apply same rounding as getCurrentVariableValue to ensure consistency
    if (typeof transformedValue === 'number') {
      const rounded = Math.round(transformedValue * 1000) / 1000; // 3 decimal places
      console.log('🔍 [DEBUG] Transformed and rounded dimension value:', normalizedValue, '->', transformedValue, '->', rounded);
      return String(rounded);
    }
    console.log('🔍 [DEBUG] Transformed dimension value:', normalizedValue, '->', transformedValue);
    return String(transformedValue);
  }
  
  // Apply rounding to numeric values for consistency
  if (typeof normalizedValue === 'number') {
    const rounded = Math.round(normalizedValue * 1000) / 1000; // 3 decimal places
    console.log('🔍 [DEBUG] Formatted as rounded number:', normalizedValue, '->', rounded);
    return String(rounded);
  }
  
  const result = String(normalizedValue || '');
  console.log('🔍 [DEBUG] Formatted as resolved value:', result);
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