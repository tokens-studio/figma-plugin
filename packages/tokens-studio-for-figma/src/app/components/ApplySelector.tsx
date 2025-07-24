import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, DropdownMenu, Stack,
} from '@tokens-studio/ui';
import { Check } from 'iconoir-react';
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
        css={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRightColor: 'transparent',
        }}
        onClick={handleUpdate}
      >
        {t('applyTo.button')}
        {' '}
        {updateMode}
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger
          asChild
          data-testid="apply-selector"
        >
          <Button
            variant="primary"
            size="small"
            css={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderLeftColor: 'rgba(255, 255, 255, 0.2)',
              width: '$controlSmall',
              justifyContent: 'center',
            }}
          >
            <IconChevronDown />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top" css={{ maxWidth: '350px' }}>
            <DropdownMenu.Label>{t('applyTo.applyCurrentTokensTo')}</DropdownMenu.Label>
            <DropdownMenu.RadioGroup value={updateMode}>
              <DropdownMenu.RadioItem
                data-testid="apply-to-selection"
                value={UpdateMode.SELECTION}
                onSelect={handleApplySelection}
              >
                <DropdownMenu.ItemIndicator>
                  <Check />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.selection.title')}
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem data-testid="apply-to-page" value={UpdateMode.PAGE} onSelect={handleApplyPage}>
                <DropdownMenu.ItemIndicator>
                  <Check />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.page.title')}
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                data-testid="apply-to-document"
                value={UpdateMode.DOCUMENT}
                onSelect={handleApplyDocument}
              >
                <DropdownMenu.ItemIndicator>
                  <Check />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.document.title')}
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator />
            <DropdownMenu.Label>{t('applyTo.applyCurrentTokensAs')}</DropdownMenu.Label>
            <DropdownMenu.RadioGroup value={applyVariablesStylesOrRawValue}>
              <DropdownMenu.RadioItem
                data-testid="apply-variables-styles"
                value={ApplyVariablesStylesOrRawValues.VARIABLES_STYLES}
                onSelect={handlePreferVariablesStyles}
              >
                <DropdownMenu.ItemIndicator>
                  <Check />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.variablesStyles.title')}
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                data-testid="apply-raw-values"
                value={ApplyVariablesStylesOrRawValues.RAW_VALUES}
                onSelect={handlePreferRawValues}
              >
                <DropdownMenu.ItemIndicator>
                  <Check />
                </DropdownMenu.ItemIndicator>
                {t('applyTo.rawValues.title')}
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
    </Stack>
  );
}
