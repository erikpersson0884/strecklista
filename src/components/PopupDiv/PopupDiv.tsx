import React from 'react';
import './PopupDiv.css';
import Modal from '../modal/Modal';
import closeIcon from '../../assets/images/close.svg';

interface PopupDivProps {
    children: React.ReactNode;
    isOpen: boolean;
    onAccept?: () => any;
    onCancel?: () => any;
    onClose: () => any;

    title?: string;
    acceptButtonText?: string;
    cancelButtonText?: string;

    errorText?: string | null;

    className?: string;
}

/**
 *PopupDiv component renders a modal popup window with customizable content and actions.
 *
 * @component
 * @param {PopupWindowProps} props - The properties for thePopupDiv component.
 * @param {boolean} props.isOpen - Determines whether the popup window is open or not.
 * @param {() => void} props.onClose - Callback function triggered when the popup is closed.
 * @param {() => void} [props.onAccept=onClose] - Callback function triggered when the accept button is clicked. Defaults to `onClose`.
 * @param {() => void} [props.onCancel=onClose] - Callback function triggered when the cancel button is clicked. Defaults to `onClose`.
 * @param {string} [props.title] - The title of the popup window. If not provided, no title is displayed.
 * @param {string} [props.buttonText] - The text displayed on the accept button. Defaults to "Skapa".
 * @param {React.ReactNode} props.children - The content to be displayed inside the popup window.
 * @param {string} [props.className] - Additional CSS class names to apply to the popup body.
 *
 * @returns {JSX.Element | null} The renderedPopupDiv component, or `null` if `isOpen` is false.
 */
const PopupDiv: React.FC<PopupDivProps> = ({ 
    children,
    isOpen, 
    onClose, 
    onAccept = onClose, 
    onCancel = onClose, 
    title, 
    acceptButtonText = "Acceptera",
    cancelButtonText = "Avbryt", 
    className,
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={`popup-window `} onClick={onClose}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                    {title && <h2 className="popup-title">{title}</h2>}
                    
                    <hr />

                    <button className="close-button" onClick={onClose}>
                        <img src={closeIcon} alt="Close" className="close-icon" />
                    </button>
                    
                    <div className={`popup-body ${className || ''}`}>
                        {children}
                    </div>

                    <div className='popup-footer'>
                        <button onClick={onAccept}>{acceptButtonText}</button>
                        <button className="cancel-button" onClick={onCancel}>{cancelButtonText}</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PopupDiv;
