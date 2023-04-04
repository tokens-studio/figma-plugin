import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Stack from './Stack';
import { TabButton } from './TabButton';
import { lastSyncedStateSelector, tokensSelector } from '@/selectors';
import { tryParseJson } from '@/utils/tryParseJson';
import { findDifferentTokens } from '@/utils/findDifferentTokens';
import { LastSyncedState } from '@/utils/compareLastSyncedState';
import { AnyTokenList } from '@/types/tokens';
import ChangeTokenListingHeading from './ChangeTokenListingHeading';
import ChangedTokenInfo from './ChangedTokenInfo';

const PushInfoContainer: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('Diff');
  const [changedTokens, setChangedTokens] = React.useState<Record<string, AnyTokenList>>({});
  const [collapsedTokenSets, setCollapsedTokenSets] = React.useState<Array<string>>([]);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const tokens = useSelector(tokensSelector);

  React.useEffect(() => {
    const parsedState = tryParseJson<LastSyncedState>(lastSyncedState);
    if (parsedState) {
      setChangedTokens(findDifferentTokens(tokens, parsedState[0]));
    }
  }, [lastSyncedState, tokens]);

  const handleSwitch = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

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
    <>
      <div>
        <TabButton<string> name="Diff" activeTab={activeTab} label="Tokens" onSwitch={handleSwitch} />
        <TabButton<string> name="JSON" activeTab={activeTab} label="Inspect" onSwitch={handleSwitch} />
      </div>
      {
        (activeTab === 'Diff' && Object.entries(changedTokens).length > 0) && (
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
                    <ChangedTokenInfo token={token} />
                  ))
                )}
              </>
              )
            ))}
          </Stack>
        )
      }
      {
        activeTab === 'JSON' && (
          <Stack
            direction="column"
            gap={1}
            css={{
              borderTop: '1px solid',
              borderColor: '$borderMuted',
            }}
          >
            {Object.entries(tokens).map(([tokenSet, tokenList]) => (
              tokenList.length > 0 && (
              <>
                <ChangeTokenListingHeading onCollapse={handleSetIntCollapsed} tokenKey={tokenSet} label={tokenSet} isCollapsed={collapsedTokenSets.includes(tokenSet)} />
                {!collapsedTokenSets.includes(tokenSet) && tokenList && (
                  tokenList.map((token) => (
                    <ChangedTokenInfo token={token} />
                  ))
                )}
              </>
              )
            ))}
          </Stack>
        )
      }
    </>
  );
};

export default PushInfoContainer;
