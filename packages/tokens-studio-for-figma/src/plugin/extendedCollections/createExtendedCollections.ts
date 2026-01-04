import { ThemeObject } from '@/types';
import { truncateCollectionName, truncateModeName } from '@/utils/truncateName';
import createVariableMode from '../createVariableMode';

/**
 * Creates an extended variable collection from a parent collection
 * Handles Enterprise plan requirements with graceful fallback
 */
export async function createExtendedVariableCollection(
    currentTheme: ThemeObject,
    parentCollection: VariableCollection,
    allCollections: VariableCollection[],
    accumulatedCollections: VariableCollection[],
): Promise<VariableCollection | null> {
    // Extract child collection name from hierarchical group
    // group format: "ParentCollection/ChildCollection"
    const childCollectionName = currentTheme.group?.split('/').pop() || currentTheme.name;
    const truncatedChildName = truncateCollectionName(childCollectionName);

    // Check if extended collection already exists
    const existingExtendedCollection = accumulatedCollections.find((c) => c.id === currentTheme.$figmaCollectionId)
        || allCollections.find((c) => c.id === currentTheme.$figmaCollectionId);

    if (existingExtendedCollection) {
        // Update existing extended collection
        return updateExistingExtendedCollection(existingExtendedCollection, truncatedChildName, currentTheme);
    }

    // Create new extended collection
    return createNewExtendedCollection(parentCollection, truncatedChildName, currentTheme);
}

/**
 * Updates an existing extended collection
 */
function updateExistingExtendedCollection(
    collection: VariableCollection,
    truncatedChildName: string,
    currentTheme: ThemeObject,
): VariableCollection {
    if (collection.name !== truncatedChildName) {
        collection.name = truncatedChildName;
    }

    const truncatedModeName = truncateModeName(currentTheme.name);
    const mode = collection.modes.find(
        (m) => m.modeId === currentTheme.$figmaModeId || m.name === truncatedModeName,
    );

    if (mode && mode.name !== truncatedModeName) {
        collection.renameMode(mode.modeId, truncatedModeName);
    }

    return collection;
}

/**
 * Creates a new extended collection using the Figma API
 * Falls back to regular collection if Enterprise plan is not available
 */
function createNewExtendedCollection(
    parentCollection: VariableCollection,
    truncatedChildName: string,
    currentTheme: ThemeObject,
): VariableCollection | null {
    try {
        // Use Figma's extend() API for extended collections
        const extendedCollection = (parentCollection as any).extend(truncatedChildName);

        // Rename the default mode to match the theme
        extendedCollection.renameMode(
            extendedCollection.modes[0].modeId,
            truncateModeName(currentTheme.name),
        );

        console.log(`✓ Created extended collection: ${truncatedChildName}`);
        return extendedCollection;
    } catch (error) {
        // Handle Enterprise plan limitation or other errors
        console.warn(`Cannot create extended collection "${truncatedChildName}":`, error);
        console.warn('Extended collections require Figma Enterprise plan. Falling back to regular collection.');

        // Return null to signal fallback to regular collection creation
        return null;
    }
}

/**
 * Finds the parent collection for an extended collection theme
 */
export function findParentCollection(
    currentTheme: ThemeObject,
    accumulatedCollections: VariableCollection[],
    allCollections: VariableCollection[],
): VariableCollection | null {
    if (!currentTheme.$figmaParentCollectionId) {
        return null;
    }

    return (
        accumulatedCollections.find((c) => c.id === currentTheme.$figmaParentCollectionId)
        || allCollections.find((c) => c.id === currentTheme.$figmaParentCollectionId)
        || null
    );
}

/**
 * Checks if a theme represents an extended collection
 */
export function isExtendedCollectionTheme(theme: ThemeObject): boolean {
    return Boolean(theme.$figmaIsExtension && theme.$figmaParentCollectionId);
}
