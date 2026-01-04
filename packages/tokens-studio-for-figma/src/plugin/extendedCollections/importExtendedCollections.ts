import { ThemeObject } from '@/types';

/**
 * Helper function to process extended collection metadata when importing variables
 * Links child themes to their parent themes and creates hierarchical group names
 */
export function processExtendedCollectionImport(
    themeObj: ThemeObject,
    collection: {
        isExtension?: boolean;
        parentCollectionId?: string;
    },
    mode: {
        parentModeId?: string;
    },
    themesToCreate: ThemeObject[],
): ThemeObject {
    // Only process if this is an extended collection
    if (!collection.isExtension || !collection.parentCollectionId) {
        return themeObj;
    }

    // Mark as extended collection
    themeObj.$figmaIsExtension = true;
    themeObj.$figmaParentCollectionId = collection.parentCollectionId;

    // Find parent theme ID - look for parent collection with matching mode
    const parentTheme = themesToCreate.find(
        (t) => t.$figmaCollectionId === collection.parentCollectionId
            && t.$figmaModeId === mode.parentModeId,
    );

    if (parentTheme) {
        themeObj.$figmaParentThemeId = parentTheme.id;
        // Create hierarchical group name: "ParentCollection/ChildCollection"
        themeObj.group = `${parentTheme.group}/${themeObj.group}`;
    } else {
        console.warn(
            `Could not find parent theme for extended collection. Parent collection ID: ${collection.parentCollectionId}, Parent mode ID: ${mode.parentModeId}`,
        );
    }

    return themeObj;
}

/**
 * Determines if collections should be processed in two passes
 * Returns separated regular and extended collections
 */
export function separateCollectionsByType<T extends { isExtension?: boolean }>(
    collections: T[],
): {
    regularCollections: T[];
    extendedCollections: T[];
} {
    return {
        regularCollections: collections.filter((c) => !c.isExtension),
        extendedCollections: collections.filter((c) => c.isExtension),
    };
}
