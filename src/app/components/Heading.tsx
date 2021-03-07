import * as React from 'react';

const Heading = ({size = '', children, dataCy = null}) => (
    <p data-cy={dataCy} className={`heading ${size === 'small' ? 'heading-small' : ''}`}>
        {children}
    </p>
);

export default Heading;
