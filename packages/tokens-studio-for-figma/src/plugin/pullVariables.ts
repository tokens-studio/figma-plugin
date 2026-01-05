/* eslint-disable no-continue */
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { notifyVariableValues, notifyRenamedCollections } from './notifiers';
import { PullVariablesOptions, ThemeObjectsList, ThemeObject } from '@/types';
import { VariableToCreateToken } from '@/types/payloads';
import { TokenTypes } from '@/constants/TokenTypes';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { normalizeVariableName } from '@/utils/normalizeVariableName';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { processExtendedCollectionImport, separateCollectionsByType } from './extendedCollections';

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

  const localVariables = await getVariablesWithoutZombies();

  // CRITICAL FIX: Fetch ALL collections upfront
  // Extended collections don't have their own variables (only overrides),
  // so we can't discover them by iterating through variables
  const allFigmaCollections = await figma.variables.getLocalVariableCollectionsAsync();



  const collections = new Map<string, {
    id: string,
    name: string,
    modes: { name: string, modeId: string, parentModeId?: string }[],
    isExtension?: boolean,
    parentCollectionId?: string,
    variableOverrides?: { [variableId: string]: { [modeId: string]: any } }
  }>();

  // Process all collections
  for (const collectionData of allFigmaCollections) {
    const extendedCollection = collectionData as any;

    // DEBUG: Log all properties to see what Figma exposes


    const collection = {
      id: collectionData.id,
      name: collectionData.name,
      modes: collectionData.modes.map((mode) => ({
        name: mode.name,
        modeId: mode.modeId,
        parentModeId: (mode as any).parentModeId,
      })),
      isExtension: extendedCollection.isExtension || false,
      parentCollectionId: extendedCollection.isExtension
        ? extendedCollection.parentVariableCollectionId
        : undefined,
      // Store variable overrides for extended collections  
      variableOverrides: extendedCollection.isExtension
        ? extendedCollection.variableOverrides
        : undefined,
    };

    // Debug logging for extended collections
    if (collection.isExtension) {

    }

    collections.set(collection.name, collection);
  }

  // Cache for collection lookups by ID
  const collectionsCache = new Map<string, typeof collections extends Map<string, infer T> ? T : never>();
  collections.forEach((collection) => {
    collectionsCache.set(collection.id, collection);
  });

  for (const variable of localVariables) {
    const collection = collectionsCache.get(variable.variableCollectionId);

    // Filter collections and modes based on selectedCollections option
    if (options.selectedCollections && collection) {
      const selectedCollection = options.selectedCollections[collection.id];
      if (!selectedCollection) {
        // eslint-disable-next-line no-continue
        continue; // Skip this collection if it's not selected
      }
    }

    // CRITICAL: Also process this variable for extended collections that inherit from this collection
    // Extended collections don't have their own variables, they just override mode values
    const collectionsToProcess: typeof collection[] = collection ? [collection] : [];

    // Find extended collections that extend this collection
    if (collection) {
      collections.forEach((extCollection) => {
        if (extCollection.isExtension && extCollection.parentCollectionId === collection.id) {
          collectionsToProcess.push(extCollection);
        }
      });
    }

    if (collectionsToProcess.length > 1) {

    }

    const variableName = normalizeVariableName(variable.name);

    // Process the variable for each collection (parent + extended collections)
    for (const collectionToProcess of collectionsToProcess) {
      try {
        switch (variable.resolvedType) {
          case 'COLOR':
            Object.entries(variable.valuesByMode).forEach(([parentModeId, value]) => {
              // For extended collections, we need to map parent mode ID to child mode ID
              // The 'mode' from valuesByMode is the parent collection's mode ID
              // Extended collections have different mode IDs but reference the parent via parentModeId
              let actualModeId = parentModeId;
              if (collectionToProcess?.isExtension) {
                // Find the child mode that references this parent mode
                const childMode = collectionToProcess.modes.find((m) => m.parentModeId === parentModeId);
                if (!childMode) {
                  console.warn(`⚠️ Could not map parent mode ${parentModeId} to child mode in ${collectionToProcess.name}`);
                  return; // Skip this mode for this collection
                }
                actualModeId = childMode.modeId;
              }

              // Filter modes based on selectedCollections option
              if (options.selectedCollections && collectionToProcess) {
                const selectedCollection = options.selectedCollections[collectionToProcess.id];
                if (selectedCollection && !selectedCollection.selectedModes.includes(actualModeId)) {
                  return; // Skip this mode if it's not selected
                }
              }

              // CRITICAL: For extended collections, check for overridden values first
              let actualValue = value;
              if (collectionToProcess?.isExtension && collectionToProcess.variableOverrides) {
                const override = collectionToProcess.variableOverrides[variable.id]?.[actualModeId];
                if (override !== undefined) {
                  actualValue = override;
                }
              }

              let tokenValue;

              if (typeof actualValue === 'object' && 'type' in actualValue && actualValue.type === 'VARIABLE_ALIAS') {
                const alias = figma.variables.getVariableById(actualValue.id);
                tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
              } else {
                tokenValue = figmaRGBToHex(actualValue as RGBA);
              }

              const modeName = collectionToProcess?.modes.find((m) => m.modeId === actualModeId)?.name;
              if (tokenValue) {
                const parent = `${collectionToProcess?.name}/${modeName}`;

                colors.push({
                  name: variableName,
                  value: tokenValue as string,
                  type: TokenTypes.COLOR,
                  parent,
                  ...(variable.description ? { description: variable.description } : {}),
                });
              }
            });
            break;
          case 'BOOLEAN':
            Object.entries(variable.valuesByMode).forEach(([parentModeId, value]) => {
              // Map parent mode ID to child mode ID for extended collections
              let actualModeId = parentModeId;
              if (collectionToProcess?.isExtension) {
                const childMode = collectionToProcess.modes.find((m) => m.parentModeId === parentModeId);
                if (!childMode) {
                  return;
                }
                actualModeId = childMode.modeId;
              }

              // Filter modes based on selectedCollections option
              if (options.selectedCollections && collectionToProcess) {
                const selectedCollection = options.selectedCollections[collectionToProcess.id];
                if (selectedCollection && !selectedCollection.selectedModes.includes(actualModeId)) {
                  return; // Skip this mode if it's not selected
                }
              }

              const modeName = collectionToProcess?.modes.find((m) => m.modeId === actualModeId)?.name;
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
                parent: `${collectionToProcess?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
              });
            });
            break;
          case 'STRING':
            Object.entries(variable.valuesByMode).forEach(([parentModeId, value]) => {
              // Map parent mode ID to child mode ID for extended collections
              let actualModeId = parentModeId;
              if (collectionToProcess?.isExtension) {
                const childMode = collectionToProcess.modes.find((m) => m.parentModeId === parentModeId);
                if (!childMode) {
                  return;
                }
                actualModeId = childMode.modeId;
              }

              // Filter modes based on selectedCollections option
              if (options.selectedCollections && collectionToProcess) {
                const selectedCollection = options.selectedCollections[collectionToProcess.id];
                if (selectedCollection && !selectedCollection.selectedModes.includes(actualModeId)) {
                  return; // Skip this mode if it's not selected
                }
              }

              const modeName = collectionToProcess?.modes.find((m) => m.modeId === actualModeId)?.name;
              let tokenValue;
              if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
                const alias = figma.variables.getVariableById(value.id);
                tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
              } else {
                tokenValue = String(value);
              }

              strings.push({
                name: variableName,
                value: tokenValue as string,
                type: TokenTypes.TEXT,
                parent: `${collectionToProcess?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
              });
            });
            break;
          case 'FLOAT':
            Object.entries(variable.valuesByMode).forEach(([parentModeId, value]) => {
              // Map parent mode ID to child mode ID for extended collections
              let actualModeId = parentModeId;
              if (collectionToProcess?.isExtension) {
                const childMode = collectionToProcess.modes.find((m) => m.parentModeId === parentModeId);
                if (!childMode) {
                  return;
                }
                actualModeId = childMode.modeId;
              }

              // Filter modes based on selectedCollections option
              if (options.selectedCollections && collectionToProcess) {
                const selectedCollection = options.selectedCollections[collectionToProcess.id];
                if (selectedCollection && !selectedCollection.selectedModes.includes(actualModeId)) {
                  return; // Skip this mode if it's not selected
                }
              }

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

              const modeName = collectionToProcess?.modes.find((m) => m.modeId === actualModeId)?.name;

              if (options.useDimensions && typeof tokenValue === 'string' && tokenValue.endsWith('px')) {
                dimensions.push({
                  name: variableName,
                  value: tokenValue as string,
                  type: TokenTypes.DIMENSION,
                  parent: `${collectionToProcess?.name}/${modeName}`,
                  ...(variable.description ? { description: variable.description } : {}),
                });
              } else {
                numbers.push({
                  name: variableName,
                  value: tokenValue as string,
                  type: TokenTypes.NUMBER,
                  parent: `${collectionToProcess?.name}/${modeName}`,
                  ...(variable.description ? { description: variable.description } : {}),
                });
              }
            });
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error while processing variable:', variableName, error);
      }
    } // End of collectionsToProcess loop
  } // End of localVariables loop

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

    // Process collections in two passes to ensure parent themes are created before child themes
    const { regularCollections, extendedCollections } = separateCollectionsByType(
      Array.from(collections.values()),
    );



    // Helper function to process a collection and create themes
    const processCollection = async (collection: typeof regularCollections[0]) => {
      // Filter collections based on selectedCollections option
      if (options.selectedCollections) {
        const selectedCollection = options.selectedCollections[collection.id];
        if (!selectedCollection) {
          return; // Skip this collection if it's not selected
        }
      }

      await Promise.all(collection.modes.map(async (mode) => {
        // Filter modes based on selectedCollections option
        if (options.selectedCollections) {
          const selectedCollection = options.selectedCollections[collection.id];
          if (selectedCollection && !selectedCollection.selectedModes.includes(mode.modeId)) {
            return; // Skip this mode if it's not selected
          }
        }

        const collectionVariables = localVariables.filter((v) => v.variableCollectionId === collection.id);

        const variableReferences = collectionVariables.reduce((acc, variable) => ({
          ...acc,
          [normalizeVariableName(variable.name)]: variable.key,
        }), {});

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
        const themeObj: ThemeObject = {
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
        };

        // Handle extended collections using helper function
        processExtendedCollectionImport(themeObj, collection, mode, themesToCreate);



        themesToCreate.push(themeObj);
      }));
    };

    // Pass 1: Process all regular collections first
    await Promise.all(regularCollections.map(processCollection));

    // Pass 2: Process extended collections (parent themes now exist)
    await Promise.all(extendedCollections.map(processCollection));

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
