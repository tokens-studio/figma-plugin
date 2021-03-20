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
    showClose = false,
}: {
    id?: string;
    title?: string;
    full?: boolean;
    isOpen: boolean;
    close: Function;
    children: React.ReactNode;
    showClose?: boolean;
}) => (
    <ReactModal isOpen={isOpen} onRequestClose={close} style={customStyles} contentLabel={title || null}>
        {showClose && (
            <div className="flex flex-col items-end h-0">
                <button
                    type="button"
                    onClick={() => close()}
                    className="p-4 hover:bg-gray-100 rounded focus:outline-none"
                >
                    <svg className="svg" width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M6 5.293l4.789-4.79.707.708-4.79 4.79 4.79 4.789-.707.707-4.79-4.79-4.789 4.79-.707-.707L5.293 6 .502 1.211 1.21.504 6 5.294z"
                            fillRule="nonzero"
                            fillOpacity="1"
                            fill="#000"
                            stroke="none"
                        />
                    </svg>
                </button>
            </div>
        )}
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
