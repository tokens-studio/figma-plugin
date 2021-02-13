import * as React from 'react';

const Heading = ({size = '', children, keepCase = false}) => (
    <p className={`heading ${keepCase ? '' : 'capitalize'} ${size === 'small' ? 'heading-small' : ''}`}>{children}</p>
);

export default Heading;
