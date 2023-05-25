import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuCheckboxItem,
} from './DropdownMenu';
import { inspectStateSelector } from '@/selectors';
import { Dispatch } from '../store';
import { isEqual } from '@/utils/isEqual';
import IconSetting from '@/icons/settings.svg';

export default function InspectSearchOptionDropdown() {
  const inspectState = useSelector(inspectStateSelector, isEqual);
  const dispatch = useDispatch<Dispatch>();

  const handleIsShowBrokenReferences = React.useCallback((checked: boolean) => {
    dispatch.inspectState.toggleShowBrokenReferences(checked);
  }, [dispatch.inspectState]);

  const handleIsShowResolvedReferences = React.useCallback((checked: boolean) => {
    dispatch.inspectState.toggleShowResolvedReferences(checked);
  }, [dispatch.inspectState]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger css={{ padding: '$2' }} data-testid="inspect-search-option-dropdown">
        <IconSetting />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="left">
        <DropdownMenuCheckboxItem
          data-testid="show-broken-references"
          checked={inspectState.isShowBrokenReferences}
          onCheckedChange={handleIsShowBrokenReferences}
        >
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Show broken references
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          data-testid="show-resolved-references"
          checked={inspectState.isShowResolvedReferences}
          onCheckedChange={handleIsShowResolvedReferences}
        >
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Show resolved references
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
