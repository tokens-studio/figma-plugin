import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { GitBranchIcon } from '@primer/octicons-react';
import {
  BranchSwitchMenuItemIndicator,
  BranchSwitchMenuRadioItem,
} from './BranchSwitchMenu';

type Props = {
  branch: string,
  index:number,
  branchSelected: (branch: string) => void
};

export const BranchSwitchMenuRadioElement: React.FC<Props> = ({ branch, index, branchSelected }) => {
  const onSelect = React.useCallback(() => branchSelected(branch), [branch, branchSelected]);

  return (
    <BranchSwitchMenuRadioItem key={`radio_${index}`} value={branch} onSelect={onSelect}>
      <BranchSwitchMenuItemIndicator>
        <CheckIcon />
      </BranchSwitchMenuItemIndicator>
      <GitBranchIcon size={12} />
      {` ${branch}`}
    </BranchSwitchMenuRadioItem>
  );
};
