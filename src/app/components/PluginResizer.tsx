import React from 'react';
import { styled } from '@/stitches.config';
import Maximize from '../assets/maximize.svg';
import useMinimizeWindow from './useMinimizeWindow';

const StyledButton = styled('button', {
  all: 'unset',
  border: 'none',
  padding: '$2',
  marginLeft: '$4',
  borderRadius: '$button',
  cursor: 'pointer',
  '&:hover, &:focus': {
    boxShadow: 'none',
  },
});

type Props = {
  children: React.ReactElement;
};

const PluginResizerWrapper: React.FC<Props> = ({ children }) => {
  const { isPluginminimized, handleResize } = useMinimizeWindow();

  return isPluginminimized ? (
    <StyledButton type="button" onClick={handleResize}>
      <Maximize />
    </StyledButton>
  ) : (
    children
  );
};
export default PluginResizerWrapper;
