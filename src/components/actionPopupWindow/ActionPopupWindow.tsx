import React from 'react';
import './ActionPopupWindow.css';
import PopupWindow from '@/components/popupWindow/PopupWindow';

interface ActionPopupWindowProps {
    children: React.ReactNode;
    onAccept?: () => any;
    onClose?: () => any;

    title?: string;
    acceptButtonText?: string;
    errorText?: string;
    errortextDisplayTime?: number;
    acceptButtonDisabled?: boolean;

    className?: string;
}
/**
 * Renders a modal popup with custom content and an accept button.
 * The modal closes after the accept callback completes.
 *
 * @param props.children Content displayed inside the popup.
 * @param props.onAccept Callback invoked when the accept button is clicked.
 * @param props.onClose Callback used as the default accept callback.
 * @param props.title Optional popup title.
 * @param props.acceptButtonText Text displayed on the accept button.
 * @param props.acceptButtonDisabled Whether the accept button is disabled.
 * @param props.className Additional CSS class applied to the popup.
 */
const ActionPopupWindow: React.FC<ActionPopupWindowProps> = ({ 
    onClose = () => {}, 
    onAccept = onClose,
    title, 
    acceptButtonText = 'Skapa',
    acceptButtonDisabled = false,
    children, 
    className = '',
}) => {
    const acceptHandler = async () => {
        await onAccept();
    }

    return (
        <PopupWindow title={title} className={className}>
            <div className={`popup-body `}>
                {children}
            </div>

            <button className="accept-button" onClick={acceptHandler} disabled={acceptButtonDisabled}>
                <span>{acceptButtonText}</span>
                </button>
        </PopupWindow>
    );
};

export default ActionPopupWindow;