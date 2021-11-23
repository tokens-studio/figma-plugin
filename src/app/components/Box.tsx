import {styled} from '@/stitches.config';
import React from 'react';

const StyledBox = styled('div', {
    display: 'flex',
});

type BoxProps = {
    css?: object;
    children?: React.ReactNode;
};

const Box: React.FC<BoxProps> = ({css, children}) => {
    return <StyledBox css={css}>{children}</StyledBox>;
};

export default Box;
