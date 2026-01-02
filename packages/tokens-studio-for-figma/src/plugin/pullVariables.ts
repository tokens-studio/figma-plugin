/* eslint-disable no-continue */
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { notifyVariableValues, notifyRenamedCollections } from './notifiers';
import { PullVariablesOptions, ThemeObjectsList } from '@/types';
import { VariableToCreateToken } from '@/types/payloads';
import { TokenTypes } from '@/constants/TokenTypes';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { normalizeVariableName } from '@/utils/normalizeVariableName';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getCollectionVariableIds, isExtendedCollection, getParentVariableCollectionId } from './extendedCollectionHelpers';

export default async function pullVariables(options: PullVariablesOptions, themes: ThemeObjectsList, proUser: boolean): Promise<void> {
  // @TODO should be specifically typed according to their type
  const colors: VariableToCreateToken[] = [];
  const booleans: VariableToCreateToken[] = [];
  const strings: VariableToCreateToken[] = [];
  const numbers: VariableToCreateToken[] = [];
  const dimensions: VariableToCreateToken[] = [];

  let baseRem = 16;
  if (options.useRem) {
    const uiSettings = await figma.clientStorage.getAsync('uiSettings');
    const settings = JSON.parse(await uiSettings);
    if (settings?.baseFontSize) {
      const baseFontSizeValue = typeof settings.baseFontSize === 'number'
        ? settings.baseFontSize
        : parseFloat(settings.baseFontSize);

      baseRem = !isNaN(baseFontSizeValue) ? Number(baseFontSizeValue) : 16;
    }
  }

  // Fallback to all local variables when no specific collections selected
  const localVariables = await getVariablesWithoutZombies();

  const collections = new Map<string, {
    id: string,
    name: string,
    modes: { name: string, modeId: string }[],
    parentCollectionId?: string,
    isExtended?: boolean,
  }>();

  // Cache for collection lookups
  const collectionsCache = new Map<string, VariableCollection>();

  // Cache for variable lookups
  const variablesCache = new Map<string, Variable>();
  localVariables.forEach((v) => variablesCache.set(v.id, v));

  /**
   * Get effective values for a variable in the context of a collection.
   * For extended collections, uses valuesByModeForCollectionAsync to get overridden values.
   * For base collections, falls back to valuesByMode.
   */
  async function getEffectiveValuesByMode(
    variable: Variable,
    collection: VariableCollection,
    targetIsExtended: boolean,
  ): Promise<Record<string, VariableValue>> {
    // For extended collections, use the async method to get effective values with overrides
    if (targetIsExtended && typeof variable.valuesByModeForCollectionAsync === 'function') {
      try {
        return await variable.valuesByModeForCollectionAsync(collection);
      } catch {
        // Fallback to valuesByMode if the async method fails
        return variable.valuesByMode;
      }
    }
    // For base collections (non-extended), use valuesByMode directly
    return variable.valuesByMode;
  }

  /**
   * Process a single variable value and add it to the appropriate token array
   */
  function processVariableValue(
    variable: Variable,
    value: VariableValue,
    modeName: string,
    collectionName: string,
  ): void {
    const variableName = normalizeVariableName(variable.name);
    const parent = `${collectionName}/${modeName}`;

    try {
      switch (variable.resolvedType) {
        case 'COLOR': {
          let tokenValue;
          if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
            const alias = figma.variables.getVariableById(value.id);
            tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
          } else {
            tokenValue = figmaRGBToHex(value as RGBA);
          }
          if (tokenValue) {
            colors.push({
              name: variableName,
              value: tokenValue as string,
              type: TokenTypes.COLOR,
              parent,
              ...(variable.description ? { description: variable.description } : {}),
            });
          }
          break;
        }
        case 'BOOLEAN': {
          let tokenValue;
          if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
            const alias = figma.variables.getVariableById(value.id);
            tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
          } else {
            tokenValue = JSON.stringify(value);
          }
          booleans.push({
            name: variableName,
            value: tokenValue,
            type: TokenTypes.BOOLEAN,
            parent,
            ...(variable.description ? { description: variable.description } : {}),
          });
          break;
        }
        case 'STRING': {
          let tokenValue;
          if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
            const alias = figma.variables.getVariableById(value.id);
            tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
          } else {
            tokenValue = value;
          }
          strings.push({
            name: variableName,
            value: tokenValue as string,
            type: TokenTypes.TEXT,
            parent,
            ...(variable.description ? { description: variable.description } : {}),
          });
          break;
        }
        case 'FLOAT': {
          let tokenValue: string | number = value as number;
          if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
            const alias = figma.variables.getVariableById(value.id);
            tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
          } else if (typeof value === 'number') {
            if (options.useRem) {
              tokenValue = `${Number((Number(tokenValue) / parseFloat(String(baseRem))).toFixed(3))}rem`;
            } else if (options.useDimensions) {
              tokenValue = `${Number(tokenValue.toFixed(3))}px`;
            } else {
              tokenValue = Number(tokenValue.toFixed(3));
            }
          }
          if (options.useDimensions || options.useRem) {
            dimensions.push({
              name: variableName,
              value: tokenValue as string,
              type: TokenTypes.DIMENSION,
              parent,
              ...(variable.description ? { description: variable.description } : {}),
            });
          } else {
            numbers.push({
              name: variableName,
              value: tokenValue as string,
              type: TokenTypes.NUMBER,
              parent,
              ...(variable.description ? { description: variable.description } : {}),
            });
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error('Error while processing variable:', variableName, error);
    }
  }

  // COLLECTION-DRIVEN APPROACH: Iterate over selected collections
  if (options.selectedCollections) {
    const selectedCollectionIds = Object.keys(options.selectedCollections);

    for (const collectionId of selectedCollectionIds) {
      // Get the full collection data
      let collectionData = collectionsCache.get(collectionId);
      if (!collectionData) {
        const fetchedCollection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
        if (fetchedCollection) {
          collectionData = fetchedCollection;
          collectionsCache.set(collectionId, fetchedCollection);
        }
      }

      if (!collectionData) continue;

      const targetIsExtended = isExtendedCollection(collectionData);
      const parentCollectionId = getParentVariableCollectionId(collectionData);

      // Store collection info for theme creation
      const collectionInfo = {
        id: collectionData.id,
        name: collectionData.name,
        modes: collectionData.modes.map((mode) => ({ name: mode.name, modeId: mode.modeId })),
        parentCollectionId,
        isExtended: targetIsExtended,
      };
      collections.set(collectionData.name, collectionInfo);

      // Get variable IDs for this collection (includes inherited variables for extended collections)
      const variableIds = getCollectionVariableIds(collectionData);
      const selectedModes = options.selectedCollections[collectionId].selectedModes;

      // Process each variable in the collection
      for (const variableId of variableIds) {
        // Try to get variable from cache first, then fetch if needed
        let variable = variablesCache.get(variableId);
        if (!variable) {
          const fetchedVariable = await figma.variables.getVariableByIdAsync(variableId);
          if (fetchedVariable) {
            variable = fetchedVariable;
            variablesCache.set(variableId, fetchedVariable);
          }
        }

        if (!variable) continue;

        // Get effective values for this variable in the context of the target collection
        const effectiveValues = await getEffectiveValuesByMode(variable, collectionData, targetIsExtended);

        // Process each selected mode
        for (const modeId of selectedModes) {
          // Find mode name - for extended collections, modes have different IDs but same names
          const mode = collectionData.modes.find((m) => m.modeId === modeId);
          if (!mode) continue;

          const value = effectiveValues[modeId];
          if (value === undefined) continue;

          processVariableValue(variable, value, mode.name, collectionData.name);
        }
      }
    }
  } else {
    // Fallback: Original variable-driven approach when no specific collections selected
    for (const variable of localVariables) {
      let collectionData = collectionsCache.get(variable.variableCollectionId);
      if (!collectionData) {
        const fetchedCollection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
        if (fetchedCollection) {
          collectionData = fetchedCollection;
          collectionsCache.set(variable.variableCollectionId, fetchedCollection);
        }
      }

      if (!collectionData) continue;

      const collectionInfo = {
        id: collectionData.id,
        name: collectionData.name,
        modes: collectionData.modes.map((mode) => ({ name: mode.name, modeId: mode.modeId })),
      };
      collections.set(collectionData.name, collectionInfo);

      // Process each mode
      for (const mode of collectionData.modes) {
        const value = variable.valuesByMode[mode.modeId];
        if (value === undefined) continue;

        processVariableValue(variable, value, mode.name, collectionData.name);
      }
    }
  }

  const stylesObject = {
    colors,
    booleans,
    strings,
    numbers,
    dimensions,
  };

  type ResultObject = Record<string, VariableToCreateToken[]>;

  const renamedCollections = new Map<string, string>();

  // Track which themes have been processed to avoid duplicate renames
  const processedThemes = new Set<string>();

  const themesToCreate: ThemeObjectsList = [];
  // Process themes if pro user
  if (proUser) {
    const themeInfo = await AsyncMessageChannel.PluginInstance.message({
      type: AsyncMessageTypes.GET_THEME_INFO,
    });

    // Extract token sets from themes
    const existingTokenSets = new Set<string>();
    const activeTokenSets = new Set<string>();

    themeInfo.themes?.forEach((theme) => {
      Object.entries(theme.selectedTokenSets || {}).forEach(([tokenSet, status]) => {
        existingTokenSets.add(tokenSet);
        // Track which token sets are active
        if (status === TokenSetStatus.ENABLED) {
          activeTokenSets.add(tokenSet);
        }
      });
    });

    await Promise.all(Array.from(collections.values()).map(async (collection) => {
      // Filter collections based on selectedCollections option
      if (options.selectedCollections) {
        const selectedCollection = options.selectedCollections[collection.id];
        if (!selectedCollection) {
          return; // Skip this collection if it's not selected
        }
      }

      // Get the full collection data to access variableIds (includes inherited variables)
      let collectionData = collectionsCache.get(collection.id);
      if (!collectionData) {
        const fetchedCollection = await figma.variables.getVariableCollectionByIdAsync(collection.id);
        if (fetchedCollection) {
          collectionData = fetchedCollection;
          collectionsCache.set(collection.id, fetchedCollection);
        }
      }

      // Get variable IDs for this collection (includes inherited for extended collections)
      const variableIds = collectionData ? getCollectionVariableIds(collectionData) : [];

      // Build variable references from variableIds (works for both base and extended collections)
      const variableReferencesPromises = variableIds.map(async (varId) => {
        let variable = variablesCache.get(varId);
        if (!variable) {
          const fetchedVariable = await figma.variables.getVariableByIdAsync(varId);
          if (fetchedVariable) {
            variable = fetchedVariable;
            variablesCache.set(varId, fetchedVariable);
          }
        }
        return variable ? { name: normalizeVariableName(variable.name), key: variable.key } : null;
      });

      const variableRefsArray = (await Promise.all(variableReferencesPromises)).filter(Boolean);
      const variableReferences = variableRefsArray.reduce((acc, ref) => ({
        ...acc,
        [ref!.name]: ref!.key,
      }), {} as Record<string, string>);

      await Promise.all(collection.modes.map(async (mode) => {
        // Filter modes based on selectedCollections option
        if (options.selectedCollections) {
          const selectedCollection = options.selectedCollections[collection.id];
          if (selectedCollection && !selectedCollection.selectedModes.includes(mode.modeId)) {
            return; // Skip this mode if it's not selected
          }
        }

        const tokenSetName = `${collection.name}/${mode.name}`;
        const themeId = `${collection.name.toLowerCase()}-${mode.name.toLowerCase()}`;

        processedThemes.add(`${collection.id}:${mode.modeId}`);

        // Check if there's an existing theme with the same collection ID and mode ID but different token set name
        const matchingTheme = themeInfo.themes?.find((t) => t.$figmaCollectionId === collection.id
          && t.$figmaModeId === mode.modeId);

        if (matchingTheme) {
          // Find token sets in this theme that are different from the current token set name
          Object.keys(matchingTheme.selectedTokenSets || {}).forEach((existingTokenSet) => {
            if (existingTokenSet !== tokenSetName
                && existingTokenSet.includes('/')
                && !renamedCollections.has(existingTokenSet)
                && !Array.from(renamedCollections.values()).includes(tokenSetName)) {
              renamedCollections.set(existingTokenSet, tokenSetName);
            }
          });
        }

        // Track this collection/mode combination
        // Include parent collection ID for extended collections
        const themeToCreate = {
          id: themeId,
          name: mode.name,
          group: collection.name,
          selectedTokenSets: {
            [tokenSetName]: TokenSetStatus.ENABLED,
          },
          $figmaStyleReferences: {},
          $figmaVariableReferences: variableReferences,
          $figmaModeId: mode.modeId,
          $figmaCollectionId: collection.id,
          ...(collection.parentCollectionId ? { $figmaParentCollectionId: collection.parentCollectionId } : {}),
        };
        themesToCreate.push(themeToCreate);
      }));
    }));

    const currentTokenSets = new Set(themesToCreate.map((theme) => `${theme.group}/${theme.name}`));
    for (const existingSet of existingTokenSets) {
      if (renamedCollections.has(existingSet)) {
        continue;
      }

      if (existingSet.includes('/') && !currentTokenSets.has(existingSet)) {
        // Find matching theme by collection ID and mode ID only
        const matchingTheme = themeInfo.themes?.find((t) => {
          if (!t.$figmaCollectionId || !t.$figmaModeId) {
            return false;
          }

          const hasMatchingCurrentTheme = themesToCreate.some((currentTheme) => currentTheme.$figmaCollectionId === t.$figmaCollectionId
            && currentTheme.$figmaModeId === t.$figmaModeId);

          return hasMatchingCurrentTheme && Object.keys(t.selectedTokenSets || {}).includes(existingSet);
        });

        if (matchingTheme) {
          const currentTheme = themesToCreate.find((t) => t.$figmaCollectionId === matchingTheme.$figmaCollectionId
            && t.$figmaModeId === matchingTheme.$figmaModeId);

          if (currentTheme) {
            const newSet = `${currentTheme.group}/${currentTheme.name}`;
            if (currentTokenSets.has(newSet)) {
              renamedCollections.set(existingSet, newSet);
              continue;
            }
          }
        }
      }
    }
  }

  try {
    const processedTokens = Object.entries(stylesObject).reduce<ResultObject>((acc, [key, value]) => {
      if (value.length > 0) {
        acc[key] = value;
      }
      return acc;
    }, {});

    notifyVariableValues(
      processedTokens,
      themesToCreate,
    );

    if (renamedCollections.size > 0) {
      notifyRenamedCollections(Array.from(renamedCollections.entries()));
    }
  } catch (error) {
    console.error('Error processing results:', error);
    notifyVariableValues({});
  }
}
