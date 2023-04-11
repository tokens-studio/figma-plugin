import React from 'react';
import Stack from './Stack';
import ChangeStateListingHeading from './ChangeStateListingHeading';
import { CompareStateType } from '@/utils/findDifferentState';
import Text from './Text';
import ChangedTokenItem from './ChangedTokenItem';
import { StyledText } from './StyledText';

function ChangedStateList({ changedState }: { changedState: CompareStateType }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [collapsedChangedStateList, setCollapsedChangedStateList] = React.useState<Array<string>>([]);
  const handleSetIntCollapsed = React.useCallback((e: React.MouseEvent<HTMLButtonElement>, tokenSet: string) => {
    e.stopPropagation();
    if (e.altKey) {
      if (collapsed) {
        setCollapsedChangedStateList([]);
      } else {
        const collapsedStateSetList = [...Object.keys(changedState.tokens), '$themes', '$metadata'];
        setCollapsedChangedStateList(collapsedStateSetList);
      }
      setCollapsed(!collapsed);
    } else if (collapsedChangedStateList.includes(tokenSet)) {
      setCollapsedChangedStateList(collapsedChangedStateList.filter((item) => item !== tokenSet));
    } else {
      setCollapsedChangedStateList([...collapsedChangedStateList, tokenSet]);
    }
  }, [collapsedChangedStateList, changedState.tokens, collapsed]);

  return (
    <Stack direction="column" gap={1}>
      {Object.entries(changedState.tokens).length > 0 && Object.entries(changedState.tokens)?.map(([tokenSet, tokenList]) => (
        tokenList.length > 0 && (
        <>
          <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} key={tokenSet} label={tokenSet} isCollapsed={collapsedChangedStateList.includes(tokenSet)} />
          {!collapsedChangedStateList.includes(tokenSet) && tokenList && (
            tokenList.map((token) => (
              <ChangedTokenItem token={token} />
            ))
          )}
        </>
        )
      ))}
      {
        changedState.themes.length > 0 && (
          <>
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} key="$themes" label="$themes" isCollapsed={collapsedChangedStateList.includes('$themes')} />
            {!collapsedChangedStateList.includes('$themes') && (
              changedState.themes.map((theme) => (
                <Stack
                  direction="row"
                  justify="between"
                  align="center"
                  gap={1}
                  css={{ padding: '$2 $4' }}
                >
                  <Text bold size="small">{theme.name}</Text>
                  {
                    theme.importType === 'REMOVE' && (
                    <StyledText size="small" type="danger">
                      Configuration Removed
                    </StyledText>
                    )
                  }
                  {
                    (theme.importType === 'NEW' || theme.importType === 'UPDATE') && (
                    <StyledText size="small" type="success">
                      {theme.importType === 'NEW' ? 'Configuration Added' : 'Configuration Changed' }
                    </StyledText>
                    )
                  }
                </Stack>
              ))
            )}
          </>
        )
      }
      {
        (changedState.metadata?.tokenSetOrder && Object.entries(changedState.metadata.tokenSetOrder).length > 0) && (
          <>
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} key="$metadata" label="$metadata" isCollapsed={collapsedChangedStateList.includes('$metadata')} />
            {!collapsedChangedStateList.includes('$metadata') && (
              <Stack
                direction="row"
                justify="end"
                align="end"
                css={{ padding: '$2 $4' }}
              >
                <StyledText size="small" type="danger">
                  Configuration changed
                </StyledText>
              </Stack>
            )}
          </>
        )
      }
    </Stack>
  );
}

export default ChangedStateList;
