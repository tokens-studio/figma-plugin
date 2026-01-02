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

export default async function pullVariables(options: PullVariablesOptions, themes: ThemeObjectsList, proUser: boolean): Promise<void> {
  console.log('🔍 pullVariables called');
  console.log('Selected collections:', options.selectedCollections);
  
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

  const collections = new Map<string, {
    id: string,
    name: string,
    modes: { name: string, modeId: string }[]
  }>();

  // Cache for collection lookups
  const collectionsCache = new Map<string, {
    id: string,
    name: string,
    modes: { name: string, modeId: string }[]
  }>();

  // PRE-POPULATE collections Map with selected collections
  // This ensures extended collections appear even if they have no variables yet
  if (options.selectedCollections) {
    console.log('🔧 Pre-populating collections Map with selected collections...');
    const selectedCollectionIds = Object.keys(options.selectedCollections);
    
    for (const collectionId of selectedCollectionIds) {
      const collectionData = await figma.variables.getVariableCollectionByIdAsync(collectionId);
      if (collectionData) {
        const collectionInfo = {
          id: collectionData.id,
          name: collectionData.name,
          modes: collectionData.modes.map((mode) => ({ name: mode.name, modeId: mode.modeId })),
        };
        collections.set(collectionData.name, collectionInfo);
        collectionsCache.set(collectionId, collectionInfo);
        console.log(`  ✅ Pre-populated: "${collectionData.name}" (${collectionId})`);
      }
    }
    console.log(`Pre-populated ${collections.size} collections\n`);
  }

  for (const variable of localVariables) {
    let collection = collectionsCache.get(variable.variableCollectionId);
    if (!collection) {
      const collectionData = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
      if (collectionData) {
        console.log(`📦 Found collection for variable "${variable.name}":`, collectionData.name, 'ID:', collectionData.id);
        collection = {
          id: collectionData.id,
          name: collectionData.name,
          modes: collectionData.modes.map((mode) => ({ name: mode.name, modeId: mode.modeId })),
        };
        collectionsCache.set(variable.variableCollectionId, collection);
      }
    }

    // Filter collections and modes based on selectedCollections option
    if (options.selectedCollections && collection) {
      const selectedCollection = options.selectedCollections[collection.id];
      if (!selectedCollection) {
        console.log(`❌ Skipping variable "${variable.name}" - collection "${collection.name}" (${collection.id}) not in selectedCollections`);
        // eslint-disable-next-line no-continue
        continue; // Skip this collection if it's not selected
      } else {
        console.log(`✅ Processing variable "${variable.name}" from collection "${collection.name}"`);
      }
    }

    if (collection) {
      collections.set(collection.name, collection);
    }

    const variableName = normalizeVariableName(variable.name);
    try {
      switch (variable.resolvedType) {
        case 'COLOR':
          Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
            // Filter modes based on selectedCollections option
            if (options.selectedCollections && collection) {
              const selectedCollection = options.selectedCollections[collection.id];
              if (selectedCollection && !selectedCollection.selectedModes.includes(mode)) {
                return; // Skip this mode if it's not selected
              }
            }

            let tokenValue;

            if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
              const alias = figma.variables.getVariableById(value.id);
              tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
            } else {
              tokenValue = figmaRGBToHex(value as RGBA);
            }

            const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;
            if (tokenValue) {
              colors.push({
                name: variableName,
                value: tokenValue as string,
                type: TokenTypes.COLOR,
                parent: `${collection?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
              });
            }
          });
          break;
        case 'BOOLEAN':
          Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
            // Filter modes based on selectedCollections option
            if (options.selectedCollections && collection) {
              const selectedCollection = options.selectedCollections[collection.id];
              if (selectedCollection && !selectedCollection.selectedModes.includes(mode)) {
                return; // Skip this mode if it's not selected
              }
            }

            const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;
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
              parent: `${collection?.name}/${modeName}`,
              ...(variable.description ? { description: variable.description } : {}),
            });
          });
          break;
        case 'STRING':
          Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
            // Filter modes based on selectedCollections option
            if (options.selectedCollections && collection) {
              const selectedCollection = options.selectedCollections[collection.id];
              if (selectedCollection && !selectedCollection.selectedModes.includes(mode)) {
                return; // Skip this mode if it's not selected
              }
            }

            const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;
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
              parent: `${collection?.name}/${modeName}`,
              ...(variable.description ? { description: variable.description } : {}),
            });
          });
          break;
        case 'FLOAT':
          Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
            // Filter modes based on selectedCollections option
            if (options.selectedCollections && collection) {
              const selectedCollection = options.selectedCollections[collection.id];
              if (selectedCollection && !selectedCollection.selectedModes.includes(mode)) {
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
            const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;

            if (options.useDimensions || options.useRem) {
              dimensions.push({
                name: variableName,
                value: tokenValue as string,
                type: TokenTypes.DIMENSION,
                parent: `${collection?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
              });
            } else {
              numbers.push({
                name: variableName,
                value: tokenValue as string,
                type: TokenTypes.NUMBER,
                parent: `${collection?.name}/${modeName}`,
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

    console.log('\n📚 Collections Map contents:');
    console.log('Total collections in Map:', collections.size);
    Array.from(collections.values()).forEach(c => {
      console.log(`  - "${c.name}" (${c.id})`);
    });
    console.log('');

    await Promise.all(Array.from(collections.values()).map(async (collection) => {
      console.log(`\n🎨 Processing collection: "${collection.name}" (${collection.id})`);
      
      // Filter collections based on selectedCollections option
      if (options.selectedCollections) {
        const selectedCollection = options.selectedCollections[collection.id];
        if (!selectedCollection) {
          console.log(`  ⏭️  Skipping - not in selectedCollections`);
          return; // Skip this collection if it's not selected
        }
        console.log(`  ✅ Collection is selected`);
      }

      await Promise.all(collection.modes.map(async (mode) => {
        console.log(`    📋 Processing mode: "${mode.name}" (${mode.modeId})`);
        
        // Filter modes based on selectedCollections option
        if (options.selectedCollections) {
          const selectedCollection = options.selectedCollections[collection.id];
          if (selectedCollection && !selectedCollection.selectedModes.includes(mode.modeId)) {
            console.log(`      ⏭️  Skipping mode - not selected`);
            return; // Skip this mode if it's not selected
          }
        }

        const collectionVariables = localVariables.filter((v) => v.variableCollectionId === collection.id);
        console.log(`      🔍 Found ${collectionVariables.length} variables with variableCollectionId === ${collection.id}`);

        const variableReferences = collectionVariables.reduce((acc, variable) => ({
          ...acc,
          [normalizeVariableName(variable.name)]: variable.key,
        }), {});

        const tokenSetName = `${collection.name}/${mode.name}`;
        const themeId = `${collection.name.toLowerCase()}-${mode.name.toLowerCase()}`;

        console.log(`      🎯 Creating theme: "${themeId}" with ${Object.keys(variableReferences).length} variable references`);

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
        themesToCreate.push({
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
        });
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
    
    console.log('\n📤 FINAL OUTPUT:');
    console.log('Themes to create:', themesToCreate.length);
    themesToCreate.forEach(theme => {
      console.log(`  - Theme: "${theme.id}" (${theme.group}/${theme.name})`);
      console.log(`    Collection: ${theme.$figmaCollectionId}`);
      console.log(`    Mode: ${theme.$figmaModeId}`);
      console.log(`    Variable refs: ${Object.keys(theme.$figmaVariableReferences || {}).length}`);
    });
    console.log('Processed token sets:', Object.keys(processedTokens));
    console.log('');
    
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
