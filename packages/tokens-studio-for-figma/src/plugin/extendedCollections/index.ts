/**
 * Extended Collections Module
 * 
 * This module provides utilities for working with Figma's extended variable collections.
 * Extended collections allow creating child collections that inherit from parent collections
 * and can override specific variable values.
 * 
 * Note: Extended collections require Figma Enterprise plan.
 */

export { processExtendedCollectionImport, separateCollectionsByType } from './importExtendedCollections';
export {
    createExtendedVariableCollection,
    findParentCollection,
    isExtendedCollectionTheme,
} from './createExtendedCollections';
