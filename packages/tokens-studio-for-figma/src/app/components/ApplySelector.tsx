import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { DotFilledIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import {
  Button, DropdownMenu, Stack, Box
} from '@tokens-studio/ui';
import { Dispatch } from '../store';
import IconChevronDown from '@/icons/chevrondown.svg';
import { settingsStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { UpdateMode } from '@/constants/UpdateMode';
import useTokens from '../store/useTokens';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

export default function ApplySelector() {
  const { updateMode, applyVariablesStylesOrRawValue } = useSelector(settingsStateSelector, isEqual);
  const { t } = useTranslation(['tokens']);

  const { handleUpdate } = useTokens();

  const { setUpdateMode, setApplyVariablesStyleOrRawValue } = useDispatch<Dispatch>().settings;

  const handleApplySelection = React.useCallback(() => {
    setUpdateMode(UpdateMode.SELECTION);
  }, [setUpdateMode]);

  const handleApplyPage = React.useCallback(() => {
    setUpdateMode(UpdateMode.PAGE);
  }, [setUpdateMode]);

  const handleApplyDocument = React.useCallback(() => {
    setUpdateMode(UpdateMode.DOCUMENT);
  }, [setUpdateMode]);

  const handlePreferVariablesStyles = React.useCallback(() => {
    setApplyVariablesStyleOrRawValue(ApplyVariablesStylesOrRawValues.VARIABLES_STYLES);
  }, [setApplyVariablesStyleOrRawValue]);

  const handlePreferRawValues = React.useCallback(() => {
    setApplyVariablesStyleOrRawValue(ApplyVariablesStylesOrRawValues.RAW_VALUES);
  }, [setApplyVariablesStyleOrRawValue]);

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
            borderLeft: '1px solid rgba(150, 150, 150, 0.3)',
            position: 'relative',
            boxShadow: '$buttonPrimaryShadow',
            color: '$buttonPrimaryFg',
            '&:hover, &:focus-visible': { backgroundColor: '$buttonPrimaryBgHover', boxShadow: '$buttonPrimaryShadow' },
          }}
          data-testid="apply-selector"
        >
          <IconChevronDown />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top">
            {/* TODO: Use DropdownMenu.Label - first add that to `ds` */}
            <DropdownMenu.Item disabled>{t('applyTo.applyTo')}</DropdownMenu.Item>
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
                <Box css={{ color: '$contextMenuFgMuted', fontSize: '$xxsmall' }}>
                  {t('applyTo.selection.description')}
                </Box>
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem data-testid="apply-to-page" value={UpdateMode.PAGE} onSelect={handleApplyPage}>
                <DropdownMenu.ItemIndicator>
                  <DotFilledIcon />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.page.title')}
                <Box css={{ color: '$contextMenuFgMuted', fontSize: '$xxsmall' }}>
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
                <Box css={{ color: '$contextMenuFgMuted', fontSize: '$xxsmall' }}>
                  {t('applyTo.doc.description')}
                </Box>
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator />
            {/* TODO: Use DropdownMenu.Label - first add that to `ds` */}
            <DropdownMenu.Item disabled>{t('applyTo.applyAs')}</DropdownMenu.Item>
            <DropdownMenu.RadioGroup value={applyVariablesStylesOrRawValue}>
              <DropdownMenu.RadioItem
                data-testid="apply-variables-styles"
                value={ApplyVariablesStylesOrRawValues.VARIABLES_STYLES}
                onSelect={handlePreferVariablesStyles}
              >
                <DropdownMenu.ItemIndicator>
                  <DotFilledIcon />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.variablesStyles.title')}
                <Box css={{ color: '$contextMenuFgMuted', fontSize: '$xxsmall' }}>
                  {t('applyTo.variablesStyles.description')}
                </Box>
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                data-testid="apply-raw-values"
                value={ApplyVariablesStylesOrRawValues.RAW_VALUES}
                onSelect={handlePreferRawValues}
              >
                <DropdownMenu.ItemIndicator>
                  <DotFilledIcon />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.rawValues.title')}
                <Box css={{ color: '$contextMenuFgMuted', fontSize: '$xxsmall' }}>
                  {t('applyTo.rawValues.description')}
                </Box>
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
    </Stack>
  );
}
