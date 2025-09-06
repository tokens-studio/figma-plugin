import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

// Components
import { Button, IconButton } from '@tokens-studio/ui';
import { WarningTriangleSolid } from 'iconoir-react';
import ApplySelector from './ApplySelector';
import Box from './Box';
import StylesDropdown from './StylesDropdown';
import Stack from './Stack';
import SettingsDropdown from './SettingsDropdown';
import ToolsDropdown from './ToolsDropdown';
import GenerateDocumentationButton from './GenerateDocumentationButton';

// State
import useTokens from '../store/useTokens';
import { hasUnsavedChangesSelector, tokensSelector } from '@/selectors';
import { stringTokensSelector } from '@/selectors/stringTokensSelector';

// Utils
import { track } from '@/utils/analytics';
import parseTokenValues from '@/utils/parseTokenValues';
import parseJson from '@/utils/parseJson';
import ResolveDuplicateTokensModal from './modals/ResolveDuplicateTokensModal';

type Props = {
  handleError: (error: string) => void;
};

export default function TokensBottomBar({ handleError }: Props) {
  const hasUnsavedChanges = useSelector(hasUnsavedChangesSelector);
  const stringTokens = useSelector(stringTokensSelector);
  const tokens = useSelector(tokensSelector);
  const [showResolveDuplicateTokensModal, setShowResolveDuplicateTokensModal] = React.useState<boolean>(false);

  const handleResolveDuplicateTokensModalClose = React.useCallback(() => {
    setShowResolveDuplicateTokensModal(false);
  }, []);

  const handleResolveDuplicateOpen = React.useCallback(() => {
    setShowResolveDuplicateTokensModal(true);
  }, []);

  const { handleJSONUpdate } = useTokens();

  const hasDuplicates = useMemo(
    () => Object.keys(tokens).some((setName) => {
      const currentSetTokens = tokens[setName];
      const seenNames = new Set();

      return currentSetTokens.some((token) => {
        if (seenNames.has(token.name)) {
          return true;
        }
        seenNames.add(token.name);
        return false;
      });
    }),
    [tokens],
  );

  const handleSaveJSON = useCallback(() => {
    try {
      const parsedTokens = parseJson(stringTokens);
      parseTokenValues(parsedTokens);
      track('Saved in JSON');
      handleJSONUpdate(stringTokens);
    } catch (e) {
      handleError(`Unable to read JSON: ${JSON.stringify(e)}`);
    }
  }, [handleError, handleJSONUpdate, stringTokens]);

  const { t } = useTranslation(['general']);

  return (
    <Box
      css={{
        width: '100%',
        backgroundColor: '$bgDefault',
      }}
    >
      {hasUnsavedChanges ? (
        <Box
          css={{
            padding: '$3 $4',
            display: 'flex',
            gap: '$1',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box css={{ fontSize: '$xsmall' }}>{t('unsavedChanges')}</Box>
          <Button variant="primary" onClick={handleSaveJSON}>
            {t('save')}
            {' '}
            JSON
          </Button>
        </Box>
      ) : (
        <Stack
          direction="row"
          gap={2}
          justify="between"
          align="center"
          css={{
            padding: '$3',
          }}
        >
          <Stack direction="row" gap={1} css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
            <ToolsDropdown />
            <GenerateDocumentationButton />
            <StylesDropdown />
          </Stack>
          <Stack direction="row" gap={2}>
            {hasDuplicates && (
              <IconButton
                onClick={handleResolveDuplicateOpen}
                icon={<WarningTriangleSolid />}
                data-testid="resolve-duplicate-modal-open-button"
                variant="danger"
                size="small"
                tooltip="Duplicate Tokens Found"
              />
            )}
            <ApplySelector />
            <SettingsDropdown />
          </Stack>
        </Stack>
      )}
      {showResolveDuplicateTokensModal && (
        <ResolveDuplicateTokensModal
          isOpen={showResolveDuplicateTokensModal}
          onClose={handleResolveDuplicateTokensModalClose}
        />
      )}
    </Box>
  );
}
