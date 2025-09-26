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
  for (const change of changes) {
    try {
      if (change.type === 'delete' && change.variableId) {
        // Handle deletion
        const variable = variablesById[change.variableId];
        if (variable) {
          variable.remove();
          totalVariables++;
        }
      } else if (change.type === 'create') {
        // Handle creation
        await handleCreateVariable(change, tokens, settings, themeInfo, collections, variableIds);
        totalVariables++;
      } else if (change.type === 'update' && change.variableId) {
        // Handle update
        const variable = variablesById[change.variableId];
        if (variable) {
          await handleUpdateVariable(variable, change, tokens, settings, themeInfo);
          variableIds[change.name] = variable.id;
          totalVariables++;
        }
      }
    } catch (error) {
      console.error(`Error processing change for ${change.name}:`, error);
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
    console.warn(`Could not determine collection/mode for: ${change.path} (collectionName: ${change.collectionName}, mode: ${change.mode})`);
    return;
  }

  // Create variable
  const variableType = convertTokenTypeToVariableType(token.type as any, token.value);
  const variable = figma.variables.createVariable(change.path, collection, variableType);
  
  if (change.description) {
    variable.description = change.description;
  }

  // Set value
  await setVariableValue(variable, modeId, token, settings);
  
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
  // Handle references
  if (checkCanReferenceVariable(token)) {
    let referenceTokenName: string = '';
    if (token.rawValue && token.rawValue.toString().startsWith('{')) {
      referenceTokenName = token.rawValue.toString().slice(1, token.rawValue.toString().length - 1);
    } else {
      referenceTokenName = token.rawValue!.toString().substring(1);
    }
    
    // Find reference variable
    const referenceVariable = figma.variables.getLocalVariables()
      .find(v => v.name === referenceTokenName.split('.').join('/'));
    
    if (referenceVariable) {
      variable.setValueForMode(modeId, {
        type: 'VARIABLE_ALIAS',
        id: referenceVariable.id,
      });
      return;
    }
  }

  // Set direct value based on type
  switch (variable.resolvedType) {
    case 'BOOLEAN':
      if (typeof token.value === 'string' && !token.value.includes('{')) {
        setBooleanValuesOnVariable(variable, modeId, token.value);
      }
      break;
    case 'COLOR':
      if (typeof token.value === 'string' && !token.value.includes('{')) {
        setColorValuesOnVariable(variable, modeId, token.value);
      }
      break;
    case 'FLOAT': {
      const value = String(token.value);
      if (typeof value === 'string' && !value.includes('{')) {
        const transformedValue = transformValue(value, token.type, settings.baseFontSize, true);
        setNumberValuesOnVariable(variable, modeId, Number(transformedValue));
      }
      break;
    }
    case 'STRING':
      if (typeof token.value === 'string' && !token.value.includes('{')) {
        setStringValuesOnVariable(variable, modeId, token.value);
      }
      break;
    default:
      console.warn(`Unsupported variable type: ${variable.resolvedType}`);
      break;
  }
}

