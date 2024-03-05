import React from 'react';
import { IconButton } from '@tokens-studio/ui';
import Maximize from '@/icons/maximize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import Box from './Box';

type Props = {
  children: React.ReactElement;
};

const PluginResizerWrapper: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ children }) => {
  const { isPluginminimized, handleResize } = useMinimizeWindow();

  return isPluginminimized ? (
    <Box css={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconButton size="large" onClick={handleResize} variant="invisible" icon={<Maximize />} />
    </Box>
  ) : (
    children
  );
};
export default PluginResizerWrapper;
