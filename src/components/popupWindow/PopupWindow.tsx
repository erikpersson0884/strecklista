import React from 'react';
import './PopupWindow.css';
import Modal from '../modal/Modal';
import Closebutton from '../closebutton/Closebutton';

interface PopupWindowProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => any;

    title?: string;

    className?: string;
}

const PopupWindow: React.FC<PopupWindowProps> = ({ 
    isOpen, 
    onClose, 
    title,
    children, 
    className 
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={`popup-window ${className ? `${className}` : ''}`} onClick={onClose}>
                <div 
                    className={`popup-content `} 
                    onClick={(e) => e.stopPropagation()}
                >
                    {title && 
                        <>
                            <h2 className="popup-title">{title}</h2>
                            <hr />
                        </>
                    }
                    
                    {children}
                </div>

                <Closebutton closeAction={onClose} />
            </div>
        </Modal>
    );
};

export default PopupWindow;