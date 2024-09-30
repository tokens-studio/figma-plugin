/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import debounce from "lodash.debounce";
// import { Box } from "@tokens-studio/ui";

import { figmaAPI } from "../lib/figmaAPI.js";

// import { Dispatch } from '../store';
// import IconResizeWindow from '@/icons/resizewindow.svg';
// import { track } from '@/utils/analytics';

export default function WindowResizer() {
  // const dispatch = useDispatch<Dispatch>();
  const [windowSize, setWindowSize] = useState({ width: 300, height: 300 });
  const cornerRef = React.useRef<HTMLDivElement>(null);

  const debouncedSizeChange = React.useRef(
    debounce((width, height) => {}, 300)
  ).current;

  const handleSizeChange = React.useCallback(
    (e: PointerEvent) => {
      const size = {
        width: Math.max(300, Math.floor(e.clientX + 5)),
        height: Math.max(200, Math.floor(e.clientY + 5)),
      };
      setWindowSize({ ...size });

      debouncedSizeChange(size.width, size.height);
    },
    [debouncedSizeChange, windowSize]
  );

  const onDown = React.useCallback(
    (e: any) => {
      if (cornerRef.current) {
        cornerRef.current.onpointermove = handleSizeChange;
        cornerRef.current.setPointerCapture(e.pointerId);
      }
    },
    [handleSizeChange]
  );

  const onUp = React.useCallback(
    async (e: any) => {
      if (cornerRef.current) {
        cornerRef.current.onpointermove = null;
        cornerRef.current.releasePointerCapture(e.pointerId);
        // dispatch.settings.triggerWindowChange();

        const success = await figmaAPI.run(async (figma, { width, height }) => {
          console.log({ width, height });
          await figma.ui.resize(width, height);
          return true;
        }, windowSize);
        console.log({ success });
      }
    },
    [windowSize]
  );

  // @TODO: Fix this when modals are open
  return (
    <div
      id="corner"
      onPointerDown={onDown}
      onPointerUp={onUp}
      ref={cornerRef}
      style={{
        zIndex: 999,
        position: "fixed",
        bottom: 0,
        right: 0,
        cursor: "nwse-resize",
      }}
    >
      {/* <Box css={{ width: 32, height: 32, background: "grey" }} /> */}
      {/* <IconResizeWindow /> */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.02081 16H3.6066L16 3.6066V5.02081L5.02081 16ZM10.835 16H9.42078L16 9.42078V10.835L10.835 16Z"
          fill="#8C8C8C"
        />
      </svg>
    </div>
  );
}
