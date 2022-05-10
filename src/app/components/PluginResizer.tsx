import React from 'react';
import Maximize from '../assets/maximize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import IconButton from './IconButton';
import Box from './Box';

type Props = {
  children: React.ReactElement;
};

const PluginResizerWrapper: React.FC<Props> = ({ children }) => {
  const { isPluginminimized, handleResize } = useMinimizeWindow();

  return isPluginminimized ? (
    <Box css={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconButton onClick={handleResize} icon={<Maximize />} />
    </Box>
  ) : (
    children
  );
};
export default PluginResizerWrapper;
