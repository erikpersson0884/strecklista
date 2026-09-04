import React from "react";
import "./ClientPopup.css";
import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";
import { useClientContext } from "@/contexts/ClientContext";
import { useNotificationContext } from "@/contexts/NotificationContext";

interface ClientPopupProps {
    client?: Client;
    title?: string;
    onAccept: (name: string, description: string, scope: string) => void;
    acceptButtonText?: string;
    className?: string;
}

const AddClientPopup: React.FC<ClientPopupProps> = ({client, title, onAccept, acceptButtonText, className}) => {
    const { notify } = useNotificationContext();
    const { availableScope } = useClientContext();
    const [ scopes, setScopes ] = React.useState<string[]>(client?.scope?.split(' ') || []);
    const [ name, setName ] = React.useState<string>(client?.displayName || '');
    const [ description, setDescription ] = React.useState<string>(client?.description || '');


    const handleScopeChange = (scope: string) => {
        setScopes((prevScopes) => {
            if (prevScopes.includes(scope)) {
                return prevScopes.filter((s) => s !== scope);
            }
            return [...prevScopes, scope];
        });
    }

    const handleAccept = () => {
        if (name.trim() === '' || scopes.length === 0) {
            notify("Namn och minst en scope är obligatoriskt.");
            return;
        }

        try {
            onAccept(name, description, scopes.join(' '));
        }
        catch (error) {
            notify("Ett fel uppstod vid skapandet av klienten.");
        }
    }

    return (
        <ActionPopupWindow 
            title={ title || "Klient" }
            onAccept={handleAccept}
            className={"client-popup " + className}
            acceptButtonText={acceptButtonText}
            acceptButtonDisabled={name.trim() === '' ||  scopes.length === 0}
        >
            <label htmlFor="name">Namn:</label>
            <input type="text"
                placeholder="Namn"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="description">Beskrivning:</label>
            <input type="text" 
                placeholder="Beskrivning"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <label htmlFor="scope">Scope:</label>
            <ul className="no-list-formatting scope-options">
                {availableScope.map((scopeOption) => (
                    <li key={scopeOption} onClick={() => handleScopeChange(scopeOption)}>
                        <input
                            type="checkbox"
                            name="scope"
                            value={scopeOption}
                            checked={scopes.includes(scopeOption)}
                            onChange={() => handleScopeChange(scopeOption)}
                        />
                        <label>
                            {scopeOption.split('.').reverse().join(' ')}
                        </label>
                    </li>
                ))}
            </ul>

        </ActionPopupWindow>
    );
}

export default AddClientPopup;
