import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { DotFilledIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import {
  Button, DropdownMenu, Stack, Box
} from '@tokens-studio/ui';
import { Dispatch } from '../store';
import { styled } from '@/stitches.config';
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

  const StyledDropdownOptionDescription = styled(Box, {
    fontSize: '$xxsmall',
    color: '$contextMenuFgMuted',
  })

  return (
    <Stack direction="row">
      <Button
        data-testid="update-button"
        variant="primary"
        size="small"
        css={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        onClick={handleUpdate}
      >
        {t('applyTo.button')}
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
            <DropdownMenu.Item disabled>{t('applyTo.applyCurrentTokensTo')}</DropdownMenu.Item>
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
                <StyledDropdownOptionDescription>
                {t('applyTo.selection.description')}
              </StyledDropdownOptionDescription>
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem data-testid="apply-to-page" value={UpdateMode.PAGE} onSelect={handleApplyPage}>
                <DropdownMenu.ItemIndicator>
                  <DotFilledIcon />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.page.title')}
                <StyledDropdownOptionDescription>
                {t('applyTo.page.description')}
              </StyledDropdownOptionDescription>
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                data-testid="apply-to-document"
                value={UpdateMode.DOCUMENT}
                onSelect={handleApplyDocument}
              >
                <DropdownMenu.ItemIndicator>
                  <DotFilledIcon />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.document.title')}
                <StyledDropdownOptionDescription>
                {t('applyTo.document.description')}
              </StyledDropdownOptionDescription>
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator />
            {/* TODO: Use DropdownMenu.Label - first add that to `ds` */}
            <DropdownMenu.Item disabled>{t('applyTo.applyCurrentTokensAs')}</DropdownMenu.Item>
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
                <StyledDropdownOptionDescription>
                {t('applyTo.variablesStyles.description')}
                </StyledDropdownOptionDescription>
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
                <StyledDropdownOptionDescription>
                {t('applyTo.rawValues.description')}
                </StyledDropdownOptionDescription>
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
    </Stack>
  );
}
