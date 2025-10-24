import React, {useEffect} from 'react';
import './ActionPopupWindow.css';
import PopupWindow from '../popupWindow/PopupWindow';

interface ActionPopupWindowProps {
    children: React.ReactNode;
    isOpen: boolean;
    onAccept?: () => any;
    onCancel?: () => any;
    onClose: () => any;

    title?: string;
    acceptButtonText?: string;
    errorText?: string;
    errortextDisplayTime?: number;
    acceptButtonDisabled?: boolean;

    className?: string;
}


const ActionPopupWindow: React.FC<ActionPopupWindowProps> = ({ 
    isOpen, 
    onClose, 
    onAccept = onClose, 
    title, 
    acceptButtonText = 'Skapa',
    errorText = null,
    errortextDisplayTime = 3000, // Time in milliseconds the error text is displayed
    acceptButtonDisabled = false,
    children, 
    className 
}) => {
    if (!isOpen) return null;

    const [ _, setLocalErrorText] = React.useState<string | null>(errorText);

    useEffect(() => {
        setLocalErrorText(errorText ?? null);
        if (errorText) {
            const timer = setTimeout(() => {
                setLocalErrorText(null);
            }, errortextDisplayTime);

            return () => clearTimeout(timer);
        }
    }, [errorText, errortextDisplayTime]);

    return (
        <PopupWindow title={title} isOpen={isOpen} onClose={onClose} >
            <div className={`popup-body ${className || ''}`}>
                {children}
            </div>

            <button className="accept-button" onClick={onAccept} disabled={acceptButtonDisabled}>
                <span>{acceptButtonText}</span>
                </button>

            {errorText && <p className='error-message'>{errorText}</p>}
        </PopupWindow>
    );
};

export default ActionPopupWindow;