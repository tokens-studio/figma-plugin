import { ThemeObjectsList } from '@/types';
import { SettingsState } from '@/app/store/models/settings';
import createVariableMode from './createVariableMode';
import { truncateCollectionName, truncateModeName } from '@/utils/truncateName';
import {
  createExtendedVariableCollection,
  findParentCollection,
  isExtendedCollectionTheme,
} from './extendedCollections';

// Takes a given theme input and creates required variable collections with modes, or updates existing ones and renames / adds modes
export async function createNecessaryVariableCollections(themes: ThemeObjectsList, selectedThemes: string[], settings: SettingsState): Promise<VariableCollection[]> {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionsToCreateOrUpdate = themes.filter((theme) => selectedThemes.includes(theme.id));


  const acc: VariableCollection[] = [];

  for (const currentTheme of collectionsToCreateOrUpdate) {
    //  Handle extended collections - only if the setting is enabled
    if (settings.exportExtendedCollections && currentTheme.$figmaIsExtension && currentTheme.$figmaParentCollectionId) {
      // Extract parent group name from hierarchical format "ParentGroup/ExtendedGroup"
      const parentGroupName = currentTheme.group?.split('/')[0];

      // Find parent collection by NAME (not by ID, since IDs change between exports)
      const parentCollection = acc.find((c) => c.name === parentGroupName);

      if (parentCollection) {
        // Extract child collection name from hierarchical group
        // group format: "ParentCollection/ChildCollection"
        const childCollectionName = currentTheme.group?.split('/').pop() || currentTheme.name;
        const truncatedChildName = truncateCollectionName(childCollectionName);

        // Check if extended collection already exists
        // IMPORTANT: Check acc first by NAME (for collections created in this run)
        // Then check by ID (for existing collections in Figma)
        const existingExtendedCollection = acc.find((c) => c.name === truncatedChildName)
          || acc.find((c) => c.id === currentTheme.$figmaCollectionId)
          || allCollections.find((c) => c.id === currentTheme.$figmaCollectionId);

        if (existingExtendedCollection) {
          // Update existing extended collection
          if (existingExtendedCollection.name !== truncatedChildName) {
            existingExtendedCollection.name = truncatedChildName;
          }
          const truncatedModeName = truncateModeName(currentTheme.name);
          const mode = existingExtendedCollection.modes.find(
            (m) => m.modeId === currentTheme.$figmaModeId || m.name === truncatedModeName,
          );
          if (mode) {
            // Mode exists, just rename if needed  
            if (mode.name !== truncatedModeName) {
              existingExtendedCollection.renameMode(mode.modeId, truncatedModeName);
            }
          } else {
            // Mode doesn't exist, create it
            createVariableMode(existingExtendedCollection, currentTheme.name);
          }
          // Don't add to acc again if already there
          if (!acc.includes(existingExtendedCollection)) {
            acc.push(existingExtendedCollection);
          }
          continue;
        }

        // Create new extended collection
        try {
          console.log('Attempting to create extended collection via extend() API...');
          const extendedCollection = await (parentCollection as any).extend(truncatedChildName);
          console.log('✅ Extended collection created successfully via extend()!');
          console.log('Extended collection:', { id: extendedCollection.id, name: extendedCollection.name, modesCount: extendedCollection.modes?.length });
          // Extended collections inherit modes from parent - don't rename them
          acc.push(extendedCollection);
          continue;
        } catch (error) {
          // Handle Enterprise plan limitation or other errors
          console.error('❌ extend() API failed with error:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            parentCollectionId: parentCollection.id,
            parentCollectionName: parentCollection.name,
            childName: truncatedChildName,
          });
          console.warn('Extended collections require Figma Enterprise plan.');
          console.warn('Skipping this extended theme - disable toggle to export as regular collections');
          // Don't fall through - skip this theme entirely to avoid duplicate regular collections
          continue;
        }
      }
    }

    // Regular collection logic (original behavior)
    const nameOfCollection = truncateCollectionName(currentTheme.group ?? currentTheme.name); // If there is a group, use that as the collection name, otherwise use the theme name (e.g. for when creating with sets we use the theme name)
    const originalNameOfCollection = currentTheme.group ?? currentTheme.name; // Keep original for finding existing collections
    const existingCollection = acc.find((collection) => collection.name === nameOfCollection || collection.name === originalNameOfCollection)
      || allCollections.find((vr) => vr.id === currentTheme.$figmaCollectionId
        || vr.name === nameOfCollection || vr.name === originalNameOfCollection);

    if (existingCollection) {
      // Check if we already have a collection with the same name, if not find one by the id of $themes or as a fallback by name
      // We do this because we might've found the collection by id, but the name might've changed
      if (existingCollection.name !== nameOfCollection) {
        existingCollection.name = nameOfCollection;
      }
      // If we found an existing collection, check if the mode exists, if not create it
      const truncatedModeName = truncateModeName(currentTheme.name);
      const mode = existingCollection.modes.find((m) => m.modeId === currentTheme.$figmaModeId || m.name === currentTheme.name || m.name === truncatedModeName);

      if (mode) {
        if (mode.name !== truncatedModeName) {
          existingCollection.renameMode(mode.modeId, truncatedModeName);
        }
      } else {
        createVariableMode(existingCollection, currentTheme.name);
      }
      acc.push(existingCollection);
      continue;
    }
    // If no existing collection is found, create a new one and rename the default mode
    const newCollection = figma.variables.createVariableCollection(nameOfCollection);

    newCollection.renameMode(newCollection.modes[0].modeId, truncateModeName(currentTheme.name));
    acc.push(newCollection);
  }

  return acc;
}
