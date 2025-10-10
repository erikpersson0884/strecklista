import React from 'react';
import './Modal.css';

interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen = true, onClose, children }) => {
    if (!isOpen) return null;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    }

    return (
        <aside className='modal-overlay' onClick={handleClick}>
            {children}
        </aside>
    );
};

export default Modal;