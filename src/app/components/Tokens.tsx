/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
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
import IconButton from './IconButton';
import IconListing from '@/icons/listing.svg';
import IconJSON from '@/icons/json.svg';
import useTokens from '../store/useTokens';
import parseTokenValues from '@/utils/parseTokenValues';
import parseJson from '@/utils/parseJson';
import AttentionIcon from '@/icons/attention.svg';
import { TokensContext } from '@/context';
import {
  activeTokenSetSelector, aliasBaseFontSizeSelector, manageThemesModalOpenSelector, scrollPositionSetSelector, showEditFormSelector, tokenFilterSelector, tokensSelector, tokenTypeSelector, usedTokenSetSelector,
} from '@/selectors';
import { ThemeSelector } from './ThemeSelector';
import IconToggleableDisclosure from '@/app/components/IconToggleableDisclosure';
import { styled } from '@/stitches.config';
import { ManageThemesModal } from './ManageThemesModal';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { activeTokensTabSelector } from '@/selectors/activeTokensTabSelector';
import { stringTokensSelector } from '@/selectors/stringTokensSelector';
import { getAliasValue } from '@/utils/alias';

const StyledButton = styled('button', {
  '&:focus, &:hover': {
    boxShadow: 'none',
    background: '$bgSubtle',
  },
});

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
                background: '$dangerBg',
                color: '$onDanger',
                fontSize: '$xsmall',
                fontWeight: '$bold',
                padding: '$3 $4',
                paddingLeft: 0,
                boxShadow: '$contextMenu',
                borderRadius: '$contextMenu',
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
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const activeTokensTab = useSelector(activeTokensTabSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const stringTokens = useSelector(stringTokensSelector);
  const showEditForm = useSelector(showEditFormSelector);
  const manageThemesModalOpen = useSelector(manageThemesModalOpenSelector);
  const scrollPositionSet = useSelector(scrollPositionSetSelector);
  const tokenFilter = useSelector(tokenFilterSelector);
  const aliasBaseFontSize = useSelector(aliasBaseFontSizeSelector);
  const dispatch = useDispatch<Dispatch>();
  const [tokenSetsVisible, setTokenSetsVisible] = React.useState(true);
  const { getStringTokens } = useTokens();
  const tokenDiv = React.useRef<HTMLDivElement>(null);

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
    () => resolveTokenValues(mergeTokenGroups(tokens, {
      ...usedTokenSet,
      [activeTokenSet]: TokenSetStatus.ENABLED,
    })),
    [tokens, usedTokenSet, activeTokenSet],
  );
  const tokenType = useSelector(tokenTypeSelector);

  const [error, setError] = React.useState<string | null>(null);

  const handleChangeJSON = React.useCallback((val: string) => {
    setError(null);
    try {
      const parsedTokens = parseJson(val);
      parseTokenValues(parsedTokens);
    } catch (e) {
      setError(`Unable to read JSON: ${JSON.stringify(e)}`);
    }
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

  const handleSetTokensTabToList = React.useCallback(() => {
    dispatch.uiState.setActiveTokensTab('list');
  }, [dispatch.uiState]);

  const handleSetTokensTabToJSON = React.useCallback(() => {
    dispatch.uiState.setActiveTokensTab('json');
  }, [dispatch.uiState]);

  const tokensContextValue = React.useMemo(() => ({
    resolvedTokens,
  }), [resolvedTokens]);

  React.useEffect(() => {
    // @README these dependencies aren't exhaustive
    // because of specific logic requirements
    setError(null);
    dispatch.tokenState.setStringTokens(getStringTokens());
  }, [tokens, activeTokenSet, tokenType, dispatch.tokenState, getStringTokens]);

  React.useEffect(() => {
    // @README these dependencies aren't exhaustive
    // because of specific logic requirements
    if (getStringTokens() !== stringTokens) {
      dispatch.tokenState.setHasUnsavedChanges(true);
    } else {
      dispatch.tokenState.setHasUnsavedChanges(false);
    }
  }, [dispatch, tokens, stringTokens, activeTokenSet]);

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
            gap: '$2',
            borderBottom: '1px solid',
            borderColor: '$borderMuted',
          }}
        >
          <Box>
            <StyledButton style={{ height: '100%' }} type="button" onClick={handleToggleTokenSetsVisibility}>
              <Box
                css={{
                  fontWeight: '$bold',
                  height: '100%',
                  fontSize: '$xsmall',
                  gap: '$1',
                  padding: '$3 $4',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {activeTokenSet}
                <IconToggleableDisclosure open={tokenSetsVisible} />
              </Box>
            </StyledButton>
          </Box>
          <TokenFilter />
          <ThemeSelector />
          <Box
            css={{
              display: 'flex',
              gap: '$2',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '$4',
              paddingLeft: 0,
            }}
          >
            <IconButton
              variant={activeTokensTab === 'list' ? 'primary' : 'default'}
              dataCy="tokensTabList"
              onClick={handleSetTokensTabToList}
              icon={<IconListing />}
              tooltipSide="bottom"
              tooltip="Listing"
            />
            <IconButton
              variant={activeTokensTab === 'json' ? 'primary' : 'default'}
              dataCy="tokensTabJSON"
              onClick={handleSetTokensTabToJSON}
              icon={<IconJSON />}
              tooltipSide="bottom"
              tooltip="JSON"
            />
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
            <Box>
              <TokenSetSelector saveScrollPositionSet={saveScrollPositionSet} />
            </Box>
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
        <TokensBottomBar
          hasJSONError={!!error}
        />
      </Box>
    </TokensContext.Provider>
  );
}

export default Tokens;
