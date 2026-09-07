import React from 'react';
import './PopupWindow.css';
import useModalContext from '@/contexts/ModalContext';
import closeImage from '@/assets/images/close.svg';


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
            <button className='close-button' onClick={closeAction}>
                <img src={closeImage} alt="close" height={20}/>
            </button>
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


        </div>
    );
};

export default PopupWindow;