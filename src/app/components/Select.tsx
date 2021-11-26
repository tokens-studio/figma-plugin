import {styled} from '@/stitches.config';
import React from 'react';

const StyledSelect = styled('select', {
    all: 'unset',
    borderRadius: '$input',
    padding: '$4 $3',
    fontSize: 12,
    lineHeight: 1,
    color: '$text',
    border: '1px solid $border',
    '&:focus': {boxShadow: `$focus`},
});

export default function Select({css, value, id, onChange, children}) {
    return (
        <StyledSelect css={css} value={value} name={id} id={id} onChange={onChange}>
            {children}
        </StyledSelect>
    );
}
