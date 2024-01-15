import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { DropdownMenu } from '@tokens-studio/ui';

type Props = {
  branch: string;
  branchSelected: (branch: string) => void;
  disabled?: boolean;
};

export const BranchSwitchMenuRadioElement: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  disabled,
  branch,
  branchSelected,
}) => {
  const onSelect = React.useCallback(() => branchSelected(branch), [branch, branchSelected]);

  return (
    <DropdownMenu.RadioItem
      disabled={disabled}
      data-testid={`branch-switch-menu-radio-element-${branch}`}
      value={branch}
      onSelect={onSelect}
      css={{ position: 'relative' }}
    >
      <DropdownMenu.ItemIndicator>
        <CheckIcon data-testid="branch-switch-menu-check-icon" />
      </DropdownMenu.ItemIndicator>
      {branch}
    </DropdownMenu.RadioItem>
  );
};