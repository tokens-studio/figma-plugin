import { SingleToken } from '@/types/tokens';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import setStringValuesOnVariable from './setStringValuesOnVariable';
import { convertTokenTypeToVariableType } from '@/utils/convertTokenTypeToVariableType';
import { checkCanReferenceVariable } from '@/utils/alias/checkCanReferenceVariable';
import { TokenTypes } from '@/constants/TokenTypes';
import { transformValue } from './helpers';
import { variableWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

export type ReferenceVariableType = {
  variable: Variable;
  modeId: string;
  referenceVariable: string;
};

export default async function setValuesOnVariable(
  variablesInFigma: Variable[],
  tokens: SingleToken<true, { path: string; variableId: string }>[],
  collection: VariableCollection,
  mode: string,
  baseFontSize: string,
  shouldRename = false,
  progressTracker?: ProgressTracker | null,
  metadataUpdateTracker?: Record<string, boolean>,
  providedPlatformsByVariable?: Record<string, Set<string>>,
) {
  const variableKeyMap: Record<string, string> = {};
  const referenceVariableCandidates: ReferenceVariableType[] = [];
  const renamedVariableKeys: string[] = [];

  // Use the passed-in global progress tracker to avoid double counting
  const promises: Set<Promise<void>> = new Set();

  // Use the passed-in metadata tracker or a local one if not provided
  const codeSyntaxUpdateTracker = metadataUpdateTracker || {};

  // Pre-fetch all variables referenced by variableId to avoid individual async lookups
  const variableIdCache = new Map<string, Variable>();
  const variableIdsToFetch = new Set<string>();

  tokens.forEach((token) => {
    if (token.variableId) {
      variableIdsToFetch.add(token.variableId);
    }
  });

  // Fetch all referenced variables in parallel
  await Promise.all(
    Array.from(variableIdsToFetch).map(async (variableId) => {
      try {
        const variable = await figma.variables.getVariableByIdAsync(variableId);
        if (variable && variable.variableCollectionId === collection.id) {
          variableIdCache.set(variableId, variable);
          if (!variablesInFigma.some((v) => v.id === variable.id)) {
            variablesInFigma.push(variable);
          }
        }
      } catch (e) {
        // Variable doesn't exist or can't be accessed - skip it
      }
    }),
  );

  try {
    // Process tokens using variableWorker with higher batch size for better performance
    tokens.forEach((token) => {
      promises.add(variableWorker.schedule(async () => {
        try {
          const variableType = convertTokenTypeToVariableType(token.type, token.value);
          let variable = token.variableId
            ? variablesInFigma.find((v) => v.key === token.variableId && !v.remote)
            : variablesInFigma.find((v) => v.name === token.path);

          if (!variable && token.variableId) {
            variable = variableIdCache.get(token.variableId);
          }

          if (!variable) {
            variable = variablesInFigma.find((v) => v.name === token.path && v.variableCollectionId === collection.id);
          }

          if (!variable) {
            try {
              variable = figma.variables.createVariable(token.path, collection, variableType);
              variablesInFigma.push(variable);
            } catch (e) {
              const existingVariable = figma.variables.getLocalVariables().find(
                (v) => v.name === token.path && v.variableCollectionId === collection.id,
              );
              if (existingVariable) {
                variable = existingVariable;
                variablesInFigma.push(variable);
              } else {
                throw e;
              }
            }
          }

          if (variable) {
            variableKeyMap[token.name] = variable.key;

            if (variable.name !== token.path && shouldRename) {
              renamedVariableKeys.push(variable.key);
              variable.name = token.path;
            }

            variable.description = token.description ?? '';

            // Track whether metadata (scopes or codeSyntax) has changed in Figma compared to token
            let hasMetadataNeedsChange = false;

            // 1. Detect scope changes
            const figmaExtensions = token.$extensions?.['com.figma'];
            if (figmaExtensions?.scopes && Array.isArray(figmaExtensions.scopes)) {
              const currentScopes = variable.scopes || [];
              let newScopes = figmaExtensions.scopes as VariableScope[];

              // ALL_SCOPES normalization: Figma uses an empty array [] to represent all/unrestricted scopes.
              if (newScopes.includes('ALL_SCOPES' as VariableScope)) {
                newScopes = [];
              }

              // Figma constraint normalization
              if (newScopes.includes('ALL_FILLS' as VariableScope)) {
                newScopes = newScopes.filter((s) => !['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL'].includes(s));
              }
              if (newScopes.includes('ALL_STROKES' as VariableScope)) {
                newScopes = newScopes.filter((s) => s !== 'STROKE_COLOR');
              }

              const isScopesSame = newScopes.length === currentScopes.length
                && newScopes.every((scope) => currentScopes.includes(scope));

              if (!isScopesSame) {
                hasMetadataNeedsChange = true;
              }
            }

            // 2. Detect code syntax changes
            if (figmaExtensions?.codeSyntax && typeof figmaExtensions.codeSyntax === 'object') {
              const newCodeSyntax = figmaExtensions.codeSyntax;
              const currentCodeSyntax = (variable as any).codeSyntax || {};
              const platformsToCheck = [
                { key: 'Web', figma: 'WEB' },
                { key: 'Android', figma: 'ANDROID' },
                { key: 'iOS', figma: 'iOS' },
              ] as const;

              platformsToCheck.forEach(({ key, figma: figmaPlatform }) => {
                const syntax = (newCodeSyntax as any)[key] !== undefined
                  ? (newCodeSyntax as any)[key]
                  : (newCodeSyntax as any)[key.toLowerCase()];

                // Aggregation: Only skip if strictly undefined. Empty string "" means explicit clearing.
                if (syntax !== undefined) {
                  const valueToSet = (typeof syntax === 'string') ? syntax.trim() : '';
                  const currentVal = currentCodeSyntax[figmaPlatform] || '';
                  if (currentVal !== valueToSet) {
                    hasMetadataNeedsChange = true;
                  }
                }
              });
            }

            const hasMetadataChanged = hasMetadataNeedsChange || !!codeSyntaxUpdateTracker[variable.id];

            const existingVariableValue = variable.valuesByMode[mode];
            const rawValue = typeof token.rawValue === 'string' ? token.rawValue : undefined;

            if (!hasMetadataChanged && checkVariableAliasEquality(existingVariableValue, rawValue)) {
              return;
            }

            switch (variableType) {
              case 'BOOLEAN':
                if (typeof token.value === 'string' && !token.value.includes('{')) {
                  setBooleanValuesOnVariable(variable, mode, token.value, hasMetadataChanged);
                }
                break;
              case 'COLOR':
                if (typeof token.value === 'string' && !token.value.includes('{')) {
                  setColorValuesOnVariable(variable, mode, token.value, hasMetadataChanged);
                }
                break;
              case 'FLOAT': {
                const value = String(token.value);
                if (typeof value === 'string' && !value.includes('{')) {
                  const transformedValue = transformValue(value, token.type, baseFontSize, true);
                  setNumberValuesOnVariable(variable, mode, Number(transformedValue), hasMetadataChanged);
                }
                break;
              }
              case 'STRING':
                if (typeof token.value === 'string' && !token.value.includes('{')) {
                  setStringValuesOnVariable(variable, mode, token.value, hasMetadataChanged);
                } else if (token.type === TokenTypes.FONT_WEIGHTS && Array.isArray(token.value)) {
                  setStringValuesOnVariable(variable, mode, token.value[0], hasMetadataChanged);
                }
                break;
              default:
                break;
            }

            // Atomic metadata update
            if (variable) {
              const currentVar: Variable = variable;
              // Avoid redundant metadata updates for the same variable in the same run (e.g. across multiple modes)
              if (!codeSyntaxUpdateTracker[currentVar.id]) {
                try {
                  // Update Scopes
                  if (figmaExtensions && figmaExtensions.scopes && Array.isArray(figmaExtensions.scopes)) {
                    let newScopes = figmaExtensions.scopes as VariableScope[];
                    if (newScopes.includes('ALL_SCOPES' as VariableScope)) {
                      newScopes = [];
                    }
                    if (newScopes.includes('ALL_FILLS' as VariableScope)) {
                      newScopes = newScopes.filter((s) => !['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL'].includes(s));
                    }
                    if (newScopes.includes('ALL_STROKES' as VariableScope)) {
                      newScopes = newScopes.filter((s) => s !== 'STROKE_COLOR');
                    }
                    const currentScopes = currentVar.scopes || [];
                    const isScopesSame = newScopes.length === currentScopes.length
                      && newScopes.every((s) => currentScopes.includes(s));

                    if (!isScopesSame) {
                      currentVar.scopes = newScopes;
                      codeSyntaxUpdateTracker[currentVar.id] = true;
                    }
                  }

                  // Update Code Syntax & Purge Orphans (Always run if variable matched)
                  const platformsToCheck = [
                    { key: 'Web', figma: 'WEB' },
                    { key: 'Android', figma: 'ANDROID' },
                    { key: 'iOS', figma: 'iOS' },
                  ] as const;

                  const newCodeSyntax = figmaExtensions?.codeSyntax || {};
                  platformsToCheck.forEach(({ key, figma: figmaPlatform }) => {
                    // Check if the key exists in the object (using case-insensitive lookup)
                    const hasKey = Object.prototype.hasOwnProperty.call(newCodeSyntax, key);
                    const hasKeyLowercase = Object.prototype.hasOwnProperty.call(newCodeSyntax, key.toLowerCase());
                    const keyExists = hasKey || hasKeyLowercase;

                    const syntaxValue = hasKey
                      ? (newCodeSyntax as any)[key]
                      : (newCodeSyntax as any)[key.toLowerCase()];

                    const currentSyntaxValue = (currentVar as any).codeSyntax?.[figmaPlatform] || '';
                    const valueToSet = (typeof syntaxValue === 'string') ? syntaxValue.trim() : '';

                    if (keyExists && syntaxValue !== undefined) {
                      // Platform is EXPLICITLY provided in this token with a defined value (could be a value or empty string)
                      if (currentSyntaxValue !== valueToSet) {
                        try {
                          if (valueToSet === '') {
                            if (currentSyntaxValue) {
                              console.log(`[TRACE-BULK] Removing ${key} from ${currentVar.name} in ${collection.name}. Current syntax:`, JSON.stringify(currentVar.codeSyntax));
                              currentVar.removeVariableCodeSyntax(figmaPlatform);
                              console.log(`[TRACE-BULK] Result for ${currentVar.name}:`, JSON.stringify(currentVar.codeSyntax));
                            }
                          } else {
                            console.log(`[TRACE-BULK] Setting ${key} for ${currentVar.name} to "${valueToSet}"`);
                            currentVar.setVariableCodeSyntax(figmaPlatform, valueToSet);
                          }
                          codeSyntaxUpdateTracker[currentVar.id] = true;
                        } catch (apiError) {
                          console.error(`Failed to set code syntax for ${key}:`, apiError);
                        }
                      }
                    } else if (keyExists && syntaxValue === undefined) {
                      // Platform is EXPLICITLY set to undefined - skip this platform (do nothing)
                      // This is used for token aggregation scenarios where we want to leave the platform as-is
                    } else if (currentSyntaxValue) {
                      // Platform is MISSING from this token (key doesn't exist at all)
                      const providedPlatforms = providedPlatformsByVariable?.[token.name];
                      if (!providedPlatforms || !providedPlatforms.has(key.toLowerCase())) {
                        try {
                          console.log(`[TRACE-BULK] Orphan Purge: Removing ${key} from ${currentVar.name} in ${collection.name}. Current syntax:`, JSON.stringify(currentVar.codeSyntax));
                          currentVar.removeVariableCodeSyntax(figmaPlatform);
                          console.log(`[TRACE-BULK] Result for ${currentVar.name}:`, JSON.stringify(currentVar.codeSyntax));
                          codeSyntaxUpdateTracker[currentVar.id] = true;
                        } catch (apiError) {
                          const errorMsg = String(apiError);
                          if (!errorMsg.includes('Code syntax field not found')) {
                            console.error(`[TRACE-BULK] Failed to purge orphan ${key} for ${currentVar.name}:`, apiError);
                          }
                        }
                      }
                    }
                  });
                } catch (e) {
                  console.error('Failed to update metadata:', e);
                }
              }
            }

            let referenceTokenName: string = '';
            if (token.rawValue && token.rawValue?.toString().startsWith('{')) {
              referenceTokenName = token.rawValue?.toString().slice(1, token.rawValue.toString().length - 1);
            } else {
              referenceTokenName = (token.rawValue ?? '').toString().substring(1);
            }

            if (token && checkCanReferenceVariable(token)) {
              referenceVariableCandidates.push({
                variable,
                modeId: mode,
                referenceVariable: referenceTokenName,
              });
            }
          }
        } catch (e) {
          console.error('Error processing variable token:', e);
        } finally {
          if (progressTracker) {
            progressTracker.next();
            progressTracker.reportIfNecessary();
          }
        }
      }));
    });

    await Promise.all(promises);
    await variableWorker.flush();
  } catch (e) {
    console.error('Setting values on variable failed', e);
  }

  return {
    renamedVariableKeys,
    variableKeyMap,
    referenceVariableCandidates,
  };
}
