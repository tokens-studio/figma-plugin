/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch } from 'react-redux';
import debounce from 'lodash.debounce';
import { Dispatch } from '../store';
import IconResizeWindow from '@/icons/resizewindow.svg';
import { track } from '@/utils/analytics';

export default function WindowResizer() {
  const dispatch = useDispatch<Dispatch>();
  const cornerRef = React.useRef<HTMLDivElement>(null);

  const debouncedSizeChange = React.useRef(
    debounce(
      (width, height) => track('Set Window Size', { width, height }),
      300,
    ),
  ).current;

  const handleSizeChange = React.useCallback((e: PointerEvent) => {
    const size = {
      width: Math.max(300, Math.floor(e.clientX + 5)),
      height: Math.max(200, Math.floor(e.clientY + 5)),
    };
    dispatch.settings.setWindowSize({
      ...size,
    });
    debouncedSizeChange(size.width, size.height);
  }, [debouncedSizeChange, dispatch.settings]);

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
