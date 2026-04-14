import { TokenFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { TokenInJSON } from './convertTokens';

/**
 * Applies the `$deprecated` field to a token object according to the active format.
 * - DTCG: keeps `$deprecated: true` at the top level; removes it when falsy.
 * - Legacy: moves `$deprecated: true` into `$extensions['studio.tokens'].deprecated`
 *   and removes the top-level field in both cases.
 *
 * Mutates the passed object in place (consistent with the surrounding serialization code).
 */
export function applyDeprecatedToFormat(tokenInJSON: TokenInJSON): void {
  if (TokenFormat.format === TokenFormatOptions.DTCG) {
    if (!tokenInJSON.$deprecated) delete tokenInJSON.$deprecated;
  } else {
    if (tokenInJSON.$deprecated) {
      tokenInJSON.$extensions = {
        ...tokenInJSON.$extensions,
        'studio.tokens': {
          ...tokenInJSON.$extensions?.['studio.tokens'],
          deprecated: true,
        },
      };
    }
    delete tokenInJSON.$deprecated;
  }
}
