import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import { TransformerOptions } from './types';
import convertTokensToGroupedObject from './convertTokensToGroupedObject';
import parseTokenValues from './parseTokenValues';
import { TokenGroup } from '@/types/tokens';

// Takes Figma Tokens input, resolves all aliases while respecting user's theme choice and outputs an object with resolved tokens, ready to be consumed by style dictionary.
export default function convertTokensObjectToResolved({
  tokens,
  usedSets = [],
  excludedSets = [],
  options,
}: {
  tokens: TokenGroup,
  usedSets?: string[],
  excludedSets?: string[],
  options?: TransformerOptions,
}) {
  const defaultOptions = {
    expandTypography: false,
    resolveValues: true,
    preserveRawValue: false,
  };
  const configuration = {
    ...defaultOptions,
    ...options,
  };
  // Parse tokens into array structure
  const parsed = parseTokenValues(tokens);
  // Merge to one giant array
  const merged = mergeTokenGroups(parsed, usedSets);
  // Resolve aliases
  const resolved = configuration.resolveValues ? resolveTokenValues(merged) : merged;
  // Group back into one object
  const object = convertTokensToGroupedObject(resolved, excludedSets, configuration);
  return object;
}
