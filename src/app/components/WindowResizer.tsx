/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from '../store';
import IconResizeWindow from '@/icons/resizewindow.svg';

export default function WindowResizer() {
  const dispatch = useDispatch<Dispatch>();
  const cornerRef = React.useRef<HTMLDivElement>(null);

  const handleSizeChange = React.useCallback((e: PointerEvent) => {
    const size = {
      width: Math.max(300, Math.floor(e.clientX + 5)),
      height: Math.max(200, Math.floor(e.clientY + 5)),
    };
    dispatch.settings.setWindowSize({
      ...size,
    });
  }, [dispatch.settings]);

  const onDown = React.useCallback((e) => {
    if (cornerRef.current) {
      cornerRef.current.onpointermove = handleSizeChange;
      cornerRef.current.setPointerCapture(e.pointerId);
    }
  }, [handleSizeChange]);

  const onUp = React.useCallback((e) => {
    if (cornerRef.current) {
      cornerRef.current.onpointermove = null;
      cornerRef.current.releasePointerCapture(e.pointerId);
      dispatch.settings.triggerWindowChange();
    }
  }, [dispatch.settings]);

  return (
    <div id="corner" onPointerDown={onDown} onPointerUp={onUp} ref={cornerRef}>
      <IconResizeWindow />
    </div>
  );
}
