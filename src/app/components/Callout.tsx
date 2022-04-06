import React from 'react';
import Heading from './Heading';
import Icon from './Icon';
import Stack from './Stack';
import Text from './Text';

export default function Callout({
  heading, description, action, id,
}) {
  return (
    <div className="bg-primary-100 p-4 rounded">
      <Stack direction="row" gap={2}>
        <div className="text-primary-500">
          <Icon name="bell" />
        </div>
        <Stack direction="column" gap={2}>
          <Heading>{heading}</Heading>
          <Text size="xsmall">{description}</Text>
          <button data-cy={id} type="button" onClick={action.onClick} className="text-primary-500">
            {action.text}
          </button>
        </Stack>
      </Stack>
    </div>
  );
}
