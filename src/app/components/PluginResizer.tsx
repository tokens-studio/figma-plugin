import React from 'react';
import Maximize from '../assets/maximize.svg';
import useMinimizeWindow from './useMinimizeWindow';
import IconButton from './IconButton';

type Props = {
  children: React.ReactElement;
};

const PluginResizerWrapper: React.FC<Props> = ({ children }) => {
  const { isPluginminimized, handleResize } = useMinimizeWindow();

  return isPluginminimized ? (
    <IconButton tooltip="Maximize plugin" onClick={handleResize} icon={Maximize} />
  ) : (
    children
  );
};
export default PluginResizerWrapper;
