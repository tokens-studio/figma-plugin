import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { tokensSharedDataHandler } from '@/plugin/SharedDataHandler';
import { UsedTokenSetsMap } from '@/types';
import { migrate } from './migrate';

export async function getUsedTokenSet(): Promise<UsedTokenSetsMap | null> {
  const usedTokenSets = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.usedTokenSet);
  let parsedUsedTokenSet: UsedTokenSetsMap = {};
  if (usedTokenSets) {
    // @README in previous versions the used tokens were saved as string[]
    // this means we will need to normalize it into the new format to support
    // multi-state token sets (disabled,source,enabled)
    const savedUsedTokensSet = JSON.parse(usedTokenSets) as (
      string[] | UsedTokenSetsMap
    );
    parsedUsedTokenSet = migrate<typeof savedUsedTokensSet, UsedTokenSetsMap>(
      savedUsedTokensSet,
      (input): input is string[] => Array.isArray(input),
      (input) => (
        Object.fromEntries<TokenSetStatus>(
          input.map((tokenSet) => (
            [tokenSet, TokenSetStatus.ENABLED]
          )),
        )
      ),
    );
    return parsedUsedTokenSet;
  }
  return null;
}
