import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '../store';

import { windowSizeSelector } from '@/selectors';

const useMinimizeWindow = () => {
  const dispatch = useDispatch<Dispatch>();
  const windowSize = useSelector(windowSizeSelector);
  const [isPluginminimized, setIsPluginminimized] = React.useState(false);

  const handleResize = React.useCallback(() => {
    if (windowSize) {
      dispatch.settings.setMinimizePluginWindow({
        width: windowSize.width,
        height: windowSize.height,
        isMinimized: !windowSize.isMinimized,
      });
    }
  }, [dispatch, windowSize]);

  React.useEffect(() => {
    if (windowSize) setIsPluginminimized(windowSize.isMinimized);
  }, [windowSize]);

  return {
    isPluginminimized,
    handleResize,
  };
};

export default useMinimizeWindow;
