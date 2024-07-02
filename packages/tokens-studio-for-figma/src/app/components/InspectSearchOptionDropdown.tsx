import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'iconoir-react';
import { useDispatch, useSelector } from 'react-redux';
import { DropdownMenu, IconButton } from '@tokens-studio/ui';
import { inspectStateSelector } from '@/selectors';
import { Dispatch } from '../store';
import { isEqual } from '@/utils/isEqual';
import { IconSettings } from '@/icons';

export default function InspectSearchOptionDropdown() {
  const inspectState = useSelector(inspectStateSelector, isEqual);
  const dispatch = useDispatch<Dispatch>();

  const handleIsShowBrokenReferences = React.useCallback((checked: boolean) => {
    dispatch.inspectState.toggleShowBrokenReferences(checked);
  }, [dispatch.inspectState]);

  const handleIsShowResolvedReferences = React.useCallback((checked: boolean) => {
    dispatch.inspectState.toggleShowResolvedReferences(checked);
  }, [dispatch.inspectState]);

  const { t } = useTranslation(['inspect']);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild data-testid="inspect-search-option-dropdown">
        <IconButton icon={<IconSettings />} variant="invisible" tooltip="Options" tooltipSide="bottom" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem
            data-testid="show-broken-references"
            checked={inspectState.isShowBrokenReferences}
            onCheckedChange={handleIsShowBrokenReferences}
          >
            <DropdownMenu.ItemIndicator>
              <Check />
            </DropdownMenu.ItemIndicator>
            {t('showBrokenReferences')}
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            data-testid="show-resolved-references"
            checked={inspectState.isShowResolvedReferences}
            onCheckedChange={handleIsShowResolvedReferences}
          >
            <DropdownMenu.ItemIndicator>
              <Check />
            </DropdownMenu.ItemIndicator>
            {t('showResolvedReferences')}
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
