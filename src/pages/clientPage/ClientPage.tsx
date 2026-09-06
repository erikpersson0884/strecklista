import React from "react";
import "./ClientPage.css";

import { useClientContext } from "@/contexts/ClientContext";
import useModalContext from "@/contexts/ModalContext";

import ClientPopup from "@/components/clientPopup/ClientPopup";
import DisplayClientPopup from "@/components/displayClientPopup/DisplayClientPopup";

import deleteIcon from "@/assets/images/delete-white.svg";

const ClientPage: React.FC = () => {
    const { clients, isLoadingClients, createClient, deleteClient } = useClientContext();
    const { openModal } = useModalContext();

    if (isLoadingClients) {
        return <div>Loading clients...</div>;
    }

    const handleCreateClient = async (name: string, description: string, scope: string) => {
        const {client: createdClient, secret} = await createClient(name, description, scope);
        if (createdClient) openModal(<DisplayClientPopup client={createdClient} secret={secret} title="Skapad klient" />);
    }

    const handleDeleteClient = (clientId: string) => {
        const confirmDelete = window.confirm("Är du säker på att du vill ta bort klienten?");
        if (confirmDelete) {
            deleteClient(clientId);
        }
    }

    const openCreateClientModal = () => {
        openModal(<ClientPopup 
            title="Lägg till klient"
            acceptButtonText="Lägg till"
            onAccept={handleCreateClient}
        />);
    }

    const openViewClientModal = (client: Client) => {
        openModal(<DisplayClientPopup client={client} />);
    }

    // const openManageClientModal = (client: Client) => {
    //     console.log("Updating clients not implemented yet. Client data:", client);

        // openModal(<ClientPopup 
        //     client={client}
        //     title="Hantera klient"
        //     acceptButtonText="Spara"
        //     onAccept={(name, description, scope) => updateClient(client.id, name, description, scope)}
        // />);
    // }

    return (
        <div className="client-page page">
            <h2>Client Manager</h2>
            <ul >
                {clients.map((client) => (
                    <li key={client.id} className="list-item" onClick={() => openViewClientModal(client)}>
                        <p>{client.displayName}</p>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClient(client.id);
                        }}>
                            <img src={deleteIcon} alt="Delete" />
                        </button>
                    </li>
                ))}

                <li className="list-item add-item-li">
                    <button onClick={openCreateClientModal}>
                        Add Client
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default ClientPage;
