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
  overflow: 'hiden',
});

function PushJSON() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const [collapsed, setCollapsed] = React.useState(false);
  const [collapsedChangedStateList, setCollapsedChangedStateList] = React.useState<Array<string>>([]);

  const handleSetIntCollapsed = React.useCallback((e: React.MouseEvent<HTMLButtonElement>, tokenSet: string) => {
    e.stopPropagation();
    if (e.altKey) {
      if (collapsed) {
        setCollapsedChangedStateList([]);
      } else {
        const collapsedStateSetList = [...Object.keys(tokens), '$themes', '$metadata'];
        setCollapsedChangedStateList(collapsedStateSetList);
      }
      setCollapsed(!collapsed);
    } else if (collapsedChangedStateList.includes(tokenSet)) {
      setCollapsedChangedStateList(collapsedChangedStateList.filter((item) => item !== tokenSet));
    } else {
      setCollapsedChangedStateList([...collapsedChangedStateList, tokenSet]);
    }
  }, [collapsedChangedStateList, tokens, collapsed]);

  return (
    <Stack
      direction="column"
      gap={1}
    >
      {Object.entries(tokens).length > 0 && Object.entries(tokens)?.map(([tokenSet, tokenList]) => (
        tokenList.length > 0 && (
          <>
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} set={tokenSet} label={tokenSet} isCollapsed={collapsedChangedStateList.includes(tokenSet)} />
            {!collapsedChangedStateList.includes(tokenSet) && tokenList && (
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
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} set="$themes" label="$themes" isCollapsed={collapsedChangedStateList.includes('$themes')} />
            {!collapsedChangedStateList.includes('$themes') && (
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
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} set="$metadata" label="$metadata" isCollapsed={collapsedChangedStateList.includes('$metadata')} />
            {!collapsedChangedStateList.includes('$metadata') && (
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
