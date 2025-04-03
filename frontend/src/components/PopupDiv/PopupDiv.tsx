import React, { useEffect } from "react";
import './PopupDiv.css';
import Shadowbox from "../Shadowbox/Shadowbox";

interface PopupDivProps {
    children: React.ReactNode;
    title: string;

    showPopupDiv: boolean;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;

    doAction: () => void;
    cancelAction?: () => void;

    acceptButtonText?: string;
    cancelButtonText?: string;
    className?: string;
}

/**
 * PopupDiv component.
 * 
 * This component renders a popup with a title, content, and action buttons.
 * It also handles closing the popup when the Escape key is pressed.
 * @param {string} title - The title of the popup.
 * @param {boolean} showPopupDiv - A boolean indicating whether the popup should be shown.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setShowPopupDiv - The function to set the visibility of the popup.

 * @param {string} [acceptButtonText="Acceptera"] - The text for the accept button.
 * @param {string} [cancelButtonText="Avbryt"] - The text for the cancel button.
 * 
 * @param {() => void} doAction - The function to be called when the accept button is clicked.
 * @param {() => void} [cancelAction] - The function to be called when the cancel button is clicked.
 * 
 * @param {string} [className] - Additional class names for the popup.
 * @returns {JSX.Element | null} The rendered PopupDiv component or null if not visible.
 */
const PopupDiv: React.FC<PopupDivProps> = ({ 
    children, 
    title, 
    acceptButtonText = "Acceptera", 
    cancelButtonText = "Avbryt", 
    doAction,
    cancelAction = () => {},
    showPopupDiv, 
    setShowPopupDiv,
    className = ""
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
        <Shadowbox onClick={handleClose}>
            <aside className={"popup-div" + " " + className} onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClose} className="close-button">
                    ×
                </button>

                <h1>{title}</h1>
                <hr />
                
                <div className="popup-content">
                    {children}
                </div>

                <div className="popup-actions">
                    <button className="doButton" onClick={doAction}>
                        {acceptButtonText}
                    </button>

                    <button className="cancel-button" onClick={handleClose}>
                        {cancelButtonText}
                    </button>
                </div>
            </aside>
        </Shadowbox>
    );
};

export default PopupDiv;
