import React from 'react';
import './PopupWindow.css';
import Modal from '../modal/Modal';
import closeIcon from '../../assets/images/close.svg';

interface PopupWindowProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => any;

    title?: string;

    className?: string;
}

/**
 * PopupWindow component renders a modal popup window with customizable content and actions.
 *
 * @component
 * @param {PopupWindowProps} props - The properties for the PopupWindow component.
 * @param {boolean} props.isOpen - Determines whether the popup window is open or not.
 * @param {() => void} props.onClose - Callback function triggered when the popup is closed.
 * @param {string} [props.title] - The title of the popup window. If not provided, no title is displayed.
 * @param {React.ReactNode} props.children - The content to be displayed inside the popup window.
 * @param {string} [props.className] - Additional CSS class names to apply to the popup body.
 *
 * @returns {JSX.Element | null} The rendered PopupWindow component, or `null` if `isOpen` is false.
 */
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
            <div className={`popup-window `} onClick={onClose}>
                <div 
                    className={`popup-content ${className ? `${className}` : ''}`} 
                    onClick={(e) => e.stopPropagation()}
                >
                    {title && <h2 className="popup-title">{title}</h2>}
                    
                    {children}
                </div>

                <button className="close-button" onClick={onClose}>
                    <img src={closeIcon} alt="Close" className="close-icon" />
                </button>
            </div>
        </Modal>
    );
};

export default PopupWindow;