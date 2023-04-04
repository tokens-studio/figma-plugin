import React from 'react';
import { useSelector } from 'react-redux';
import {
  changedTokensSelector, storageTypeSelector,
} from '@/selectors';
import usePullDialog from '../hooks/usePullDialog';
import Button from './Button';
import Heading from './Heading';
import Modal from './Modal';
import Stack from './Stack';
import Spinner from './Spinner';
import Box from './Box';
import { transformProviderName } from '@/utils/transformProviderName';
import ChangeTokenListingHeading from './ChangeTokenListingHeading';
import Text from './Text';
import { ImportToken } from '@/types/tokens';

function ChangedToken({
  token,
}: {
  token: ImportToken;
}) {
  return (
    <Stack direction="row" justify="between" css={{ padding: '$2 $4' }}>
      <Stack direction={token.importType === 'REMOVE' ? 'row' : 'column'} gap={1} justify="between" css={{ width: '100%' }}>
        <Text bold size="small">{token.name}</Text>
        {
          ((token.importType === 'UPDATE' && token.oldValue) || token.importType === 'NEW') && (
            <Stack direction="row" align="center" justify="between" gap={1}>
              <Text size="small">Value</Text>
              <Stack direction="row" align="center" gap={1}>
                {token.oldValue ? (
                  <Box css={{
                    padding: '$2',
                    wordBreak: 'break-all',
                    fontWeight: '$bold',
                    borderRadius: '$default',
                    fontSize: '$xsmall',
                    backgroundColor: '$bgDanger',
                    color: '$fgDanger',
                  }}
                  >
                    {typeof token.oldValue === 'object' ? JSON.stringify(token.oldValue) : token.oldValue}
                  </Box>
                ) : null}
                <Box css={{
                  padding: '$2',
                  wordBreak: 'break-all',
                  fontWeight: '$bold',
                  borderRadius: '$default',
                  fontSize: '$xsmall',
                  backgroundColor: '$bgSuccess',
                  color: '$fgSuccess',
                }}
                >
                  {typeof token.value === 'object' ? JSON.stringify(token.value) : token.value}
                </Box>
              </Stack>
            </Stack>
          )
        }
        {((token.importType === 'UPDATE' && token.oldDescription) || (token.importType === 'NEW' && token.description)) && (
        <Stack direction="row" align="start" justify="between" gap={1}>
          <Text size="small">Description</Text>
          <Stack direction="column" align="end" gap={1}>
            {token.oldDescription ? (
              <Box css={{
                padding: '$2',
                wordBreak: 'break-all',
                fontWeight: '$bold',
                borderRadius: '$default',
                fontSize: '$xsmall',
                backgroundColor: '$bgDanger',
                color: '$fgDanger',
              }}
              >
                {token.oldDescription}
              </Box>
            ) : null}
            <Box css={{
              padding: '$2',
              wordBreak: 'break-all',
              fontWeight: '$bold',
              borderRadius: '$default',
              fontSize: '$xsmall',
              backgroundColor: '$bgSuccess',
              color: '$fgSuccess',
            }}
            >
              {token.description}
            </Box>
          </Stack>
        </Stack>
        )}
        {
          token.importType === 'REMOVE' && (
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
            Removed
          </Text>
          )
        }
      </Stack>
    </Stack>
  );
}

function PullDialog() {
  const [collapsedTokenSets, setCollapsedTokenSets] = React.useState<Array<string>>([]);
  const { onConfirm, onCancel, showPullDialog } = usePullDialog();
  const storageType = useSelector(storageTypeSelector);
  const changedTokens = useSelector(changedTokensSelector);

  const handleOverrideClick = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

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

  switch (showPullDialog) {
    case 'initial': {
      return (
        <Modal
          title={`Pull from ${transformProviderName(storageType.provider)}`}
          showClose
          large
          isOpen
          close={onCancel}
        >
          <Stack direction="column" gap={4}>
            {Object.entries(changedTokens).length > 0 && (
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
                          <ChangedToken token={token} />
                        ))
                      )}
                    </>
                  )
                ))}
              </Stack>
            )}
            <Box css={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '$4',
              borderTop: '1px solid',
              borderColor: '$borderMuted',
            }}
            >
              <Button variant="secondary" id="pullDialog-button-close" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" id="pullDialog-button-override" onClick={handleOverrideClick}>
                Override Tokens
              </Button>
            </Box>
          </Stack>
        </Modal>
      );
    }
    case 'loading': {
      return (
        <Modal
          large
          isOpen
          close={onCancel}
          title={`Pull from ${transformProviderName(storageType.provider)}`}
        >
          <Stack direction="column" gap={4} justify="center" align="center">
            <Spinner />
            <Heading size="medium">
              Fetching Tokens from
              {' '}
              {transformProviderName(storageType.provider)}
            </Heading>
          </Stack>
        </Modal>
      );
    }
    default: {
      return null;
    }
  }
}
export default PullDialog;
