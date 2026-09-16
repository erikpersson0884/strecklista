import { FC, useState } from "react";
import "./DisplayClientPopup.css";
import PopupWindow from "@/components/popupWindow/PopupWindow";
import copyIcon from "@/assets/images/copy.svg";

interface DisplayClientPopupProps {
    client: Client;
    secret?: string;
    title?: string;
    className?: string;
}

const DisplayClientPopup: FC<DisplayClientPopupProps> = ({ client, secret, title, className }) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <PopupWindow
            title={ title || "Klientinformation" }
            className={ `display-client-popup ${className}` }
        >
            <div className="client-field">
                <span className="field-label">Namn</span>
                <span className="field-value">{client.displayName}</span>
            </div>

            {client.description && (
                <div className="client-field">
                    <span className="field-label">Beskrivning</span>
                    <span className="field-value">{client.description}</span>
                </div>
            )}

            <div className="client-field">
                <span className="field-label">ID</span>
                <button
                    className="field-value copyable"
                    onClick={() => handleCopy(client.id, "id")}
                    title="Klicka för att kopiera"
                >
                    {client.id}
                    {
                        copiedField === "id" ? <span className="copy-feedback">Kopierat!</span>
                        : <img src={copyIcon} alt="Kopiera" className="copy-icon" />
                    }
                </button>
            </div>

            {secret && (
                <div className="client-field">
                    <span className="field-label">Secret</span>
                    <button
                        className="field-value copyable"
                        onClick={() => handleCopy(secret, "secret")}
                        title="Klicka för att kopiera"
                    >
                        {secret}
                        {
                            copiedField === "secret" ? <span className="copy-feedback">Kopierat!</span>
                            : <img src={copyIcon} alt="Kopiera" className="copy-icon" />
                        }
                    </button>
                </div>
            )}

            <div className="client-field">
                <span className="field-label">Scopes</span>
                <div className="scope-list">
                    {client.scope.split(" ").map((scopeItem, index) => (
                        <span className="scope-pill" key={index}>
                            {scopeItem.split('.').reverse().join(' ')}
                        </span>
                    ))}
                </div>
            </div>
        </PopupWindow>
    );
}

export default DisplayClientPopup;