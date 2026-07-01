/* eslint-disable no-continue */
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { FIGMA_PLATFORMS } from '@/utils/figma';
import { notifyVariableValues, notifyRenamedCollections, notifyException } from './notifiers';
import {
  PullVariablesOptions, ThemeObjectsList, ThemeObject,
} from '@/types';
import { VariableToCreateToken } from '@/types/payloads';
import { TokenTypes } from '@/constants/TokenTypes';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { normalizeVariableName } from '@/utils/normalizeVariableName';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { processExtendedCollectionImport, separateCollectionsByType } from './extendedCollections';

type CollectionEntry = {
  id: string,
  name: string,
  modes: { name: string, modeId: string, parentModeId?: string }[],
  isExtension?: boolean,
  parentCollectionId?: string,
  variableOverrides?: { [variableId: string]: { [modeId: string]: any } }
};

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

  // Fetch all collections upfront to detect extended collections (Enterprise-only)
  const allFigmaCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const hasExtendedCollections = allFigmaCollections.some((c) => (c as any).isExtension);

  // Keyed by collection name for theme processing; by ID in collectionsCache for variable lookup
  const collections = new Map<string, CollectionEntry>();

  // Cache for collection lookups by ID
  const collectionsCache = new Map<string, CollectionEntry>();

  // Always pre-populate cache from getLocalVariableCollectionsAsync results —
  // avoids a separate getVariableCollectionByIdAsync call per variable on the standard path
  for (const collectionData of allFigmaCollections) {
    const extendedCollection = collectionData as any;
    const collection: CollectionEntry = {
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
      variableOverrides: extendedCollection.isExtension
        ? extendedCollection.variableOverrides
        : undefined,
    };
    collections.set(collection.name, collection);
    collectionsCache.set(collection.id, collection);
  }

  const createFigmaExtensions = (variable: Variable) => {
    const extensions: Record<string, any> = {};

    // Add scopes if they exist and are not default
    if (variable.scopes && variable.scopes.length > 0) {
      extensions['com.figma.scopes'] = variable.scopes;
    }

    if (typeof variable.hiddenFromPublishing === 'boolean') {
      extensions['com.figma.hiddenFromPublishing'] = variable.hiddenFromPublishing;
    }

    // Add code syntax if it exists
    const codeSyntax: Record<string, string> = {};
    try {
      // Check if variable has code syntax for each platform
      FIGMA_PLATFORMS.forEach(({ key, figma: figmaPlatform }) => {
        const syntax = variable.codeSyntax?.[figmaPlatform];
        if (syntax) {
          codeSyntax[key] = syntax;
        }
      });

      if (Object.keys(codeSyntax).length > 0) {
        extensions['com.figma.codeSyntax'] = codeSyntax;
      }
    } catch (e) {
      if (e instanceof Error) {
        notifyException(e.message);
      }
    }

    return Object.keys(extensions).length > 0 ? extensions : undefined;
  };

  for (const variable of localVariables) {
    let collection = collectionsCache.get(variable.variableCollectionId);

    if (!collection) {
      if (!hasExtendedCollections) {
        // Standard path: lazy lookup per variable (original behaviour, keeps tests working)
        const collectionData = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
        if (collectionData) {
          collection = {
            id: collectionData.id,
            name: collectionData.name,
            modes: collectionData.modes.map((mode) => ({ name: mode.name, modeId: mode.modeId })),
          };
          collectionsCache.set(collectionData.id, collection);
          collections.set(collectionData.name, collection);
        }
      }
    }

    // Filter collections and modes based on selectedCollections option
    if (options.selectedCollections && collection) {
      const selectedCollection = options.selectedCollections[collection.id];
      if (!selectedCollection) {
        // eslint-disable-next-line no-continue
        continue; // Skip this collection if it's not selected
      }
    }

    // For extended collections: also process child collections that inherit from this collection
    const collectionsToProcess: CollectionEntry[] = collection ? [collection] : [];

    if (hasExtendedCollections && collection) {
      collections.forEach((extCollection) => {
        if (extCollection.isExtension && extCollection.parentCollectionId === collection!.id) {
          if (options.selectedCollections) {
            const isExtendedCollectionSelected = options.selectedCollections[extCollection.id];
            if (!isExtendedCollectionSelected) {
              return;
            }
          }
          collectionsToProcess.push(extCollection);
        }
      });
    }

    const variableName = normalizeVariableName(variable.name);

    // Process the variable for each collection (parent + extended collections)
    for (const collectionToProcess of collectionsToProcess) {
      try {
        switch (variable.resolvedType) {
          case 'COLOR':
            Object.entries(variable.valuesByMode).forEach(([parentModeId, value]) => {
              let actualModeId = parentModeId;
              if (collectionToProcess?.isExtension) {
                const childMode = collectionToProcess.modes.find((m) => m.parentModeId === parentModeId);
                if (!childMode) {
                  return;
                }
                actualModeId = childMode.modeId;
              }

              if (options.selectedCollections && collectionToProcess) {
                const selectedCollection = options.selectedCollections[collectionToProcess.id];
                if (selectedCollection && !selectedCollection.selectedModes.includes(actualModeId)) {
                  return;
                }
              }

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
                const figmaExtensions = createFigmaExtensions(variable);
                const parent = `${collectionToProcess?.name}/${modeName}`;

                colors.push({
                  name: variableName,
                  value: tokenValue as string,
                  type: TokenTypes.COLOR,
                  parent,
                  ...(variable.description ? { description: variable.description } : {}),
                  ...(figmaExtensions ? { $extensions: figmaExtensions } : {}),
                });
              }
            });
            break;

          case 'BOOLEAN':
            Object.entries(variable.valuesByMode).forEach(([parentModeId, value]) => {
              let actualModeId = parentModeId;
              if (collectionToProcess?.isExtension) {
                const childMode = collectionToProcess.modes.find((m) => m.parentModeId === parentModeId);
                if (!childMode) {
                  return;
                }
                actualModeId = childMode.modeId;
              }

              if (options.selectedCollections && collectionToProcess) {
                const selectedCollection = options.selectedCollections[collectionToProcess.id];
                if (selectedCollection && !selectedCollection.selectedModes.includes(actualModeId)) {
                  return;
                }
              }

              let actualValue = value;
              if (collectionToProcess?.isExtension && collectionToProcess.variableOverrides) {
                const override = collectionToProcess.variableOverrides[variable.id]?.[actualModeId];
                if (override !== undefined) {
                  actualValue = override;
                }
              }

              const modeName = collectionToProcess?.modes.find((m) => m.modeId === actualModeId)?.name;
              let tokenValue;
              if (typeof actualValue === 'object' && 'type' in actualValue && actualValue.type === 'VARIABLE_ALIAS') {
                const alias = figma.variables.getVariableById(actualValue.id);
                tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
              } else {
                tokenValue = JSON.stringify(actualValue);
              }

              const figmaExtensions = createFigmaExtensions(variable);
              booleans.push({
                name: variableName,
                value: tokenValue,
                type: TokenTypes.BOOLEAN,
                parent: `${collectionToProcess?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
                ...(figmaExtensions ? { $extensions: figmaExtensions } : {}),
              });
            });
            break;

          case 'STRING':
            Object.entries(variable.valuesByMode).forEach(([parentModeId, value]) => {
              let actualModeId = parentModeId;
              if (collectionToProcess?.isExtension) {
                const childMode = collectionToProcess.modes.find((m) => m.parentModeId === parentModeId);
                if (!childMode) {
                  return;
                }
                actualModeId = childMode.modeId;
              }

              if (options.selectedCollections && collectionToProcess) {
                const selectedCollection = options.selectedCollections[collectionToProcess.id];
                if (selectedCollection && !selectedCollection.selectedModes.includes(actualModeId)) {
                  return;
                }
              }

              let actualValue = value;
              if (collectionToProcess?.isExtension && collectionToProcess.variableOverrides) {
                const override = collectionToProcess.variableOverrides[variable.id]?.[actualModeId];
                if (override !== undefined) {
                  actualValue = override;
                }
              }

              const modeName = collectionToProcess?.modes.find((m) => m.modeId === actualModeId)?.name;
              let tokenValue;
              if (typeof actualValue === 'object' && 'type' in actualValue && actualValue.type === 'VARIABLE_ALIAS') {
                const alias = figma.variables.getVariableById(actualValue.id);
                tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
              } else {
                tokenValue = String(actualValue);
              }

              const figmaExtensions = createFigmaExtensions(variable);
              strings.push({
                name: variableName,
                value: tokenValue as string,
                type: TokenTypes.TEXT,
                parent: `${collectionToProcess?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
                ...(figmaExtensions ? { $extensions: figmaExtensions } : {}),
              });
            });
            break;

          case 'FLOAT':
            Object.entries(variable.valuesByMode).forEach(([parentModeId, value]) => {
              let actualModeId = parentModeId;
              if (collectionToProcess?.isExtension) {
                const childMode = collectionToProcess.modes.find((m) => m.parentModeId === parentModeId);
                if (!childMode) {
                  return;
                }
                actualModeId = childMode.modeId;
              }

              if (options.selectedCollections && collectionToProcess) {
                const selectedCollection = options.selectedCollections[collectionToProcess.id];
                if (selectedCollection && !selectedCollection.selectedModes.includes(actualModeId)) {
                  return;
                }
              }

              let actualValue = value;
              if (collectionToProcess?.isExtension && collectionToProcess.variableOverrides) {
                const override = collectionToProcess.variableOverrides[variable.id]?.[actualModeId];
                if (override !== undefined) {
                  actualValue = override;
                }
              }

              let tokenValue: string | number = actualValue as number;
              if (typeof actualValue === 'object' && 'type' in actualValue && actualValue.type === 'VARIABLE_ALIAS') {
                const alias = figma.variables.getVariableById(actualValue.id);
                tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
              } else if (typeof actualValue === 'number') {
                if (options.useRem) {
                  tokenValue = `${Number((Number(tokenValue) / parseFloat(String(baseRem))).toFixed(3))}rem`;
                } else if (options.useDimensions) {
                  tokenValue = `${Number(tokenValue.toFixed(3))}px`;
                } else {
                  tokenValue = Number(tokenValue.toFixed(3));
                }
              }

              const modeName = collectionToProcess?.modes.find((m) => m.modeId === actualModeId)?.name;
              const figmaExtensions = createFigmaExtensions(variable);

              if ((options.useDimensions || options.useRem) && typeof tokenValue === 'string' && (tokenValue.endsWith('px') || tokenValue.endsWith('rem'))) {
                dimensions.push({
                  name: variableName,
                  value: tokenValue as string,
                  type: TokenTypes.DIMENSION,
                  parent: `${collectionToProcess?.name}/${modeName}`,
                  ...(variable.description ? { description: variable.description } : {}),
                  ...(figmaExtensions ? { $extensions: figmaExtensions } : {}),
                });
              } else {
                numbers.push({
                  name: variableName,
                  value: tokenValue as string,
                  type: TokenTypes.NUMBER,
                  parent: `${collectionToProcess?.name}/${modeName}`,
                  ...(variable.description ? { description: variable.description } : {}),
                  ...(figmaExtensions ? { $extensions: figmaExtensions } : {}),
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
        if (status === TokenSetStatus.ENABLED) {
          activeTokenSets.add(tokenSet);
        }
      });
    });

    // For extended collections: process regular collections first, then extended ones
    const regularCollections = hasExtendedCollections
      ? Array.from(collections.values()).filter((c) => !c.isExtension)
      : Array.from(collections.values());
    const extendedCollections = hasExtendedCollections
      ? Array.from(collections.values()).filter((c) => c.isExtension)
      : [];

    // Helper function to process a collection and create themes
    const processCollection = async (collection: CollectionEntry) => {
      if (options.selectedCollections) {
        const selectedCollection = options.selectedCollections[collection.id];
        if (!selectedCollection) {
          return;
        }
      }

      await Promise.all(collection.modes.map(async (mode) => {
        if (options.selectedCollections) {
          const selectedCollection = options.selectedCollections[collection.id];
          if (selectedCollection && !selectedCollection.selectedModes.includes(mode.modeId)) {
            return;
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

        const matchingTheme = themeInfo.themes?.find((t) => t.$figmaCollectionId === collection.id
          && t.$figmaModeId === mode.modeId);

        if (matchingTheme) {
          Object.keys(matchingTheme.selectedTokenSets || {}).forEach((existingTokenSet) => {
            if (existingTokenSet !== tokenSetName
              && existingTokenSet.includes('/')
              && !renamedCollections.has(existingTokenSet)
              && !Array.from(renamedCollections.values()).includes(tokenSetName)) {
              renamedCollections.set(existingTokenSet, tokenSetName);
            }
          });
        }

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

        if (hasExtendedCollections) {
          processExtendedCollectionImport(themeObj, collection, mode, themesToCreate);
        }

        themesToCreate.push(themeObj);
      }));
    };

    // Pass 1: regular collections
    await Promise.all(regularCollections.map(processCollection));

    // Pass 2: extended collections (parent themes now exist)
    if (hasExtendedCollections) {
      await Promise.all(extendedCollections.map(processCollection));
    }

    const currentTokenSets = new Set(themesToCreate.map((theme) => `${theme.group}/${theme.name}`));
    for (const existingSet of existingTokenSets) {
      if (renamedCollections.has(existingSet)) {
        continue;
      }

      if (existingSet.includes('/') && !currentTokenSets.has(existingSet)) {
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
