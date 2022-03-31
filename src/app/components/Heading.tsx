import React from 'react';

function Heading({
  size = '', children, keepCase = true, id = null,
}) {
  return (
    <p data-cy={id} className={`heading ${keepCase ? '' : 'capitalize'} ${size === 'small' ? 'heading-small' : ''}`}>
      {children}
    </p>
  );
}

export default Heading;
