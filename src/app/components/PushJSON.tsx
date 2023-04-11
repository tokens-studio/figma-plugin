import React from 'react';
import { useSelector } from 'react-redux';
import Stack from './Stack';
import ChangeStateListingHeading from './ChangeStateListingHeading';
import { themesListSelector, tokensSelector } from '@/selectors';
import stringifyTokens from '@/utils/stringifyTokens';
import { styled } from '@/stitches.config';

const StyledJSONContent = styled('pre', {
  padding: '$2 $4',
  whiteSpace: 'pre-wrap',
});

function PushJSON() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
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
    >
      {Object.entries(tokens).length > 0 && Object.entries(tokens)?.map(([tokenSet, tokenList]) => (
        tokenList.length > 0 && (
        <>
          <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} key={tokenSet} label={tokenSet} isCollapsed={collapsedTokenSets.includes(tokenSet)} />
          {!collapsedTokenSets.includes(tokenSet) && tokenList && (
            <StyledJSONContent>
              {stringifyTokens(tokens, tokenSet)}
            </StyledJSONContent>
          )}
        </>
        )
      ))}
      {
        themes.length > 0 && (
          <>
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} key="$themes" label="$themes" isCollapsed={collapsedTokenSets.includes('$themes')} />
            {!collapsedTokenSets.includes('$themes') && (
            <StyledJSONContent>
              {JSON.stringify(themes, null, 2)}
              {' '}
            </StyledJSONContent>
            )}
          </>
        )
      }
      {
        Object.keys(tokens).length > 0 && (
          <>
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} key="$metadata" label="$metadata" isCollapsed={collapsedTokenSets.includes('$metadata')} />
            {!collapsedTokenSets.includes('$metadata') && (
            <StyledJSONContent>
              {JSON.stringify(Object.keys(tokens), null, 2)}
            </StyledJSONContent>
            )}
          </>
        )
      }
    </Stack>
  );
}

export default PushJSON;
