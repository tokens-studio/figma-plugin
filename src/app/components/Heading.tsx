import * as React from 'react';

const Heading = ({size = '', children}) => (
    <p className={`heading ${size === 'small' ? 'heading-small' : ''}`}>{children}</p>
);

export default Heading;
