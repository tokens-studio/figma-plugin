import React from 'react';
import Stack from './Stack';
import { AnyTokenList } from '@/types/tokens';
import ChangeTokenListingHeading from './ChangeTokenListingHeading';
import ChangedTokenItem from './ChangedTokenItem';

function ChangedTokenList({ changedTokens }: { changedTokens: Record<string, AnyTokenList> }) {
  const [collapsedTokenSets, setCollapsedTokenSets] = React.useState<Array<string>>([]);

  const handleSetIntCollapsed = React.useCallback((e: React.MouseEvent<HTMLButtonElement>, tokenSet: string) => {
    e.stopPropagation();
    if (e.altKey) {
      setCollapsedTokenSets([]);
    } else if (collapsedTokenSets.includes(tokenSet)) {
      setCollapsedTokenSets(collapsedTokenSets.filter((item) => item !== tokenSet));
    } else {
      setCollapsedTokenSets([...collapsedTokenSets, tokenSet]);
    }
  }, [collapsedTokenSets]);

  return (
    <Stack
      direction="column"
      gap={1}
      css={{
        borderTop: '1px solid',
        borderColor: '$borderMuted',
      }}
    >
      {Object.entries(changedTokens).map(([tokenSet, tokenList]) => (
        tokenList.length > 0 && (
        <>
          <ChangeTokenListingHeading onCollapse={handleSetIntCollapsed} tokenKey={tokenSet} label={tokenSet} isCollapsed={collapsedTokenSets.includes(tokenSet)} />
          {!collapsedTokenSets.includes(tokenSet) && tokenList && (
            tokenList.map((token) => (
              <ChangedTokenItem token={token} />
            ))
          )}
        </>
        )
      ))}
    </Stack>
  );
}

export default ChangedTokenList;
