import React from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Heading from './Heading';
import Stack from './Stack';
import Text from './Text';
import Box from './Box';
import Button from './Button';

type Props = {
  id: string
  heading: React.ReactNode
  description: React.ReactNode
  action: {
    text: React.ReactNode
    onClick: React.ComponentProps<typeof Button>['onClick']
  }
};

export default function Callout({
  heading, description, action, id,
}: Props) {
  return (
    <Box css={{ backgroundColor: '$bgDanger', padding: '$4', borderRadius: '$default' }}>
      <Stack direction="row" gap={4}>
        <Box css={{ color: '$dangerFg', marginTop: '$3' }}>
          <ExclamationTriangleIcon />
        </Box>
        <Stack direction="column" gap={4}>
          <Stack align="start" direction="column" gap={2}>
            <Heading>{heading}</Heading>
            <Text size="xsmall">{description}</Text>
          </Stack>
          <Button data-cy={id} size="small" variant="primary" onClick={action.onClick}>
            {action.text}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
