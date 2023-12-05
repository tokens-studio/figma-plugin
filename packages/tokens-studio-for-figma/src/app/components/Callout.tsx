import React from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Box } from '@tokens-studio/ui';
import Heading from './Heading';
import Stack from './Stack';
import Text from './Text';
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
    <Box css={{
      backgroundColor: '$dangerBg', borderColor: '$dangerBorder', padding: '$5', borderRadius: '$small',
    }}
    >
      <Stack direction="row" gap={4}>
        <Box css={{ color: '$dangerFg', marginTop: '$3' }}>
          <ExclamationTriangleIcon />
        </Box>
        <Stack direction="column" gap={4}>
          <Stack align="start" direction="column" gap={2}>
            <Heading>{heading}</Heading>
            <Text muted size="xsmall">{description}</Text>
          </Stack>
          <Box>
            <Button data-testid={id} size="small" variant="primary" onClick={action.onClick}>
              {action.text}
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
