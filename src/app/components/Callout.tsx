import React from 'react';
import { styled } from '@/stitches.config';
import Heading from './Heading';
import Icon from './Icon';
import Stack from './Stack';
import Text from './Text';

const StyledButton = styled('button', {
  fontSize: '$xsmall',
  color: '$interaction',
});

export default function Callout({
  heading, description, action, id,
}) {
  return (
    <div className="bg-primary-100 p-4 rounded">
      <Stack direction="row" gap={2}>
        <div className="text-primary-500">
          <Icon name="bell" />
        </div>
        <Stack align="start" direction="column" gap={2}>
          <Heading>{heading}</Heading>
          <Text size="xsmall">{description}</Text>
          <StyledButton data-cy={id} type="button" onClick={action.onClick}>
            {action.text}
          </StyledButton>
        </Stack>
      </Stack>
    </div>
  );
}
