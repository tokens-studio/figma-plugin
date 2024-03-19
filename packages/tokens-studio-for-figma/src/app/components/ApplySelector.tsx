import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { DotFilledIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Button, DropdownMenu } from '@tokens-studio/ui';
import { Dispatch } from '../store';
import IconChevronDown from '@/icons/chevrondown.svg';
import { settingsStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { UpdateMode } from '@/constants/UpdateMode';
import Stack from './Stack';
import useTokens from '../store/useTokens';
import Box from './Box';

export default function ApplySelector() {
  const { updateMode } = useSelector(settingsStateSelector, isEqual);
  const { t } = useTranslation(['tokens']);

  const { handleUpdate } = useTokens();

  const { setUpdateMode } = useDispatch<Dispatch>().settings;

  const handleApplySelection = React.useCallback(() => {
    setUpdateMode(UpdateMode.SELECTION);
  }, [setUpdateMode]);

  const handleApplyPage = React.useCallback(() => {
    setUpdateMode(UpdateMode.PAGE);
  }, [setUpdateMode]);

  const handleApplyDocument = React.useCallback(() => {
    setUpdateMode(UpdateMode.DOCUMENT);
  }, [setUpdateMode]);

  return (
    <Stack direction="row">
      <Button
        data-testid="update-button"
        variant="primary"
        size="small"
        css={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        onClick={handleUpdate}
      >
        {t('applyTo.applyTo')}
        {' '}
        {updateMode}
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger
          css={{
            borderTopRightRadius: '$medium',
            borderBottomRightRadius: '$medium',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            backgroundColor: '$buttonPrimaryBgRest',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '$controlSmall',
            borderLeft: '1px solid $borderSubtle',
            boxShadow: '$buttonPrimaryShadow',
            color: '$buttonPrimaryFg',
            '&:hover, &:focus-visible': { backgroundColor: '$buttonPrimaryBgHover', boxShadow: '$buttonPrimaryShadow' },
          }}
          data-testid="apply-selector"
        >
          <IconChevronDown />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content side="top">
          <DropdownMenu.RadioGroup value={updateMode}>
            <DropdownMenu.RadioItem
              data-testid="apply-to-selection"
              value={UpdateMode.SELECTION}
              onSelect={handleApplySelection}
            >
              <DropdownMenu.ItemIndicator>
                <DotFilledIcon />
              </DropdownMenu.ItemIndicator>
              {t('applyTo.selection.title')}
              <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
                {t('applyTo.selection.description')}
              </Box>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem data-testid="apply-to-page" value={UpdateMode.PAGE} onSelect={handleApplyPage}>
              <DropdownMenu.ItemIndicator>
                <DotFilledIcon />
              </DropdownMenu.ItemIndicator>
              {t('applyTo.page.title')}
              <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
                {t('applyTo.page.description')}
              </Box>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem
              data-testid="apply-to-document"
              value={UpdateMode.DOCUMENT}
              onSelect={handleApplyDocument}
            >
              <DropdownMenu.ItemIndicator>
                <DotFilledIcon />
              </DropdownMenu.ItemIndicator>
              {t('applyTo.doc.title')}
              <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
                {t('applyTo.doc.description')}
              </Box>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
    </Stack>
  );
}
