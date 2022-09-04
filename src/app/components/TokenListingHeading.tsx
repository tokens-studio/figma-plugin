import { Tooltip } from '@radix-ui/react-tooltip';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconCollapseArrow, IconExpandArrow, IconList, IconGrid, IconAdd,
} from '@/icons';
import { displayTypeSelector, editProhibitedSelector } from '@/selectors';
import Heading from './Heading';
import IconButton from './IconButton';
import ProBadge from './ProBadge';

import { useFlags } from './LaunchDarkly';
import { Dispatch } from '../store';

type Props = {
  isCollapsed: boolean;
  isPro?: boolean;
  showNewForm: (options: { name?: string }) => void;
  label: string;
  tokenKey: string;
  showDisplayToggle: boolean;
  onCollapse: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function TokenListingHeading({
  isPro,
  isCollapsed,
  showNewForm,
  label,
  tokenKey,
  showDisplayToggle,
  onCollapse,
}: Props) {
  const { gitBranchSelector } = useFlags();
  const dispatch = useDispatch<Dispatch>();

  const editProhibited = useSelector(editProhibitedSelector);
  const displayType = useSelector(displayTypeSelector);
  const handleShowNewForm = React.useCallback(() => showNewForm({}), [showNewForm]);

  const handleToggleDisplayType = React.useCallback(() => {
    dispatch.uiState.setDisplayType(displayType === 'GRID' ? 'LIST' : 'GRID');
  }, [displayType, dispatch]);

  return (
    <div className="relative flex items-center justify-between space-x-8">
      <button
        className={`flex items-center w-full h-full p-4 space-x-2 hover:bg-background-subtle focus:outline-none ${
          isCollapsed ? 'opacity-50' : null
        }`}
        data-cy={`tokenlisting-header-${tokenKey}`}
        type="button"
        onClick={onCollapse}
        data-testid={`tokenlisting-${tokenKey}-collapse-button`}
      >
        <Tooltip label={`Alt + Click to ${isCollapsed ? 'expand' : 'collapse'} all`}>
          <div className="p-2 -m-2">{isCollapsed ? <IconCollapseArrow /> : <IconExpandArrow />}</div>
        </Tooltip>
        <Heading size="small">{label}</Heading>
        {isPro ? <ProBadge /> : null}
      </button>
      <div className="absolute right-0 flex mr-2">
        {showDisplayToggle && (
          <IconButton
            icon={displayType === 'GRID' ? <IconList /> : <IconGrid />}
            tooltip={displayType === 'GRID' ? 'Show as List' : 'Show as Grid'}
            onClick={handleToggleDisplayType}
          />
        )}

        <IconButton
          dataCy="button-add-new-token"
          // TODO: Add proper logic to disable adding a token type depending on flags
          disabled={editProhibited || (isPro && !gitBranchSelector)}
          icon={<IconAdd />}
          tooltip="Add a new token"
          onClick={handleShowNewForm}
        />
      </div>
    </div>
  );
}
