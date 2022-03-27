/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import TokenListing from './TokenListing';
import TokensBottomBar from './TokensBottomBar';
import ToggleEmptyButton from './ToggleEmptyButton';
import { mappedTokens } from './createTokenObj';
import { Dispatch, RootState } from '../store';
import TokenSetSelector from './TokenSetSelector';
import TokenFilter from './TokenFilter';
import EditTokenFormModal from './EditTokenFormModal';
import JSONEditor from './JSONEditor';
import Box from './Box';
import IconButton from './IconButton';
import IconListing from '@/icons/listing.svg';
import IconJSON from '@/icons/json.svg';
import IconDisclosure from '@/icons/disclosure.svg';
import { styled } from '@/stitches.config';
import useConfirm from '../hooks/useConfirm';
import { track } from '@/utils/analytics';
import { UpdateMode } from '@/types/state';
import useTokens from '../store/useTokens';
import parseTokenValues from '@/utils/parseTokenValues';
import parseJson from '@/utils/parseJson';
import AttentionIcon from '@/icons/attention.svg';

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

const StyledButton = styled('button', {
  '&:focus, &:hover': {
    boxShadow: 'none',
    background: '$bgSubtle',
  },
});

const StyledIconDisclosure = styled(IconDisclosure, {
  transition: 'transform 0.2s ease-in-out',
  variants: {
    open: {
      true: {
        transform: 'rotate(0deg)',
      },
      false: {
        transform: 'rotate(180deg)',
      },
    },
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
                background: '$dangerBgEmphasis',
                color: '$textOnEmphasis',
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
  const {
    tokens, activeTokenSet, usedTokenSet, hasUnsavedChanges,
  } = useSelector((state: RootState) => state.tokenState);
  const { showEditForm, tokenFilter } = useSelector((state: RootState) => state.uiState);
  const dispatch = useDispatch<Dispatch>();
  const [activeTokensTab, setActiveTokensTab] = React.useState('list');
  const [tokenSetsVisible, setTokenSetsVisible] = React.useState(true);
  const { getStringTokens } = useTokens();

  const { updateMode = UpdateMode.PAGE } = useSelector((state: RootState) => state.settings);
  const { confirm } = useConfirm();
  const shouldConfirm = React.useMemo(() => updateMode === UpdateMode.DOCUMENT, [updateMode]);

  const resolvedTokens = React.useMemo(
    () => resolveTokenValues(mergeTokenGroups(tokens, [...usedTokenSet, activeTokenSet])),
    [tokens, usedTokenSet, activeTokenSet],
  );
  const [stringTokens, setStringTokens] = React.useState(JSON.stringify(tokens[activeTokenSet], null, 2));
  const { tokenType } = useSelector((state: RootState) => state.settings);

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setError(null);
    setStringTokens(getStringTokens());
  }, [tokens, activeTokenSet, tokenType]);

  const handleChangeJSON = (val) => {
    setError(null);
    try {
      const parsedTokens = parseJson(val);
      parseTokenValues(parsedTokens);
    } catch (e) {
      setError(`Unable to read JSON: ${JSON.stringify(e)}`);
    }
    setStringTokens(val);
  };

  React.useEffect(() => {
    if (getStringTokens() !== stringTokens) {
      dispatch.tokenState.setHasUnsavedChanges(true);
    } else {
      dispatch.tokenState.setHasUnsavedChanges(false);
    }
  }, [tokens, stringTokens, activeTokenSet]);

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

  const handleSaveJSON = () => {
    dispatch.tokenState.setJSONData(stringTokens);
  };

  const handleUpdate = React.useCallback(async () => {
    if (activeTokensTab === 'list') {
      track('Update Tokens');
      if (shouldConfirm) {
        confirm({
          text: 'Are you sure?',
          description:
            'You are about to run a document wide update. This operation can take more than 30 minutes on very large documents.',
        }).then(({ result }) => {
          if (result) {
            dispatch.tokenState.updateDocument();
          }
        });
      } else {
        dispatch.tokenState.updateDocument();
      }
    } else {
      track('Update JSON');

      dispatch.tokenState.setJSONData(stringTokens);
    }
  }, [confirm, shouldConfirm]);

  if (!isActive) return null;

  return (
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
          <StyledButton style={{ height: '100%' }} type="button" onClick={() => setTokenSetsVisible(!tokenSetsVisible)}>
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
              <StyledIconDisclosure open={tokenSetsVisible} />
            </Box>
          </StyledButton>
        </Box>
        <TokenFilter />
        <Box
          css={{
            display: 'flex',
            gap: '$2',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '$4',
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
            <TokenSetSelector />
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
            <Box css={{ width: '100%', paddingBottom: '$6' }} className="content scroll-container">
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
      <TokensBottomBar handleUpdate={handleUpdate} handleSaveJSON={handleSaveJSON} hasJSONError={error} />
    </Box>
  );
}

export default Tokens;
