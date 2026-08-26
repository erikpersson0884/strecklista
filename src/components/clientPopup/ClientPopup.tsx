import React from "react";
import "./ClientPopup.css";
import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";


interface ClientPopupProps {
    client?: Client;
    onClose?: () => void;
    onAccept: (name: string, description: string, scope: string) => void;
    title?: string;
    acceptButtonText?: string;
    className?: string;

}

const AddClientPopup: React.FC<ClientPopupProps> = ({client, onAccept, title, acceptButtonText, className}) => {
    const [ errorText, setErrorText ] = React.useState<string | null>(null);

    const [ scopes, setScopes ] = React.useState<string[]>(client?.scope?.split(' ') || []);
    const [ name, setName ] = React.useState<string>(client?.displayName || '');
    const [ description, setDescription ] = React.useState<string>(client?.description || '');


    const existingScopes: string[] = [
        'transactions.read',
        'transactions.create',
        'transactions.update',
        'items.read',
        'items.create',
        'items.update',
        'items.delete',
        'group.read',
    ]

    const handleClose = () => {
        setErrorText(null);
    };

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
            setErrorText("Namn och minst en scope är obligatoriskt.");
            return;
        }

        try {
            onAccept(name, description, scopes.join(' '));
        }
        catch (error) {
            setErrorText("Ett fel uppstod vid skapandet av klienten.");
        }
    }

    return (
        <ActionPopupWindow 
            title={ title || "Klient" }
            onAccept={handleAccept}
            onClose={handleClose}
            className={"client-popup " + className}
            acceptButtonText={acceptButtonText}
            errorText={errorText || undefined}
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
                {existingScopes.map((scopeOption) => (
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
