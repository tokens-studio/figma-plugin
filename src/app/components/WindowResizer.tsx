/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useDispatch} from 'react-redux';
import {Dispatch} from '../store';
import IconResizeWindow from './icons/IconResizeWindow';

export default function WindowResizer() {
    const dispatch = useDispatch<Dispatch>();

    const cornerRef = React.useRef<HTMLDivElement>(null);

    const handleSizeChange = (e) => {
        console.log('Moving', e);
        const size = {
            width: Math.max(300, Math.floor(e.clientX + 5)),
            height: Math.max(200, Math.floor(e.clientY + 5)),
        };
        dispatch.settings.setWindowSize({
            ...size,
        });
    };

    const onDown = (e) => {
        console.log('Down', e);

        cornerRef.current.onpointermove = handleSizeChange;
        cornerRef.current.setPointerCapture(e.pointerId);
    };
    const onUp = (e) => {
        console.log('|Up', e);

        cornerRef.current.onpointermove = null;
        cornerRef.current.releasePointerCapture(e.pointerId);
        dispatch.settings.triggerWindowChange();
    };
    return (
        <div id="corner" onPointerDown={onDown} onPointerUp={onUp} ref={cornerRef}>
            <IconResizeWindow />
        </div>
    );
}
