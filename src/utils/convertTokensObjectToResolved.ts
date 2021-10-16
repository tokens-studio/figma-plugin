import {mergeTokenGroups, resolveTokenValues} from '@/plugin/tokenHelpers';
import convertTokensToGroupedObject from './convertTokensToGroupedObject';
import parseTokenValues from './parseTokenValues';

// Takes Figma Tokens input, resolves all aliases while respecting user's theme choice and outputs an object with resolved tokens, ready to be consumed by style dictionary.
export default function convertTokensObjectToResolved(tokens, usedSets = [], excludedSets = []) {
    // Parse tokens into array structure
    const parsed = parseTokenValues(tokens);
    // Merge to one giant array
    const merged = mergeTokenGroups(parsed, usedSets);
    // Resolve aliases
    const resolved = resolveTokenValues(merged);
    // Group back into one object
    const object = convertTokensToGroupedObject(resolved, excludedSets);
    return object;
}
