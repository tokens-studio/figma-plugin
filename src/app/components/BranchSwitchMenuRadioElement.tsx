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
};

export const BranchSwitchMenuRadioElement: React.FC<Props> = ({ branch, branchSelected }) => {
  const onSelect = React.useCallback(() => branchSelected(branch), [branch, branchSelected]);

  return (
    <BranchSwitchMenuRadioItem value={branch} onSelect={onSelect}>
      <BranchSwitchMenuItemIndicator>
        <CheckIcon />
      </BranchSwitchMenuItemIndicator>
      <GitBranchIcon size={12} />
      {` ${branch}`}
    </BranchSwitchMenuRadioItem>
  );
};
