import { figmaRGBToHex } from '@figma-plugin/helpers';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes, VariableChangePreview } from '@/types/AsyncMessages';
import { generateTokensToCreate } from './generateTokensToCreate';
import { mapTokensToVariableInfo } from '@/utils/mapTokensToVariableInfo';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import { getOverallConfig } from '@/utils/tokenHelpers';
import { transformValue } from './helpers';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';

export type PreviewVariableSyncParams = {
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState;
  selectedThemes?: string[];
  selectedSets?: ExportTokenSet[];
};

// Helper functions defined first to avoid "used before defined" errors
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

function getCurrentVariableValue(variable: Variable, modeId?: string): string {
  try {
    const modes = Object.keys(variable.valuesByMode);
    const targetModeId = modeId || modes[0];
    const value = variable.valuesByMode[targetModeId];

    console.log(`🔍 ${variable.name} [${targetModeId}]:`, typeof value === 'object' && value && 'type' in value ? 'REFERENCE' : value);

    // Handle variable references - try to resolve them to actual values
    if (typeof value === 'object' && value && 'type' in value) {
      if (value.type === 'VARIABLE_ALIAS') {
        try {
          const referencedVariable = figma.variables.getVariableById(value.id);
          if (referencedVariable) {
            // Determine which mode to use for the referenced variable
            let referencedModeId: string;

            // If the referenced variable is in the same collection, use the same mode
            if (referencedVariable.variableCollectionId === variable.variableCollectionId) {
              referencedModeId = targetModeId;
            } else {
              // Different collection - use the first mode or try to find matching mode name
              const referencedCollection = figma.variables.getVariableCollectionById(referencedVariable.variableCollectionId);
              const currentCollection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
              const currentModeName = currentCollection?.modes.find((m) => m.modeId === targetModeId)?.name;

              // Try to find mode with same name in referenced collection
              const matchingMode = referencedCollection?.modes.find((m) => m.name === currentModeName);
              referencedModeId = matchingMode?.modeId || referencedCollection?.modes[0]?.modeId || Object.keys(referencedVariable.valuesByMode)[0];

              console.log(`🔗 ${variable.name} → ${referencedVariable.name} [${currentModeName || 'unknown'}]`);
            }

            const referencedValue = referencedVariable.valuesByMode[referencedModeId];

            // If the referenced variable has a direct value (not another alias), use it
            if (typeof referencedValue === 'number' || typeof referencedValue === 'string' || typeof referencedValue === 'boolean') {
              return String(referencedValue);
            }

            // If it's a color object, format it
            if (typeof referencedValue === 'object' && referencedValue && 'r' in referencedValue) {
              try {
                return figmaRGBToHex(referencedValue);
              } catch (e) {
                const r = Math.round(referencedValue.r * 255);
                const g = Math.round(referencedValue.g * 255);
                const b = Math.round(referencedValue.b * 255);
                return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
              }
            }
          }

          // Fallback: show as reference if we can't resolve
          return `{${referencedVariable?.name?.split('/').join('.') || 'unknown'}}`;
        } catch (e) {
          return '{reference to variable}';
        }
      }
    }

    // Handle color objects (RGB/RGBA)
    if (typeof value === 'object' && value && 'r' in value && 'g' in value && 'b' in value) {
      try {
        return figmaRGBToHex(value);
      } catch (e) {
        const r = Math.round(value.r * 255);
        const g = Math.round(value.g * 255);
        const b = Math.round(value.b * 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      }
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value.toString();
    }

    // Handle number values - apply rounding to match token processing
    if (typeof value === 'number') {
      const rounded = Math.round(value * 1000) / 1000; // 3 decimal places
      return rounded.toString();
    }

    // Handle string values
    if (typeof value === 'string') {
      return value;
    }

    return String(value || '');
  } catch (e) {
    return 'Unable to read';
  }
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

function getCollectionName(variable: Variable): string {
  try {
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
    return collection?.name || 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
}

function getVariableTypeString(variable: Variable): string {
  const typeMap = {
    COLOR: 'Color',
    FLOAT: 'Number',
    STRING: 'String',
    BOOLEAN: 'Boolean',
  };
  return typeMap[variable.resolvedType] || variable.resolvedType;
}

function isTokenReference(token: any): boolean {
  return typeof token.rawValue === 'string' && token.rawValue.includes('{') && token.rawValue.includes('}');
}

function isVariableReference(variable: Variable, modeId?: string): boolean {
  try {
    const modes = Object.keys(variable.valuesByMode);
    const targetModeId = modeId || modes[0];
    const value = variable.valuesByMode[targetModeId];
    return typeof value === 'object' && value && 'type' in value && value.type === 'VARIABLE_ALIAS';
  } catch (e) {
    return false;
  }
}

function compareReferences(variable: Variable, token: any, modeId?: string): boolean | null {
  try {
    const modes = Object.keys(variable.valuesByMode);
    const targetModeId = modeId || modes[0];
    const value = variable.valuesByMode[targetModeId];

    if (typeof value === 'object' && value && 'type' in value && value.type === 'VARIABLE_ALIAS') {
      const referencedVariable = figma.variables.getVariableById(value.id);
      if (referencedVariable) {
        const variableRefName = referencedVariable.name?.split('/').join('.');

        // Extract reference name from token
        let tokenRefName = '';
        if (token.rawValue && token.rawValue.toString().startsWith('{')) {
          tokenRefName = token.rawValue.toString().slice(1, token.rawValue.toString().length - 1);
        } else {
          tokenRefName = token.rawValue?.toString().substring(1) || '';
        }

        const matches = variableRefName === tokenRefName;
        console.log(`🔗 Reference comparison: "${variableRefName}" vs "${tokenRefName}" = ${matches}`);
        return matches;
      }
    }

    return null; // Not a reference comparison
  } catch (e) {
    console.log('🔗 Reference comparison error:', e);
    return null;
  }
}

function shouldUpdateVariable(variable: Variable, token: any, modeId?: string, settings?: SettingsState): boolean {
  const currentValue = getCurrentVariableValue(variable, modeId);
  const newValue = getFormattedTokenValue(token, settings || {} as SettingsState);

  // Special handling for reference comparison
  if (isTokenReference(token) && isVariableReference(variable, modeId)) {
    const referenceMatches = compareReferences(variable, token, modeId);
    if (referenceMatches !== null) {
      console.log(`📋 ${variable.name}: Reference ${referenceMatches ? 'MATCH' : 'DIFFER'}`);
      return !referenceMatches || (variable.description !== (token.description || ''));
    }
  }

  const needsUpdate = currentValue !== newValue || (variable.description !== (token.description || ''));
  console.log(`📋 ${variable.name}: ${currentValue} → ${newValue} [${needsUpdate ? 'UPDATE' : 'SKIP'}]`);

  return needsUpdate;
}

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

    // Group themes by collection name for proper multi-mode handling
    const themesByCollection = selectedThemeObjects.reduce<Record<string, any[]>>((acc, theme) => {
      const collectionName = theme.group ?? theme.name;
      if (!acc[collectionName]) {
        acc[collectionName] = [];
      }
      acc[collectionName].push(theme);
      return acc;
    }, {});

    // Process each collection and its modes
    for (const [collectionName, themesInCollection] of Object.entries(themesByCollection)) {
      console.log(`🔍 [DEBUG] Processing collection: ${collectionName} with ${themesInCollection.length} modes`);

      // Collect all tokens from all themes in this collection
      const allTokensInCollection = new Map<string, { token: any; theme: any }[]>();

      for (const theme of themesInCollection) {
        const tokensToCreate = generateTokensToCreate({
          theme,
          tokens,
          overallConfig,
        });

        const variablesToCreate = tokensToCreate
          .filter((token) => checkIfTokenCanCreateVariable(token, settings))
          .map((token) => mapTokensToVariableInfo(token, theme, settings));

        for (const token of variablesToCreate) {
          const tokenPath = token.path;
          if (!allTokensInCollection.has(tokenPath)) {
            allTokensInCollection.set(tokenPath, []);
          }
          allTokensInCollection.get(tokenPath)!.push({ token, theme });
        }
      }

      // Now process each unique token path and ensure all modes are handled
      for (const [tokenPath, tokenVariants] of allTokensInCollection) {
        const existingVariable = existingVariables.find((v) => (v.key === tokenVariants[0].token.variableId && !v.remote) || v.name === tokenPath);

        if (existingVariable) {
          handledVariableKeys.add(existingVariable.key);

          // Process each mode for this existing variable
          for (const { token, theme } of tokenVariants) {
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
                  value: normalizeTokenValue(token), // Use normalized value
                  rawValue: token.rawValue,
                  type: token.type,
                  parent: token.internal__Parent,
                },
              });
            }
          }
        } else {
          // This is a new variable - create entries for all modes
          for (const { token, theme } of tokenVariants) {
            changes.push({
              type: 'create',
              name: token.name,
              path: token.path,
              tokenType: token.type,
              newValue: getFormattedTokenValue(token, settings),
              description: token.description,
              collectionName,
              mode: theme.name,
              tokenData: {
                value: normalizeTokenValue(token), // Use normalized value
                rawValue: token.rawValue,
                type: token.type,
                parent: token.internal__Parent,
              },
            });
          }
        }
      }
    }
  }

  // Handle token sets (without modes)
  if (selectedSets && selectedSets.length > 0) {
    const enabledSets = selectedSets.filter((set) => set.status === TokenSetStatus.ENABLED);

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
                value: normalizeTokenValue(token), // Use normalized value
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
              value: normalizeTokenValue(token), // Use normalized value
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
          tokenType: getVariableTypeString(variable),
          currentValue: getCurrentVariableValue(variable),
          variableId: variable.id,
          collectionName: getCollectionName(variable),
        });
      }
    }
  }

  // Calculate summary
  const summary = {
    toCreate: changes.filter((c) => c.type === 'create').length,
    toUpdate: changes.filter((c) => c.type === 'update').length,
    toDelete: changes.filter((c) => c.type === 'delete').length,
  };

  return { changes, summary };
}
