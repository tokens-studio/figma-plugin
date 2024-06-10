import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

// Components
import { Button } from '@tokens-studio/ui';
import ApplySelector from './ApplySelector';
import Box from './Box';
import StylesDropdown from './StylesDropdown';
import Stack from './Stack';
import SettingsDropdown from './SettingsDropdown';
import ToolsDropdown from './ToolsDropdown';

// State
import useTokens from '../store/useTokens';
import { hasUnsavedChangesSelector } from '@/selectors';
import { stringTokensSelector } from '@/selectors/stringTokensSelector';

// Utils
import { track } from '@/utils/analytics';
import parseTokenValues from '@/utils/parseTokenValues';
import parseJson from '@/utils/parseJson';

type Props = {
  handleError: (error: string) => void;
};

export default function TokensBottomBar({ handleError }: Props) {
  const hasUnsavedChanges = useSelector(hasUnsavedChangesSelector);
  const stringTokens = useSelector(stringTokensSelector);

  const { handleJSONUpdate } = useTokens();

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
    <Box css={{
      width: '100%', backgroundColor: '$bgDefault',
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
      )
        : (
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
              <StylesDropdown />
            </Stack>
            <Stack direction="row" gap={1}>
              <ApplySelector />
              <SettingsDropdown />
            </Stack>
          </Stack>
        )}
    </Box>
  );
}
