import React from 'react';
import { useSelector } from 'react-redux';
import { SingleToken } from '@/types/tokens';
import Tooltip from '../Tooltip';
import { TokenTooltipContent } from './TokenTooltipContent';
import { showEditFormSelector } from '@/selectors';

type Props = {
  token: SingleToken;
};

export const TokenTooltip: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  children,
  token,
}) => {
  // When we open the token edit form we don't want tooltips to show through, which is happening sometimes
  const showEditForm = useSelector(showEditFormSelector);

  if (!children || !React.isValidElement(children)) {
    return null;
  }

  return (
    <Tooltip
      side="bottom"
      label={showEditForm ? '' : (
        <TokenTooltipContent
          token={token}
        />
      )}
    >
      {children}
    </Tooltip>
  );
};
