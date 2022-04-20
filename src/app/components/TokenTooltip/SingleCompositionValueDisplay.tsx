import React from 'react';
import { SingleCompositionToken } from '@/types/tokens';

// @TODO confirm whether the compostion token values
// can still have the .value property from legacy

type Props = {
  value: SingleCompositionToken['value']
  shouldResolve: boolean
};

export const SingleCompositionValueDisplay: React.FC<Props> = ({ value, shouldResolve }) => {
  if (shouldResolve) {
    return (
      <div />
    );
  }

  return (
    <div>
      {
        (Array.isArray(value)) ? (
          value.map((v, index) => (
            <div key={index}>
              {v?.property}
              {' : '}
              {v?.value}
            </div>
          ))
        ) : (
          <div>
            {value.property}
            {' : '}
            {value.value}
          </div>
        )
      }
    </div>
  );
};
