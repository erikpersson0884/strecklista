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
    cancelButtonText?: string;
    errorText?: string;
    errortextDisplayTime?: number;
    acceptButtonDisabled?: boolean;

    className?: string;
}

/**
 * PopupWindow component renders a modal popup window with customizable content and actions.
 *
 * @component
 * @param {PopupWindowProps} props - The properties for the PopupWindow component.
 * @param {boolean} props.isOpen - Determines whether the popup window is open or not.
 * @param {() => void} props.onClose - Callback function triggered when the popup is closed.
 * @param {() => void} [props.onAccept=onClose] - Callback function triggered when the accept button is clicked. Defaults to `onClose`.
 * @param {() => void} [props.onCancel=onClose] - Callback function triggered when the cancel button is clicked. Defaults to `onClose`.
 * @param {string} [props.title] - The title of the popup window. If not provided, no title is displayed.
 * @param {string} [props.buttonText] - The text displayed on the accept button. Defaults to "Skapa".
 * @param {React.ReactNode} props.children - The content to be displayed inside the popup window.
 * @param {string} [props.className] - Additional CSS class names to apply to the popup body.
 *
 * @returns {JSX.Element | null} The rendered PopupWindow component, or `null` if `isOpen` is false.
 */
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
        <PopupWindow title={title} isOpen={isOpen} onClose={onClose}>
            <div className={`popup-body ${className || ''}`}>
                {children}
            </div>

            <button className="accept-button" onClick={onAccept} disabled={acceptButtonDisabled} >{acceptButtonText}</button>

            {errorText && <p className='error-message'>{errorText}</p>}
        </PopupWindow>
    );
};

export default ActionPopupWindow;