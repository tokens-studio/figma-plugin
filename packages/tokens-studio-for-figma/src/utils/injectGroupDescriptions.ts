import set from 'set-value';
import { GroupMetadataMap } from '@/types/tokens';
import { TokenFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

/**
 * Central utility to inject group descriptions into a token object structure
 * This ensures consistent group description handling across all export/stringify functions
 */
export function injectGroupDescriptions(
  tokenObj: Record<string, any>,
  tokenSetName: string,
  groupMetadata?: GroupMetadataMap
): void {
  if (!groupMetadata?.[tokenSetName]) {
    return;
  }

  // Get the correct description key based on current format
  const descriptionKey = TokenFormat.format === TokenFormatOptions.DTCG ? '$description' : 'description';

  // Inject group descriptions at appropriate levels for this token set
  Object.entries(groupMetadata[tokenSetName]).forEach(([path, metadata]) => {
    if (metadata.description) {
      // Set the description at the group level using format-sensitive key
      set(tokenObj, `${path}.${descriptionKey}`, metadata.description);
    }
  });
}

/**
 * Variant for multi-token-set objects where token sets are top-level keys
 */
export function injectGroupDescriptionsMultiSet(
  tokenObj: Record<string, any>,
  groupMetadata?: GroupMetadataMap
): void {
  if (!groupMetadata) {
    return;
  }

  // Get the correct description key based on current format
  const descriptionKey = TokenFormat.format === TokenFormatOptions.DTCG ? '$description' : 'description';

  Object.entries(groupMetadata).forEach(([tokenSetName, tokenSetMetadata]) => {
    if (tokenObj[tokenSetName]) {
      Object.entries(tokenSetMetadata).forEach(([path, metadata]) => {
        if (metadata.description) {
          // Set the description at the group level within the token set
          set(tokenObj, `${tokenSetName}.${path}.${descriptionKey}`, metadata.description);
        }
      });
    }
  });
}