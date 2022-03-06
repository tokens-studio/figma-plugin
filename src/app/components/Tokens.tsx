/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import { useSelector } from 'react-redux';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import TokenListing from './TokenListing';
import TokensBottomBar from './TokensBottomBar';
import ToggleEmptyButton from './ToggleEmptyButton';
import { mappedTokens } from './createTokenObj';
import { RootState } from '../store';
import TokenSetSelector from './TokenSetSelector';
import TokenFilter from './TokenFilter';
import EditTokenFormModal from './EditTokenFormModal';
import JSONEditor from './JSONEditor';
import Box from './Box';
import IconButton from './IconButton';
import IconListing from '@/icons/listing.svg';
import IconCode from '@/icons/code.svg';
import IconDisclosure from '@/icons/disclosure.svg';
import Text from './Text';

interface TokenListingType {
  label: string;
  property: string;
  type: string;
  values: object;
  help?: string;
  explainer?: string;
  schema?: {
    value: object | string;
    options: object | string;
  };
}

function Tokens({ isActive }: { isActive: boolean }) {
  const { tokens, activeTokenSet, usedTokenSet } = useSelector((state: RootState) => state.tokenState);
  const { showEditForm, tokenFilter } = useSelector((state: RootState) => state.uiState);
  const [activeTokensTab, setActiveTokensTab] = React.useState('list');
  const [tokenSetsVisible, setTokenSetsVisible] = React.useState(true);
  const resolvedTokens = React.useMemo(
    () => resolveTokenValues(mergeTokenGroups(tokens, [...usedTokenSet, activeTokenSet])),
    [tokens, usedTokenSet, activeTokenSet],
  );

  const memoizedTokens = React.useMemo(() => {
    if (tokens[activeTokenSet]) {
      return mappedTokens(tokens[activeTokenSet], tokenFilter).sort((a, b) => {
        if (b[1].values) {
          return 1;
        }
        if (a[1].values) {
          return -1;
        }
        return 0;
      });
    }
    return [];
  }, [tokens, activeTokenSet, tokenFilter]);

  if (!isActive) return null;

  return (
    <Box css={{
      flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}
    >
      <Box css={{
        display: 'flex', flexDirection: 'row', gap: '$2', borderBottom: '1px solid', borderColor: '$borderMuted',
      }}
      >
        <Box>
          <button style={{ height: '100%' }} type="button" onClick={() => setTokenSetsVisible(!tokenSetsVisible)}>
            <Box css={{
              fontWeight: '$bold', height: '100%', fontSize: '$small', gap: '$1', padding: '$3 $5', display: 'flex', alignItems: 'center',
            }}
            >
              {activeTokenSet}
              <IconDisclosure />
            </Box>
          </button>
        </Box>
        <TokenFilter />
        <Box css={{
          display: 'flex', gap: '$2', flexDirection: 'row', alignItems: 'center', padding: '$4',
        }}
        >
          <IconButton
            variant={activeTokensTab === 'list' ? 'primary' : 'default'}
            dataCy="tokensTabList"
            onClick={() => setActiveTokensTab('list')}
            icon={<IconListing />}
            tooltipSide="bottom"
            tooltip="Listing"
          />
          <IconButton
            variant={activeTokensTab === 'json' ? 'primary' : 'default'}
            dataCy="tokensTabJSON"
            onClick={() => setActiveTokensTab('json')}
            icon={<IconCode />}
            tooltipSide="bottom"
            tooltip="JSON"
          />
        </Box>
      </Box>
      <Box css={{
        display: 'flex', flexDirection: 'row', flexGrow: 1, borderBottom: '1px solid', borderColor: '$borderMuted', height: '100%', overflow: 'hidden',
      }}
      >
        {tokenSetsVisible && (
        <Box>
          <TokenSetSelector />
        </Box>
        )}
        <Box css={{
          flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
        }}
        >
          {activeTokensTab === 'json' ? <JSONEditor />
            : (
              <Box css={{ width: '100%', paddingBottom: '$6' }} className="content">
                {memoizedTokens.map(([key, group]: [string, TokenListingType]) => (
                  <div key={key}>
                    <TokenListing
                      tokenKey={key}
                      label={group.label || key}
                      explainer={group.explainer}
                      schema={group.schema}
                      property={group.property}
                      tokenType={group.type}
                      values={group.values}
                      resolvedTokens={resolvedTokens}
                    />
                  </div>
                ))}
                <ToggleEmptyButton />
                {showEditForm && <EditTokenFormModal resolvedTokens={resolvedTokens} />}
              </Box>
            )}
        </Box>
      </Box>
      <TokensBottomBar />

    </Box>
  );
}

export default Tokens;
