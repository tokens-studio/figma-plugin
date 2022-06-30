import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { GitBranchIcon } from '@primer/octicons-react';
import {
  BranchSwitchMenuItemIndicator,
  BranchSwitchMenuRadioItem,
} from './BranchSwitchMenu';

type Props = {
  branch: string,
  branchSelected: (branch: string) => void
  disabled?: boolean
};

export const BranchSwitchMenuRadioElement: React.FC<Props> = ({ disabled, branch, branchSelected }) => {
  const onSelect = React.useCallback(() => branchSelected(branch), [branch, branchSelected]);

  return (
    <BranchSwitchMenuRadioItem disabled={disabled} data-cy={`branch-switch-menu-radio-element-${branch}`} value={branch} onSelect={onSelect}>
      <BranchSwitchMenuItemIndicator>
        <CheckIcon data-cy="branch-switch-menu-check-icon" />
      </BranchSwitchMenuItemIndicator>
      <GitBranchIcon size={12} />
      {` ${branch}`}
    </BranchSwitchMenuRadioItem>
  );
};
