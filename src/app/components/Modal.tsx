import * as React from 'react';
import ReactModal from 'react-modal';
import Heading from './Heading';

if (process.env.NODE_ENV !== 'test') ReactModal.setAppElement('#app');

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
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
    id,
    title,
    full,
    isOpen,
    close,
    children,
}: {
    id?: string;
    title?: string;
    full?: boolean;
    isOpen: boolean;
    close: Function;
    children: React.ReactNode;
}) => (
    <ReactModal isOpen={isOpen} onRequestClose={close} style={customStyles} contentLabel={title || null}>
        <div data-cy={id} className={full ? 'p-0' : 'p-8'}>
            {title && (
                <div className="mb-4">
                    <Heading size="small">{title}</Heading>
                </div>
            )}
            {children}
        </div>
    </ReactModal>
);

export default Modal;
