import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Text } from '@tokens-studio/ui';
import ChangeStateListingHeading from './ChangeStateListingHeading';
import ChangedTokenItem from './ChangedTokenItem';
import { StyledDiff } from './StyledDiff';
import { useChangedState } from '@/hooks/useChangedState';

function ChangedStateList() {
  const { changedState } = useChangedState();
  console.log('changedState: ', changedState);
  const [collapsed, setCollapsed] = React.useState(false);
  const { t } = useTranslation(['tokens']);
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
    <Stack direction="column" gap={1} css={{ padding: '$4' }}>
      {Object.entries(changedState.tokens).length > 0 && Object.entries(changedState.tokens)?.map(([tokenSet, tokenList]) => (
        <Box key={tokenSet}>
          <ChangeStateListingHeading count={tokenList.length} onCollapse={handleSetIntCollapsed} set={tokenSet} label={tokenSet} isCollapsed={collapsedChangedStateList.includes(tokenSet)} />
          {!collapsedChangedStateList.includes(tokenSet) && tokenList && (
            tokenList.map((token) => (
              <ChangedTokenItem key={token.name} token={token} />
            ))
          )}
        </Box>
      ))}
      {
        changedState.themes.length > 0 && (
          <>
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} set="$themes" label="$themes" isCollapsed={collapsedChangedStateList.includes('$themes')} />
            {!collapsedChangedStateList.includes('$themes') && (
              changedState.themes.map((theme) => (
                <Stack
                  direction="row"
                  justify="between"
                  align="center"
                  gap={3}
                  css={{ padding: '$1 $4' }}
                  key={theme.id}
                >
                  <Text bold size="small">{theme.name}</Text>
                  {
                    theme.importType === 'REMOVE' && (
                    <StyledDiff size="small" type="danger">
                      {t('configurationRemoved')}
                    </StyledDiff>
                    )
                  }
                  {
                    (theme.importType === 'NEW' || theme.importType === 'UPDATE') && (
                    <StyledDiff size="small" type="success">
                      {theme.importType === 'NEW' ? t('configuration-added') : t('configurationChanged') }
                    </StyledDiff>
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
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} set="$metadata" label="$metadata" isCollapsed={collapsedChangedStateList.includes('$metadata')} />
            {!collapsedChangedStateList.includes('$metadata') && (
              <Stack
                direction="row"
                justify="end"
                align="end"
                css={{ padding: '$1 $4' }}
              >
                <StyledDiff size="small" type="danger">
                  {t('configurationChanged')}
                </StyledDiff>
              </Stack>
            )}
          </>
        )
      }
    </Stack>
  );
}

export default ChangedStateList;
