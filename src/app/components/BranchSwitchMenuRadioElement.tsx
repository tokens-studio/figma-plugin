import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { GitBranchIcon } from '@primer/octicons-react';
import {
  BranchSwitchMenuItemIndicator,
  BranchSwitchMenuRadioItem,
} from './BranchSwitchMenu';
import Box from './Box';

type Props = {
  branch: string,
  branchSelected: (branch: string) => void
  disabled?: boolean
};

export const BranchSwitchMenuRadioElement: React.FC<Props> = ({ disabled, branch, branchSelected }) => {
  const onSelect = React.useCallback(() => branchSelected(branch), [branch, branchSelected]);

  return (
    <BranchSwitchMenuRadioItem disabled={disabled} data-cy={`branch-switch-menu-radio-element-${branch}`} value={branch} onSelect={onSelect}>
      <Box css={{ width: '$5' }}>
        <BranchSwitchMenuItemIndicator>
          <CheckIcon data-cy="branch-switch-menu-check-icon" />
        </BranchSwitchMenuItemIndicator>
      </Box>
      <Box>
        <GitBranchIcon size={12} />
        {` ${branch}`}
      </Box>
    </BranchSwitchMenuRadioItem>
  );
};
