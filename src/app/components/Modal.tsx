import * as React from 'react';
import ReactModal from 'react-modal';
import Heading from './Heading';

ReactModal.setAppElement('#react-page');

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: '1',
    },
    content: {
        padding: '0',
        position: 'relative',
        top: 'unset',
        right: 'unset',
        bottom: 'unset',
        left: 'unset',
        overflow: 'auto',
        maxHeight: '100%',
        border: 'none',
    },
};

const Modal = ({
    title,
    full,
    isOpen,
    close,
    children,
}: {
    title?: string;
    full?: boolean;
    isOpen: boolean;
    close: Function;
    children: React.ReactNode;
}) => (
    <ReactModal isOpen={isOpen} onRequestClose={close} style={customStyles} contentLabel={title || null}>
        <div className={full ? 'p-0' : 'p-8'}>
            {title && (
                <div className="mb-4 flex justify-center text-center">
                    <Heading size="small">{title}</Heading>
                </div>
            )}
            {children}
        </div>
    </ReactModal>
);

export default Modal;
