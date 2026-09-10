import { FC, useState } from "react";
import ActionPopupWindow from "@/components/actionPopupWindow/ActionPopupWindow";
import useAuthContext from "@/contexts/AuthContext";
import useModalContext from "@/contexts/ModalContext";

interface ClientLoginPopupProps {
    title?: string;
    acceptButtonText?: string;
    className?: string;
}
const ClientLoginPopup: FC<ClientLoginPopupProps> = ({title, acceptButtonText, className}) => {
    const { clientLogin } = useAuthContext();
    const { closeModal } = useModalContext();

    const [ clientId, setClientId] = useState<string>(localStorage.getItem("clientId") || "");
    const [ clientSecret, setClientSecret] = useState<string>(localStorage.getItem("clientSecret") || "");

    const handleLogin = () => {
        clientLogin(clientId, clientSecret);
        closeModal();
    }

    return (
        <ActionPopupWindow
            title={ title  || "Logga in med klient"}
            acceptButtonText={ acceptButtonText || "Logga in"}
            onAccept={handleLogin}
            className={className}
        >
            <input type="text" placeholder="Client ID" defaultValue={clientId} onChange={(e) => setClientId(e.target.value)} />
            <input type="text" placeholder="Client Secret" defaultValue={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
        </ActionPopupWindow>
    )
}

export default ClientLoginPopup;
