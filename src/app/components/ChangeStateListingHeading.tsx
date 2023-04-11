import React from 'react';
import {
  IconCollapseArrow, IconExpandArrow,
} from '@/icons';
import Heading from './Heading';
import Tooltip from './Tooltip';
import Box from './Box';
import Stack from './Stack';
import { styled } from '@/stitches.config';

type Props = {
  isCollapsed: boolean;
  label: string;
  key: string;
  onCollapse: (e: React.MouseEvent<HTMLButtonElement>, key: string) => void;
};

const StyledChangedStateGroupHeadingButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  padding: '$4',
  gap: '$2',
  '&:hover, &:focus': {
    backgroundColor: '$bgSubtle',
    outline: 'none',
  },
  variants: {
    isCollapsed: {
      true: {
        opacity: 0.5,
      },
    },
  },
});

export default function ChangeStateListingHeading({
  isCollapsed,
  label,
  key,
  onCollapse,
}: Props) {
  const handleCollapse = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onCollapse(e, label);
  }, [onCollapse, label]);

  return (
    <Stack direction="row" align="center" justify="between" gap={4} css={{ position: 'relative' }}>
      <StyledChangedStateGroupHeadingButton
        isCollapsed={isCollapsed}
        data-cy={`changestatelisting-header-${key}`}
        type="button"
        onClick={handleCollapse}
        data-testid={`changestatelisting-${key}-collapse-button`}
      >
        <Tooltip label={`Alt + Click to ${isCollapsed ? 'expand' : 'collapse'} all`}>
          <Box css={{ padding: '$2', margin: '-$2' }}>{isCollapsed ? <IconCollapseArrow /> : <IconExpandArrow />}</Box>
        </Tooltip>
        <Heading size="small">{label}</Heading>
      </StyledChangedStateGroupHeadingButton>
    </Stack>
  );
}
