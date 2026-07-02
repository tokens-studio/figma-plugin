import { ThemeObjectsList, ThemeObject } from '@/types';
import { SettingsState } from '@/app/store/models/settings';
import createVariableMode from './createVariableMode';
import { truncateCollectionName, truncateModeName } from '@/utils/truncateName';

async function processTheme(
  currentTheme: ThemeObject,
  themes: ThemeObjectsList,
  settings: Partial<SettingsState>,
  acc: VariableCollection[],
  allCollections: VariableCollection[],
): Promise<void> {
  if (settings.exportExtendedCollections && (currentTheme.$figmaParentThemeId || currentTheme.$figmaIsExtension)) {
    const parentTheme = themes.find((t) => t.id === currentTheme.$figmaParentThemeId);
    const parentGroupName = parentTheme ? (parentTheme.group ?? parentTheme.name) : undefined;

    const parentCollection = (parentGroupName ? acc.find((c) => c.name === truncateCollectionName(parentGroupName)) : undefined)
      ?? allCollections.find((c) => c.id === currentTheme.$figmaParentCollectionId);

    if (parentCollection) {
      const rawChildName = currentTheme.group ?? currentTheme.name;
      const parentPrefix = parentGroupName ?? parentCollection.name;
      const childCollectionName = parentPrefix && rawChildName.startsWith(`${parentPrefix}/`)
        ? rawChildName.slice(parentPrefix.length + 1)
        : rawChildName;
      const truncatedChildName = truncateCollectionName(childCollectionName);

      const existingExtendedCollection = acc.find((c) => c.name === truncatedChildName)
        || acc.find((c) => c.id === currentTheme.$figmaCollectionId)
        || allCollections.find((c) => c.id === currentTheme.$figmaCollectionId);

      if (existingExtendedCollection) {
        if (existingExtendedCollection.name !== truncatedChildName) {
          existingExtendedCollection.name = truncatedChildName;
        }
        const truncatedModeName = truncateModeName(currentTheme.name);
        const mode = existingExtendedCollection.modes.find(
          (m) => m.modeId === currentTheme.$figmaModeId || m.name === truncatedModeName,
        );
        if (mode) {
          if (mode.name !== truncatedModeName) {
            existingExtendedCollection.renameMode(mode.modeId, truncatedModeName);
          }
        } else {
          createVariableMode(existingExtendedCollection, currentTheme.name);
        }
        if (!acc.includes(existingExtendedCollection)) {
          acc.push(existingExtendedCollection);
        }
        return;
      }

      try {
        const extendedCollection = await (parentCollection as any).extend(truncatedChildName);
        currentTheme.$figmaIsExtension = true;
        currentTheme.$figmaParentCollectionId = parentCollection.id;
        currentTheme.$figmaCollectionId = extendedCollection.id;
        acc.push(extendedCollection);
        return;
      } catch (error) {
        console.warn('Cannot create extended collection — extend() API not available. Requires Figma Enterprise.', error);
        return;
      }
    }
  }

  // Regular collection logic (original behavior)
  const nameOfCollection = truncateCollectionName(currentTheme.group ?? currentTheme.name);
  const originalNameOfCollection = currentTheme.group ?? currentTheme.name;
  const existingCollection = acc.find((collection) => collection.name === nameOfCollection || collection.name === originalNameOfCollection)
    || allCollections.find((vr) => vr.id === currentTheme.$figmaCollectionId
      || vr.name === nameOfCollection || vr.name === originalNameOfCollection);

  if (existingCollection) {
    if (existingCollection.name !== nameOfCollection) {
      existingCollection.name = nameOfCollection;
    }
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
    return;
  }

  const newCollection = figma.variables.createVariableCollection(nameOfCollection);
  newCollection.renameMode(newCollection.modes[0].modeId, truncateModeName(currentTheme.name));
  acc.push(newCollection);
}

// Takes a given theme input and creates required variable collections with modes, or updates existing ones and renames / adds modes
export async function createNecessaryVariableCollections(themes: ThemeObjectsList, selectedThemes: string[], settings: Partial<SettingsState> = {}): Promise<VariableCollection[]> {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionsToCreateOrUpdate = themes.filter((theme) => selectedThemes.includes(theme.id));
  const acc: VariableCollection[] = [];

  for (const currentTheme of collectionsToCreateOrUpdate) {
    // eslint-disable-next-line no-await-in-loop
    await processTheme(currentTheme, themes, settings, acc, allCollections);
  }

  return acc;
}
