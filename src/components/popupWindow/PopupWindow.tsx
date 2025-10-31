import React from 'react';
import './PopupWindow.css';
import { useModalContext } from '../../contexts/ModalContext';
import Closebutton from '../closebutton/Closebutton';

interface PopupWindowProps {
    children: React.ReactNode;
    onClose?: () => any;

    title?: string;

    className?: string;
}

const PopupWindow: React.FC<PopupWindowProps> = ({ 
    onClose = () => {},
    title,
    children, 
    className 
}) => {
    const { closeModal } = useModalContext();

    const closeAction = () => {
        onClose();
        closeModal();
    }

    return (
        <div className={`popup-window ${className ? `${className}` : ''}`} onClick={(e) => e.stopPropagation()}>
            {title && 
                <header className="popup-header">
                    <h2>{title}</h2>
                    <hr />
                </header>
            }
            <div 
                className={`popup-content `} 
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>

            <Closebutton closeAction={closeAction} />
        </div>
    );
};

export default PopupWindow;