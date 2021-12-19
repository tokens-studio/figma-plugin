import * as React from 'react';
import Heading from './Heading';
import Icon from './Icon';

export default function Callout({
  heading, description, action, id,
}) {
  return (
    <div className="space-x-2 bg-primary-100 p-4 rounded flex flex-row">
      <div className="text-primary-500">
        <Icon name="bell" />
      </div>
      <div className="space-y-2">
        <Heading>{heading}</Heading>
        <div className="text-xs space-y-2">
          <p>{description}</p>
          <button data-cy={id} type="button" onClick={action.onClick} className="text-primary-500">
            {action.text}
          </button>
        </div>
      </div>
    </div>
  );
}
