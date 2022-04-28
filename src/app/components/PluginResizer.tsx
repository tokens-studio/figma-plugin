import React from 'react';
import { styled } from '@/stitches.config';
import Maximize from '../assets/maximize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import Tooltip from './Tooltip';

const StyledButton = styled('button', {
  all: 'unset',
  border: 'none',
  padding: '$2',
  marginLeft: '$4',
  borderRadius: '$button',
  cursor: 'pointer',
});

type Props = {
  children: React.ReactElement;
};

const PluginResizerWrapper: React.FC<Props> = ({ children }) => {
  const { isPluginminimized, handleResize } = useMinimizeWindow();

  return isPluginminimized ? (
    <Tooltip label="Maximize plugin">
      <StyledButton type="button" onClick={handleResize}>
        <Maximize />
      </StyledButton>
    </Tooltip>
  ) : (
    children
  );
};
export default PluginResizerWrapper;
