import React from 'react';
import { Heading } from '@tokens-studio/ui';
import {
  IconCollapseArrow, IconExpandArrow,
} from '@/icons';
import Box from './Box';
import Stack from './Stack';
import { Count } from './Count';
import { styled } from '@/stitches.config';

type Props = {
  isCollapsed: boolean;
  count?: number;
  label: string;
  set: string;
  onCollapse: (e: React.MouseEvent<HTMLButtonElement>, key: string) => void;
};

const StyledChangedStateGroupHeadingButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  padding: '$2',
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
  count,
  label,
  set,
  onCollapse,
}: Props) {
  const handleCollapse = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onCollapse(e, label);
  }, [onCollapse, label]);

  return (
    <Stack direction="row" align="center" justify="between" gap={4} css={{ position: 'relative' }}>
      <StyledChangedStateGroupHeadingButton
        isCollapsed={isCollapsed}
        type="button"
        onClick={handleCollapse}
        data-testid={`changestatelisting-${set}-collapse-button`}
      >
        <Box css={{ padding: '$2' }}>{isCollapsed ? <IconCollapseArrow /> : <IconExpandArrow />}</Box>
        <Heading size="medium">{label}</Heading>
        {count && <Count count={count} />}
      </StyledChangedStateGroupHeadingButton>
    </Stack>
  );
}
