import React from 'react';
import './Modal.css';
import { useEffect } from 'react';


interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen = true, onClose, children }) => {
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Only a click on the backdrop itself closes the modal, not clicks inside the content.
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <aside className='modal-overlay' role="presentation" onClick={handleBackdropClick}>
            {children}
        </aside>
    );
};

export default Modal;