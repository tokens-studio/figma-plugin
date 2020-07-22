import * as React from 'react';
import {DialogOverlay, DialogContent} from '@reach/dialog';
import '@reach/dialog/styles.css';

const Modal = ({title, isOpen, close, children}) => (
    <DialogOverlay isOpen={isOpen} onDismiss={close}>
        <DialogContent aria-label={title}>{children}</DialogContent>
    </DialogOverlay>
);

export default Modal;
