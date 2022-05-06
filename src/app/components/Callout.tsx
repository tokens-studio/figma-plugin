import React from 'react';
import { styled } from '@/stitches.config';
import Heading from './Heading';
import Icon from './Icon';
import Stack from './Stack';
import Text from './Text';
import Box from './Box';

const StyledButton = styled('button', {
  fontSize: '$xsmall',
  color: '$interaction',
});

export default function Callout({
  heading, description, action, id,
}) {
  return (
    <Box css={{ backgroundColor: '$bgSubtle', padding: '$4', borderRadius: '$default' }}>
      <Stack direction="row" gap={2}>
        <Box css={{ color: '$interaction' }}>
          <Icon name="bell" />
        </Box>
        <Stack align="start" direction="column" gap={2}>
          <Heading>{heading}</Heading>
          <Text size="xsmall">{description}</Text>
          <StyledButton data-cy={id} type="button" onClick={action.onClick}>
            {action.text}
          </StyledButton>
        </Stack>
      </Stack>
    </Box>
  );
}
