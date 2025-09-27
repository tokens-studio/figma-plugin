import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { VariableChangePreview } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { convertTokenTypeToVariableType } from '@/utils/convertTokenTypeToVariableType';
import { transformValue } from './helpers';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import setStringValuesOnVariable from './setStringValuesOnVariable';
import { createNecessaryVariableCollections } from './createNecessaryVariableCollections';
import { findCollectionAndModeIdForTheme } from './findCollectionAndModeIdForTheme';
import { checkCanReferenceVariable } from '@/utils/alias/checkCanReferenceVariable';
import { notifyUI } from './notifiers';
import { TokenTypes } from '@/constants/TokenTypes';

export type ApplyVariableChangesParams = {
  changes: VariableChangePreview[];
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState;
  selectedThemes?: string[];
  selectedSets?: ExportTokenSet[];
};

export default async function applyVariableChanges({
  changes,
  tokens,
  settings,
  selectedThemes,
  selectedSets,
}: ApplyVariableChangesParams): Promise<{
  variableIds: Record<string, string>;
  totalVariables: number;
}> {
  const variableIds: Record<string, string> = {};
  let totalVariables = 0;

  // Get theme info if we're working with themes
  let themeInfo;
  let collections: VariableCollection[] = [];
  
  if (selectedThemes && selectedThemes.length > 0) {
    themeInfo = await AsyncMessageChannel.PluginInstance.message({
      type: AsyncMessageTypes.GET_THEME_INFO,
    });
    
    // Create necessary collections first (same as original logic)
    collections = await createNecessaryVariableCollections(themeInfo.themes, selectedThemes);
  } else if (selectedSets && selectedSets.length > 0) {
    // For token sets, we still need a default collection
    const existingCollections = figma.variables.getLocalVariableCollections();
    const defaultCollection = existingCollections.find(c => c.name === 'Default') 
      || figma.variables.createVariableCollection('Default');
    collections = [defaultCollection];
  }

  // Get existing variables for updates and deletes
  const existingVariables = figma.variables.getLocalVariables();
  const variablesByName = existingVariables.reduce<Record<string, Variable>>((acc, variable) => {
    acc[variable.name] = variable;
    return acc;
  }, {});
  const variablesById = existingVariables.reduce<Record<string, Variable>>((acc, variable) => {
    acc[variable.id] = variable;
    return acc;
  }, {});

  // Process each change
  console.log('🔧 [DEBUG] Starting to process', changes.length, 'changes');
  for (const change of changes) {
    console.log('🔧 [DEBUG] Processing change:', {
      type: change.type,
      name: change.name,
      path: change.path,
      tokenType: change.tokenType,
    });
    
    try {
      if (change.type === 'delete' && change.variableId) {
        console.log('🔧 [DEBUG] Processing DELETE change');
        // Handle deletion
        const variable = variablesById[change.variableId];
        if (variable) {
          variable.remove();
          totalVariables++;
          console.log('✅ [DEBUG] Variable deleted:', variable.name);
        }
      } else if (change.type === 'create') {
        console.log('🔧 [DEBUG] Processing CREATE change');
        // Handle creation
        await handleCreateVariable(change, tokens, settings, themeInfo, collections, variableIds);
        totalVariables++;
      } else if (change.type === 'update' && change.variableId) {
        console.log('🔧 [DEBUG] Processing UPDATE change');
        // Handle update
        const variable = variablesById[change.variableId];
        if (variable) {
          await handleUpdateVariable(variable, change, tokens, settings, themeInfo);
          variableIds[change.name] = variable.id;
          totalVariables++;
          console.log('✅ [DEBUG] Variable updated:', variable.name);
        }
      }
    } catch (error) {
      console.error(`❌ [DEBUG] Error processing change for ${change.name}:`, error);
    }
  }

  const createCount = changes.filter(c => c.type === 'create').length;
  const updateCount = changes.filter(c => c.type === 'update').length;
  const deleteCount = changes.filter(c => c.type === 'delete').length;

  notifyUI(`Variables: ${createCount} created, ${updateCount} updated, ${deleteCount} deleted`);

  return { variableIds, totalVariables };
}

async function handleCreateVariable(
  change: VariableChangePreview,
  tokens: Record<string, AnyTokenList>,
  settings: SettingsState,
  themeInfo: any,
  collections: VariableCollection[],
  variableIds: Record<string, string>
): Promise<void> {
  console.log('🔧 [DEBUG] handleCreateVariable - Starting creation for:', {
    changeName: change.name,
    changePath: change.path,
    changeType: change.type,
    collectionName: change.collectionName,
    mode: change.mode,
    newValue: change.newValue,
    tokenData: change.tokenData,
  });

  // Use token data from the change instead of searching
  if (!change.tokenData) {
    console.warn(`❌ [DEBUG] Token data missing for path: ${change.path}`);
    return;
  }
  
  const token = {
    name: change.name,
    path: change.path,
    value: change.tokenData.value,
    rawValue: change.tokenData.rawValue,
    type: change.tokenData.type,
    description: change.description,
    internal__Parent: change.tokenData.parent,
  };

  console.log('🔧 [DEBUG] Constructed token object:', token);

  // Determine collection and mode
  let collection: VariableCollection;
  let modeId: string;

  if (change.collectionName && change.mode && themeInfo) {
    // Use the collection name and mode name from the change to find the right collection
    const result = findCollectionAndModeIdForTheme(change.collectionName, change.mode, collections);
    collection = result.collection;
    modeId = result.modeId;
    
    // If we still don't have a collection, try to find by theme
    if (!collection || !modeId) {
      const theme = themeInfo.themes.find((t: any) => t.name === change.mode);
      if (theme) {
        const themeResult = findCollectionAndModeIdForTheme(theme.group ?? theme.name, theme.name, collections);
        collection = themeResult.collection;
        modeId = themeResult.modeId;
      }
    }
  } else {
    // For token sets without themes, use first available collection
    collection = collections[0];
    modeId = collection?.defaultModeId;
  }

  if (!collection || !modeId) {
    console.warn(`❌ [DEBUG] Could not determine collection/mode for: ${change.path} (collectionName: ${change.collectionName}, mode: ${change.mode})`);
    console.log('🔧 [DEBUG] Available collections:', collections.map(c => ({ name: c.name, modes: c.modes.map(m => m.name) })));
    return;
  }

  console.log('✅ [DEBUG] Found collection and mode:', {
    collectionName: collection.name,
    collectionId: collection.id,
    modeId,
    modeName: collection.modes.find(m => m.modeId === modeId)?.name,
  });

  // Create variable
  const variableType = convertTokenTypeToVariableType(token.type as any, token.value);
  console.log('🔧 [DEBUG] Creating variable with type:', variableType, 'from token type:', token.type, 'and value:', token.value);
  
  const variable = figma.variables.createVariable(change.path, collection, variableType);
  console.log('✅ [DEBUG] Variable created:', {
    id: variable.id,
    name: variable.name,
    type: variable.resolvedType,
  });
  
  if (change.description) {
    variable.description = change.description;
    console.log('🔧 [DEBUG] Set description:', change.description);
  }

  // Set value
  console.log('🔧 [DEBUG] About to set variable value with:', { modeId, token, settings: !!settings });
  await setVariableValue(variable, modeId, token, settings);
  
  console.log('✅ [DEBUG] Variable creation completed for:', change.path);
  variableIds[change.name] = variable.id;
}

async function handleUpdateVariable(
  variable: Variable,
  change: VariableChangePreview,
  tokens: Record<string, AnyTokenList>,
  settings: SettingsState,
  themeInfo: any
): Promise<void> {
  // Use token data from the change instead of searching
  if (!change.tokenData) {
    console.warn(`Token data missing for path: ${change.path}`);
    return;
  }
  
  const token = {
    name: change.name,
    path: change.path,
    value: change.tokenData.value,
    rawValue: change.tokenData.rawValue,
    type: change.tokenData.type,
    description: change.description,
    internal__Parent: change.tokenData.parent,
  };

  // Update description if needed
  if (change.description !== undefined && variable.description !== change.description) {
    variable.description = change.description;
  }

  // Update name if needed (rename)
  if (variable.name !== change.path && settings.renameExistingStylesAndVariables) {
    variable.name = change.path;
  }

  // Find the mode to update
  let modeId: string;
  if (change.mode && themeInfo) {
    const theme = themeInfo.themes.find((t: any) => t.name === change.mode);
    modeId = theme?.$figmaModeId || Object.keys(variable.valuesByMode)[0];
  } else {
    modeId = Object.keys(variable.valuesByMode)[0];
  }

  // Set new value
  await setVariableValue(variable, modeId, token, settings);
}

async function setVariableValue(
  variable: Variable,
  modeId: string,
  token: any,
  settings: SettingsState
): Promise<void> {
  console.log('🔧 [DEBUG] setVariableValue called with:', {
    variableName: variable.name,
    variableType: variable.resolvedType,
    modeId,
    tokenValue: token.value,
    tokenRawValue: token.rawValue,
    tokenType: token.type,
  });

  // Handle references
  if (checkCanReferenceVariable(token)) {
    console.log('🔧 [DEBUG] Token is a reference, processing...');
    let referenceTokenName: string = '';
    if (token.rawValue && token.rawValue.toString().startsWith('{')) {
      referenceTokenName = token.rawValue.toString().slice(1, token.rawValue.toString().length - 1);
    } else {
      referenceTokenName = token.rawValue!.toString().substring(1);
    }
    
    console.log('🔧 [DEBUG] Looking for reference variable:', referenceTokenName);
    
    // Find reference variable
    const referenceVariable = figma.variables.getLocalVariables()
      .find(v => v.name === referenceTokenName.split('.').join('/'));
    
    if (referenceVariable) {
      console.log('✅ [DEBUG] Found reference variable, setting alias');
      variable.setValueForMode(modeId, {
        type: 'VARIABLE_ALIAS',
        id: referenceVariable.id,
      });
      return;
    } else {
      console.warn('❌ [DEBUG] Reference variable not found:', referenceTokenName);
    }
  }

  // Set direct value based on type
  console.log('🔧 [DEBUG] Setting direct value for variable type:', variable.resolvedType);
  
  switch (variable.resolvedType) {
    case 'BOOLEAN':
      console.log('🔧 [DEBUG] Processing BOOLEAN variable');
      if (typeof token.value === 'string' && !token.value.includes('{')) {
        console.log('🔧 [DEBUG] Setting boolean value:', token.value);
        setBooleanValuesOnVariable(variable, modeId, token.value);
      } else {
        console.warn('❌ [DEBUG] Boolean value invalid or is reference:', token.value);
      }
      break;
    case 'COLOR':
      console.log('🔧 [DEBUG] Processing COLOR variable');
      if (typeof token.value === 'string' && !token.value.includes('{')) {
        console.log('🔧 [DEBUG] Setting color value:', token.value);
        setColorValuesOnVariable(variable, modeId, token.value);
      } else {
        console.warn('❌ [DEBUG] Color value invalid or is reference:', token.value);
      }
      break;
    case 'FLOAT': {
      console.log('🔧 [DEBUG] Processing FLOAT variable');
      const value = String(token.value);
      if (typeof value === 'string' && !value.includes('{')) {
        const transformedValue = transformValue(value, token.type, settings.baseFontSize, true);
        console.log('🔧 [DEBUG] Setting number value:', value, '->', transformedValue);
        setNumberValuesOnVariable(variable, modeId, Number(transformedValue));
      } else {
        console.warn('❌ [DEBUG] Number value invalid or is reference:', value);
      }
      break;
    }
    case 'STRING':
      console.log('🔧 [DEBUG] Processing STRING variable');
      if (typeof token.value === 'string' && !token.value.includes('{')) {
        console.log('🔧 [DEBUG] Setting string value:', token.value);
        setStringValuesOnVariable(variable, modeId, token.value);
      } else {
        console.warn('❌ [DEBUG] String value invalid or is reference:', token.value);
        // Note: Font weight arrays should now be normalized at preview time, 
        // so we shouldn't reach this case for font weights anymore
      }
      break;
    default:
      console.warn(`❌ [DEBUG] Unsupported variable type: ${variable.resolvedType}`);
      break;
  }
  
  console.log('✅ [DEBUG] setVariableValue completed for:', variable.name);
}

