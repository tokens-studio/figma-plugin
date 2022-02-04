import React from 'react';
import { styled } from '@/stitches.config';

const StyledText = styled('div', {});

type TextProps = {
  css?: object;
  children?: React.ReactNode;
};

const Text: React.FC<TextProps> = ({ css, children }) => <StyledText css={css}>{children}</StyledText>;

export default Text;
