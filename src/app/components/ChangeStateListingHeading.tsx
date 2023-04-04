import React from 'react';
import {
  IconCollapseArrow, IconExpandArrow,
} from '@/icons';
import Heading from './Heading';
import Tooltip from './Tooltip';
import Box from './Box';
import Stack from './Stack';
import { StyledTokenGroupHeadingButton } from './TokenGroup/StyledTokenGroupHeading';

type Props = {
  isCollapsed: boolean;
  label: string;
  tokenKey: string;
  onCollapse: (e: React.MouseEvent<HTMLButtonElement>, tokenKey: string) => void;
};

export default function ChangeStateListingHeading({
  isCollapsed,
  label,
  tokenKey,
  onCollapse,
}: Props) {
  const handleCollapse = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onCollapse(e, tokenKey);
  }, [onCollapse, tokenKey]);

  return (
    <Stack direction="row" align="center" justify="between" gap={4} css={{ position: 'relative' }}>
      <StyledTokenGroupHeadingButton
        isCollapsed={isCollapsed}
        data-cy={`changetokenlisting-header-${tokenKey}`}
        type="button"
        onClick={handleCollapse}
        data-testid={`changetokenlisting-${tokenKey}-collapse-button`}
      >
        <Tooltip label={`Alt + Click to ${isCollapsed ? 'expand' : 'collapse'} all`}>
          <Box css={{ padding: '$2', margin: '-$2' }}>{isCollapsed ? <IconCollapseArrow /> : <IconExpandArrow />}</Box>
        </Tooltip>
        <Heading size="small">{label}</Heading>
      </StyledTokenGroupHeadingButton>
    </Stack>
  );
}
