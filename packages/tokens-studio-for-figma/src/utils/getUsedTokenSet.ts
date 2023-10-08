import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UsedTokenSetProperty } from '@/figmaStorage';
import { UsedTokenSetsMap } from '@/types';
import { migrate } from './migrate';

export async function getUsedTokenSet(): Promise<UsedTokenSetsMap | null> {
  const usedTokenSets = await UsedTokenSetProperty.read();
  let migratedUsedTokenSet: UsedTokenSetsMap = {};
  if (usedTokenSets) {
    // @README in previous versions the used tokens were saved as string[]
    // this means we will need to normalize it into the new format to support
    // multi-state token sets (disabled,source,enabled)
    migratedUsedTokenSet = migrate<typeof usedTokenSets, UsedTokenSetsMap>(
      usedTokenSets,
      (input): input is string[] => Array.isArray(input),
      (input) => (
        Object.fromEntries<TokenSetStatus>(
          input.map((tokenSet) => (
            [tokenSet, TokenSetStatus.ENABLED]
          )),
        )
      ),
    );

    return migratedUsedTokenSet;
  }
  return null;
}
