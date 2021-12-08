import {styled} from '@/stitches.config';
import React from 'react';

const StyledText = styled('div', {});

type TextProps = {
    css?: object;
    children?: React.ReactNode;
};

const Text: React.FC<TextProps> = ({css, children}) => {
    return <StyledText css={css}>{children}</StyledText>;
};

export default Text;
