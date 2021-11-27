import {styled} from '@/stitches.config';
import React, {ReactNode} from 'react';

export default function Label({htmlFor, children, css}: {htmlFor: string; children: ReactNode; css?: object}) {
    const StyledLabel = styled('label', {
        color: '$text',
        fontSize: 12,
        lineHeight: 1,
        userSelect: 'none',
    });
    return (
        <StyledLabel css={css} htmlFor={htmlFor}>
            {children}
        </StyledLabel>
    );
}
