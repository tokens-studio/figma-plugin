import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import { TransformerOptions } from './types';
import convertTokensToGroupedObject from './convertTokensToGroupedObject';
import parseTokenValues from './parseTokenValues';
import { SetTokenDataPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

// Takes Figma Tokens input, resolves all aliases while respecting user's theme choice and outputs an object with resolved tokens, ready to be consumed by style dictionary.
export default function convertTokensObjectToResolved(
  tokens: SetTokenDataPayload['values'],
  usedSets: string[] = [],
  excludedSets: string[] = [],
  options: TransformerOptions = {
    expandTypography: false,
    expandShadow: false,
    expandComposition: false,
    expandBorder: false,
    preserveRawValue: false,
    resolveReferences: true,
  },
) {
  // Parse tokens into array structure
  const parsed = parseTokenValues(tokens);
  // Merge to one giant array
  const merged = mergeTokenGroups(
    parsed,
    // @README this function is only used in the utils/transform file
    // which in turn is only used for a local script -- in which case for now we do not
    // need to fully support the SOURCE state
    Object.fromEntries(usedSets.map((tokenSet) => ([tokenSet, TokenSetStatus.ENABLED]))),
  );
  // Resolve aliases
  const resolved = resolveTokenValues(merged);
  // Group back into one object
  const object = convertTokensToGroupedObject(resolved, excludedSets, options);
  return object;
}
