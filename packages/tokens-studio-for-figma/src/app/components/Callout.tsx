import React from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button, Heading } from '@tokens-studio/ui';
import Stack from './Stack';
import Text from './Text';
import styles from './Callout.module.css';

type Props = {
  id: string
  heading: React.ReactNode
  description: React.ReactNode
  action?: {
    text: React.ReactNode
    onClick: React.ComponentProps<typeof Button>['onClick']
  }
  secondaryAction?: {
    text: React.ReactNode
    onClick: React.ComponentProps<typeof Button>['onClick']
  }
};

export default function Callout({
  heading, description, action, secondaryAction, id,
}: Props) {
  return (
    <div className={styles.callout}>
      <Stack direction="row" gap={4}>
        <div className={styles.iconContainer}>
          <ExclamationTriangleIcon />
        </div>
        <Stack direction="column" gap={4}>
          <Stack align="start" direction="column" gap={2}>
            <Heading>{heading}</Heading>
            <Text muted size="xsmall">{description}</Text>
          </Stack>
          {(action || secondaryAction) && (
            <Stack direction="row" gap={2}>
              {action && (
                <Button data-testid={id} size="small" variant="primary" onClick={action.onClick}>
                  {action.text}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  data-testid={`${id}-secondary`}
                  size="small"
                  variant="secondary"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.text}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
    </div>
  );
}
