import React from 'react';
import Stack from './Stack';
import ChangeStateListingHeading from './ChangeStateListingHeading';
import ChangedTokenItem from './ChangedTokenItem';
import { CompareStateType } from '@/utils/findDifferentState';
import Text from './Text';

function ChangedStateList({ changedState }: { changedState: CompareStateType }) {
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
      {Object.entries(changedState.tokens).length > 0 && Object.entries(changedState.tokens)?.map(([tokenSet, tokenList]) => (
        tokenList.length > 0 && (
        <>
          <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} tokenKey={tokenSet} label={tokenSet} isCollapsed={collapsedTokenSets.includes(tokenSet)} />
          {!collapsedTokenSets.includes(tokenSet) && tokenList && (
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
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} tokenKey="$themes" label="$themes" isCollapsed={collapsedTokenSets.includes('$themes')} />
            {!collapsedTokenSets.includes('$themes') && (
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
                    <Text
                      size="small"
                      css={{
                        padding: '$2',
                        wordBreak: 'break-all',
                        fontWeight: '$bold',
                        borderRadius: '$default',
                        fontSize: '$xsmall',
                        backgroundColor: '$bgDanger',
                        color: '$fgDanger',
                      }}
                    >
                      Configuration Removed
                    </Text>
                    )
                  }
                  {
                    (theme.importType === 'NEW' || theme.importType === 'UPDATE') && (
                    <Text
                      size="small"
                      css={{
                        padding: '$2',
                        wordBreak: 'break-all',
                        fontWeight: '$bold',
                        borderRadius: '$default',
                        fontSize: '$xsmall',
                        backgroundColor: '$bgSuccess',
                        color: '$fgSuccess',
                      }}
                    >
                      {theme.importType === 'NEW' ? 'Configuration Added' : 'Configuration Changed' }
                    </Text>
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
            <ChangeStateListingHeading onCollapse={handleSetIntCollapsed} tokenKey="$metadata" label="$metadata" isCollapsed={collapsedTokenSets.includes('$metadata')} />
            {!collapsedTokenSets.includes('$metadata') && (
              <Stack
                direction="row"
                justify="end"
                align="end"
                css={{ padding: '$2 $4' }}
              >
                <Text
                  size="small"
                  css={{
                    padding: '$2',
                    wordBreak: 'break-all',
                    fontWeight: '$bold',
                    borderRadius: '$default',
                    fontSize: '$xsmall',
                    backgroundColor: '$bgSuccess',
                    color: '$fgSuccess',
                  }}
                >
                  Configuration changed
                </Text>
              </Stack>
            )}
          </>
        )
      }

    </Stack>
  );
}

export default ChangedStateList;
