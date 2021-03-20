import * as React from 'react';

const Heading = ({size = '', children, keepCase = true, id = null}) => (
    <p data-cy={id} className={`heading ${keepCase ? '' : 'capitalize'} ${size === 'small' ? 'heading-small' : ''}`}>
        {children}
    </p>
);

export default Heading;
