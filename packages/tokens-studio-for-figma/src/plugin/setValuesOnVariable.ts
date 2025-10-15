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
) {
  const variableKeyMap: Record<string, string> = {};
  const referenceVariableCandidates: ReferenceVariableType[] = [];
  const renamedVariableKeys: string[] = [];

  // Use the passed-in global progress tracker to avoid double counting
  const promises: Set<Promise<void>> = new Set();

  // Pre-fetch all variables referenced by variableId to avoid individual async lookups
  // This is much more efficient than fetching one-by-one during token processing
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
          // Add to local cache if not already present
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
          // If id matches the variableId, or name matches the token path, we can use it to update the variable instead of re-creating.
          // Prioritize finding by variableId (key) when present, otherwise fall back to name matching
          // This has the nasty side-effect that if font weight changes from string to number, it will not update the variable given we cannot change type.
          // In that case, we should delete the variable and re-create it.
          let variable = token.variableId
            ? variablesInFigma.find((v) => v.key === token.variableId && !v.remote)
            : variablesInFigma.find((v) => v.name === token.path);

          // If not found in local collection, check the pre-fetched cache
          if (!variable && token.variableId) {
            variable = variableIdCache.get(token.variableId);
          }

          // If still no variable, try one more time to find by name in case it was just created
          if (!variable) {
            variable = variablesInFigma.find((v) => v.name === token.path && v.variableCollectionId === collection.id);
          }

          if (!variable) {
            try {
              variable = figma.variables.createVariable(token.path, collection, variableType);
              // Add to local cache immediately
              variablesInFigma.push(variable);
            } catch (e) {
              // If creation fails (e.g., duplicate name), try to find the existing variable by name one more time
              // This can happen if the variable was created in a previous run but the reference wasn't saved
              const existingVariable = figma.variables.getLocalVariables().find(
                (v) => v.name === token.path && v.variableCollectionId === collection.id,
              );
              if (existingVariable) {
                variable = existingVariable;
                variablesInFigma.push(variable);
              } else {
                throw e; // Re-throw if we still can't find/create the variable
              }
            }
          }

          if (variable) {
            // First, rename all variables that should be renamed (if the user choose to do so)
            if (variable.name !== token.path && shouldRename) {
              renamedVariableKeys.push(variable.key);
              variable.name = token.path;
            }
            if (variableType !== variable?.resolvedType) {
              // TODO: There's an edge case where the user had created a variable based on a numerical weight leading to a float variable,
              // if they later change it to a string, we cannot update the variable type. Theoretically we should remove and recreate, but that would lead to broken variables?
              // If we decide to remove, the following would work.
              // variable.remove();
              // variable = figma.variables.createVariable(t.path, collection.id, variableType);
            }
            variable.description = token.description ?? '';

            // Always add the variable to the key map, regardless of whether it needs updating
            variableKeyMap[token.name] = variable.key;

            // Check if the variable already has the correct alias reference before updating
            const existingVariableValue = variable.valuesByMode[mode];
            const rawValue = typeof token.rawValue === 'string' ? token.rawValue : undefined;

            if (checkVariableAliasEquality(existingVariableValue, rawValue)) {
              // The alias already points to the correct variable, no update needed
              return;
            }

            switch (variableType) {
              case 'BOOLEAN':
                if (typeof token.value === 'string' && !token.value.includes('{')) {
                  setBooleanValuesOnVariable(variable, mode, token.value);
                }
                break;
              case 'COLOR':
                if (typeof token.value === 'string' && !token.value.includes('{')) {
                  setColorValuesOnVariable(variable, mode, token.value);
                }
                break;
              case 'FLOAT': {
                const value = String(token.value);
                if (typeof value === 'string' && !value.includes('{')) {
                  const transformedValue = transformValue(value, token.type, baseFontSize, true);
                  setNumberValuesOnVariable(variable, mode, Number(transformedValue));
                }
                break;
              }
              case 'STRING':
                if (typeof token.value === 'string' && !token.value.includes('{')) {
                  setStringValuesOnVariable(variable, mode, token.value);
                  // Given we cannot determine the combined family of a variable, we cannot use fallback weights from our estimates.
                  // This is not an issue because users can set numerical font weights with variables, so we opt-out of the guesswork and just apply the numerical weight.
                } else if (token.type === TokenTypes.FONT_WEIGHTS && Array.isArray(token.value)) {
                  setStringValuesOnVariable(variable, mode, token.value[0]);
                }
                break;
              default:
                break;
            }
            let referenceTokenName: string = '';
            if (token.rawValue && token.rawValue?.toString().startsWith('{')) {
              referenceTokenName = token.rawValue?.toString().slice(1, token.rawValue.toString().length - 1);
            } else {
              referenceTokenName = token.rawValue!.toString().substring(1);
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
          // Use global progress tracker if available
          if (progressTracker) {
            progressTracker.next();
            progressTracker.reportIfNecessary();
          }
        }
      }));
    });

    await Promise.all(promises);

    // Ensure variableWorker completes all batched work before returning
    // Critical for sequential theme/mode processing to prevent value mixing
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
