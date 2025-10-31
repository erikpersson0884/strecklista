import React, {useEffect} from 'react';
import './ActionPopupWindow.css';
import PopupWindow from '../popupWindow/PopupWindow';
import { useModalContext } from '../../contexts/ModalContext';

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


const ActionPopupWindow: React.FC<ActionPopupWindowProps> = ({ 
    onClose = () => {}, 
    onAccept = onClose,
    title, 
    acceptButtonText = 'Skapa',
    errorText = null,
    errortextDisplayTime = 3000, // Time in milliseconds the error text is displayed
    acceptButtonDisabled = false,
    children, 
    className = '',
}) => {
    const { closeModal } = useModalContext();

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

    const acceptHandler = async () => {
        await onAccept();
        closeModal();
    }

    return (
        <PopupWindow title={title} className={className}>
            <div className={`popup-body `}>
                {children}
            </div>

            <button className="accept-button" onClick={acceptHandler} disabled={acceptButtonDisabled}>
                <span>{acceptButtonText}</span>
                </button>

            {errorText && <p className='error-message'>{errorText}</p>}
        </PopupWindow>
    );
};

export default ActionPopupWindow;