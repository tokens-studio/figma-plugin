/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ToggleGroup, IconButton, Label, Stack,
} from '@tokens-studio/ui';
import { mergeTokenGroups } from '@/utils/tokenHelpers';
import TokenListing from './TokenListing';
import TokensBottomBar from './TokensBottomBar';
import ToggleEmptyButton from './ToggleEmptyButton';
import { mappedTokens } from './createTokenObj';
import { Dispatch } from '../store';
import TokenSetSelector from './TokenSetSelector';
import TokenFilter from './TokenFilter';
import EditTokenFormModal from './EditTokenFormModal';
import JSONEditor from './JSONEditor';
import Box from './Box';
import IconListing from '@/icons/listing.svg';
import useTokens from '../store/useTokens';
import AttentionIcon from '@/icons/attention.svg';
import { TokensContext } from '@/context';
import {
  activeTokenSetSelector, aliasBaseFontSizeSelector, apiProvidersSelector, manageThemesModalOpenSelector, scrollPositionSetSelector, showEditFormSelector, tokenFilterSelector, tokensSelector, tokenTypeSelector, usedTokenSetSelector,
} from '@/selectors';
import { ThemeSelector } from './ThemeSelector';
import { ManageThemesModal } from './ManageThemesModal';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { activeTokensTabSelector } from '@/selectors/activeTokensTabSelector';
import { stringTokensSelector } from '@/selectors/stringTokensSelector';
import { getAliasValue } from '@/utils/alias';
import SidebarIcon from '@/icons/sidebar.svg';
import { defaultTokenResolver } from '@/utils/TokenResolver';
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';
import { IconJson } from '@/icons';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { WebSocket } from './WebSocket';

const StatusToast = ({ open, error }: { open: boolean; error: string | null }) => {
  const [isOpen, setOpen] = React.useState(open);
  React.useEffect(() => {
    setOpen(open);
  }, [open]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
          <Box
            css={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              padding: '$3',
            }}
          >
            <Box
              css={{
                background: '$dangerFg',
                color: '$fgOnEmphasis',
                fontSize: '$xsmall',
                fontWeight: '$sansBold',
                padding: '$3 $4',
                paddingLeft: 0,
                boxShadow: '$contextMenu',
                borderRadius: '$medium',
                display: 'flex',
                gap: '$2',
                width: '100%',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                wordBreak: 'break-word',
              }}
            >
              <Box css={{ flexShrink: 0 }}>
                <AttentionIcon />
              </Box>
              {error}
            </Box>
          </Box>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

function Tokens({ isActive }: { isActive: boolean }) {
  const tokens = useSelector(tokensSelector);
  const tokenFormat = useSelector(tokenFormatSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const activeTokensTab = useSelector(activeTokensTabSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const stringTokens = useSelector(stringTokensSelector);
  const showEditForm = useSelector(showEditFormSelector);
  const manageThemesModalOpen = useSelector(manageThemesModalOpenSelector);
  const scrollPositionSet = useSelector(scrollPositionSetSelector);
  const tokenFilter = useSelector(tokenFilterSelector);
  const aliasBaseFontSize = useSelector(aliasBaseFontSizeSelector);
  const apiProviders = useSelector(apiProvidersSelector);
  const dispatch = useDispatch<Dispatch>();
  const [tokenSetsVisible, setTokenSetsVisible] = React.useState(true);
  const { getStringTokens } = useTokens();
  const tokenDiv = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation(['tokens']);

  React.useEffect(() => {
    if (tokenDiv.current) {
      tokenDiv.current.addEventListener('scroll', () => {}, false);
    }
  }, []);

  React.useEffect(() => {
    if (scrollPositionSet && tokenDiv.current && typeof tokenDiv.current.scrollTo === 'function') {
      tokenDiv.current.scrollTo(0, scrollPositionSet[activeTokenSet]);
    }
  }, [activeTokenSet]);

  const resolvedTokens = React.useMemo(
    () => defaultTokenResolver.setTokens(mergeTokenGroups(tokens, {
      ...usedTokenSet,
      [activeTokenSet]: TokenSetStatus.ENABLED,
    })),
    [tokens, usedTokenSet, activeTokenSet],
  );

  const tokenType = useSelector(tokenTypeSelector);

  const [error, setError] = React.useState<string | null>(null);

  const handleChangeJSON = React.useCallback((val: string) => {
    setError(null);
    dispatch.tokenState.setStringTokens(val);
  }, [dispatch.tokenState]);

  const memoizedTokens = React.useMemo(() => {
    if (tokens[activeTokenSet]) {
      const mapped = mappedTokens(tokens[activeTokenSet], tokenFilter).sort((a, b) => {
        if (b[1].values) {
          return 1;
        }
        if (a[1].values) {
          return -1;
        }
        return 0;
      });
      return mapped.map(([key, { values, isPro, ...schema }]) => ({
        key,
        values,
        schema,
        isPro,
      }));
    }
    return [];
  }, [tokens, activeTokenSet, tokenFilter]);

  const handleToggleTokenSetsVisibility = React.useCallback(() => {
    setTokenSetsVisible(!tokenSetsVisible);
  }, [tokenSetsVisible]);

  const [activeTokensTabToggleState, setActiveTokensTabToggleState] = React.useState<'list' | 'json'>(activeTokensTab);

  const handleSetTokensTab = React.useCallback((tab: 'list' | 'json') => {
    if (tab === 'list' || tab === 'json') {
      setActiveTokensTabToggleState(tab);
      dispatch.uiState.setActiveTokensTab(tab);
    }
  }, [dispatch.uiState]);

  const tokensContextValue = React.useMemo(() => ({
    resolvedTokens,
  }), [resolvedTokens]);

  React.useEffect(() => {
    // @README these dependencies aren't exhaustive
    // because of specific logic requirements
    setError(null);
    dispatch.tokenState.setStringTokens(getStringTokens());
  }, [tokens, activeTokenSet, tokenFormat, tokenType, dispatch.tokenState]); // getStringTokens removed to fix bug around first paste/edit (useEffect was being triggered)

  React.useEffect(() => {
    // @README these dependencies aren't exhaustive
    // because of specific logic requirements
    if (getStringTokens() !== stringTokens) {
      dispatch.tokenState.setHasUnsavedChanges(true);
    } else {
      dispatch.tokenState.setHasUnsavedChanges(false);
    }
  }, [dispatch, tokens, stringTokens, activeTokenSet, getStringTokens]);

  React.useEffect(() => {
    const newBaseFontSize = getAliasValue(aliasBaseFontSize, resolvedTokens);
    dispatch.settings.setBaseFontSize(String(newBaseFontSize));
  }, [resolvedTokens, aliasBaseFontSize]);

  const saveScrollPositionSet = React.useCallback((tokenSet: string) => {
    if (tokenDiv.current) {
      dispatch.uiState.setScrollPositionSet({ ...scrollPositionSet, [tokenSet]: tokenDiv.current?.scrollTop });
    }
  }, [dispatch, scrollPositionSet]);

  if (!isActive) return null;

  const isWebSocket = apiProviders.some((provider) => provider.provider === StorageProviderType.WEB_SOCKET);

  if (isWebSocket) {
    return <WebSocket />;
  }

  return (
    <TokensContext.Provider value={tokensContextValue}>
      <Box
        css={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          css={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '$2',
            gap: '$2',
            borderBottom: '1px solid',
            borderColor: '$borderMuted',
          }}
        >
          <IconButton
            onClick={handleToggleTokenSetsVisibility}
            icon={<SidebarIcon />}
            tooltipSide="bottom"
            size="small"
            variant="invisible"
            tooltip={tokenSetsVisible ? 'Collapse sidebar' : 'Expand sidebar'}
          />
          <TokenFilter />
          <ThemeSelector />
          <Box
            css={{
              display: 'flex',
              gap: '$2',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <ToggleGroup
              size="small"
              type="single"
              value={activeTokensTabToggleState}
              onValueChange={handleSetTokensTab}
            >
              <ToggleGroup.Item value="list">
                <IconListing />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="json">
                <IconJson />
              </ToggleGroup.Item>
            </ToggleGroup>
          </Box>
        </Box>
        <Box
          css={{
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            borderBottom: '1px solid',
            borderColor: '$borderMuted',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {tokenSetsVisible && (
            <TokenSetSelector saveScrollPositionSet={saveScrollPositionSet} />
          )}
          <Box
            css={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {activeTokensTab === 'json' ? (
              <Box css={{ position: 'relative', height: '100%' }}>
                <JSONEditor stringTokens={stringTokens} handleChange={handleChangeJSON} />
                <StatusToast
                  open={Boolean(error)}
                  error={error}
                />
              </Box>
            ) : (
              <Box ref={tokenDiv} css={{ width: '100%', paddingBottom: '$6' }} className="content scroll-container">
                {memoizedTokens.map(({
                  key, values, isPro, schema,
                }) => (
                  <div key={key}>
                    <TokenListing
                      tokenKey={key}
                      label={schema.label || key}
                      schema={schema}
                      values={values}
                      isPro={isPro}
                    />
                  </div>
                ))}
                <ToggleEmptyButton />
                {showEditForm && <EditTokenFormModal resolvedTokens={resolvedTokens} />}
              </Box>
            )}
          </Box>
          {manageThemesModalOpen && <ManageThemesModal />}
        </Box>
        <TokensBottomBar handleError={setError} />
      </Box>
    </TokensContext.Provider>
  );
}

export default Tokens;
