import React, { useEffect } from "react";
import './PopupDiv.css';

interface PopupDivProps {
    children: React.ReactNode;
    title: string;
    acceptButtonText?: string;
    cancelButtonText?: string;
    doAction: () => void;
    cancelAction?: () => void;
    showPopupDiv: boolean;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopupDiv: React.FC<PopupDivProps> = ({ 
    children, 
    title, 
    acceptButtonText = "Acceptera", 
    cancelButtonText = "Avbryt", 
    doAction,
    cancelAction = () => {},
    showPopupDiv, 
    setShowPopupDiv 
}) => {

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowPopupDiv(false);
        };

        if (showPopupDiv) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showPopupDiv, setShowPopupDiv]);

    const handleClose = () => {
        setShowPopupDiv(false);
        cancelAction();
    };


    if (!showPopupDiv) return null;

    return (
        <aside className="popup-div">
            <button onClick={handleClose} className="close-button">
                ×
            </button>

            <h1>{title}</h1>
            <hr />
            
            {children}

            <div className="popup-actions">
                <button className="doButton" onClick={doAction}>
                    {acceptButtonText}
                </button>

                <button className="cancel-button" onClick={handleClose}>
                    {cancelButtonText}
                </button>
            </div>
        </aside>
    );
};

export default PopupDiv;
