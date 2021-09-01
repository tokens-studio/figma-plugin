import {mergeTokenGroups, resolveTokenValues} from '@/plugin/tokenHelpers';
import convertTokensToGroupedObject from './convertTokensToGroupedObject';
import parseTokenValues from './parseTokenValues';

// Takes Figma Tokens input, resolves all aliases while respecting user's theme choice and outputs an object with resolved tokens, ready to be consumed by style dictionary.
export default function convertTokensObjectToResolved(tokens, usedSets = []) {
    // Parse tokens into array structure
    const parsed = parseTokenValues(tokens.values);
    // Merge to one giant array
    const merged = mergeTokenGroups(parsed, usedSets);
    console.log('MErged is', merged);
    // Resolve aliases
    const resolved = resolveTokenValues(merged);
    console.log('resolved is', resolved);
    // Group back into one object
    const object = convertTokensToGroupedObject(resolved);
    console.log('object is', object);
    return object;
}
