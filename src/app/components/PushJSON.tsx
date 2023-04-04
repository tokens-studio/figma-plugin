import React from 'react';
import { useSelector } from 'react-redux';
import Stack from './Stack';
import ChangeTokenListingHeading from './ChangeTokenListingHeading';
import { themesListSelector, tokensSelector } from '@/selectors';
import stringifyTokens from '@/utils/stringifyTokens';
import Textarea from './Textarea';

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
      css={{
        borderTop: '1px solid',
        borderColor: '$borderMuted',
      }}
    >
      {Object.entries(tokens).length > 0 && Object.entries(tokens)?.map(([tokenSet, tokenList]) => (
        tokenList.length > 0 && (
        <>
          <ChangeTokenListingHeading onCollapse={handleSetIntCollapsed} tokenKey={tokenSet} label={tokenSet} isCollapsed={collapsedTokenSets.includes(tokenSet)} />
          {!collapsedTokenSets.includes(tokenSet) && tokenList && (
          <Textarea
            isDisabled
            rows={21}
            value={stringifyTokens(tokens, tokenSet)}
          />
          )}
        </>
        )
      ))}
      {
        themes.length > 0 && (
          <>
            <ChangeTokenListingHeading onCollapse={handleSetIntCollapsed} tokenKey="$themes" label="$themes" isCollapsed={collapsedTokenSets.includes('$themes')} />
            {!collapsedTokenSets.includes('$themes') && (
            <Textarea
              isDisabled
              rows={21}
              value={JSON.stringify(themes, null, 2)}
            />
            )}
          </>
        )
      }
    </Stack>
  );
}

export default PushJSON;
