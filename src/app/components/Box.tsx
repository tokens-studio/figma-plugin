import {styled} from '@/stitches.config';
import React from 'react';

const StyledBox = styled('div', {});

export default function Box({css, children}: {css?: object; children?: React.ReactChildren}) {
    return <StyledBox css={css}>{children}</StyledBox>;
}
