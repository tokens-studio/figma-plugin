/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from '@radix-ui/react-icons';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import TokensBottomBar from './TokensBottomBar';
import { createTokenGroups, groupTokensByType } from './createTokenObj';
import { Dispatch } from '../store';
import TokenSetSelector from './TokenSetSelector';
import EditTokenFormModal from './EditTokenFormModal';
import JSONEditor from './JSONEditor';
import Box from './Box';
import TokenFilter from './TokenFilter';
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
import { UpdateMode } from '@/constants/UpdateMode';
import TokenByTypeView from './TokenByTypeView';
import TokensUngroupedView from './TokensUngroupedView';
import Button from './Button';
import Stack from './Stack';
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
  const updateMode = useSelector(updateModeSelector);
  const { confirm } = useConfirm();
  const shouldConfirm = React.useMemo(() => updateMode === UpdateMode.DOCUMENT, [updateMode]);
  const [groupByType, setGroupByType] = React.useState(false);

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

  const ungroupedTokens = React.useMemo(() => createTokenGroups(tokens[activeTokenSet], tokenFilter), [tokens, activeTokenSet, tokenFilter]);

  const memoizedTokens = React.useMemo(() => {
    if (tokens[activeTokenSet]) {
      return groupTokensByType(tokens[activeTokenSet], tokenFilter);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleToggleGrouped = React.useCallback(() => {
    setGroupByType(!groupByType);
  }, [groupByType]);

  const handleNewTokenClick = React.useCallback(() => {
    dispatch.uiState.setShowEditForm(true);
  }, [dispatch.uiState]);

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
        <Stack
          direction="row"
          gap={2}
          justify="between"
          css={{
            borderBottom: '1px solid',
            borderColor: '$borderMuted',
            paddingRight: '$2',
          }}
        >
          <StyledButton style={{ height: '100%' }} type="button" onClick={handleToggleTokenSetsVisibility}>
            <Box
              css={{
                fontWeight: '$bold',
                height: '100%',
                fontSize: '$xsmall',
                gap: '$1',
                padding: '$4 $5',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {activeTokenSet}
              <IconToggleableDisclosure open={tokenSetsVisible} />
            </Box>
          </StyledButton>
          <Stack direction="row" gap={1} align="center">
            <ThemeSelector />
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
          </Stack>
        </Stack>
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
                <JSONEditor stringTokens={stringTokens} handleChange={handleChangeJSON} hasError={Boolean(error)} />
                <StatusToast
                  open={Boolean(error)}
                  error={error}
                />
              </Box>
            ) : (
              <Box ref={tokenDiv} css={{ width: '100%', paddingBottom: '$6' }} className="content scroll-container">
                <Stack direction="row" gap={2} css={{ borderBottom: '1px solid $borderMuted', padding: '$3' }}>
                  <TokenFilter />

                  <Stack direction="row" gap={2} css={{ flexShrink: 0 }}>
                    <Button variant="secondary" size="small" onClick={handleToggleGrouped}>
                      {groupByType ? 'Ungroup' : 'Group'}
                    </Button>
                    <Button size="small" icon={<PlusIcon />} variant="secondary" type="button" onClick={handleNewTokenClick}>New</Button>
                  </Stack>
                </Stack>
                {groupByType ? (
                // @ts-ignore
                  <TokenByTypeView tokens={memoizedTokens} />
                ) : (
                  <TokensUngroupedView tokens={ungroupedTokens} />
                )}
                {showEditForm && <EditTokenFormModal resolvedTokens={resolvedTokens} />}
                {manageThemesModalOpen && <ManageThemesModal />}
              </Box>
            )}
          </Box>
        </Box>
        <TokensBottomBar
          hasJSONError={!!error}
        />
      </Box>
    </TokensContext.Provider>
  );
}

export default Tokens;
