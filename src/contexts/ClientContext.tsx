import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import clientApi from '../api/clientApi';
import { useAuth } from './AuthContext';


interface ClientContextType {
    isLoadingClients: boolean;
    clients: Client[];

    createClient: (name: string, description: string, scope: string) => Promise<Client>;
    updateClient: (clientId: ClientId, name: string, description: string, scope: string) => Promise<Client>;
    deleteClient: (clientId: ClientId) => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();

    const [ isLoadingClients, setIsLoadingClient ] = useState<boolean>(true);
    const [ clients, setClients ] = useState<Client[]>([]);
    
    const fetchClients = async () => {
        try {
            const fetchedClient = await clientApi.getClients();
            setClients(fetchedClient);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            setIsLoadingClient(true);
            await fetchClients();
            setIsLoadingClient(false);
        };

        fetchData();
    }, [isAuthenticated]);

    const createClient = async (name: string, description: string, scope: string): Promise<Client> => {
        try {
            if (!name || !scope) throw new Error("Name, description, and scope are required to create a client.");
            if (scope.length < 1) throw new Error("Scope must contain at least one permission.");

            const newClient = await clientApi.createClient(name, description, scope);
            console.log('Client created successfully:', newClient);
            setClients(prevClients => [...prevClients, newClient]);
            return newClient;
        }
        catch (error) {
            console.error('Failed to create client:', error);
            throw error;
        }
    };

    const updateClient = async (clientId: ClientId, name: string, description: string, scope: string): Promise<Client> => {
        try {
            const updatedClient = await clientApi.updateClient(clientId, name, description, scope);
            setClients(prevClients => prevClients.map(client => client.id === clientId ? updatedClient : client));
            return updatedClient;
        }
        catch (error) {
            console.error('Failed to update client:', error);
            throw error;
        }
    };

    const deleteClient = async (clientId: ClientId): Promise<void> => {
        try {
            await clientApi.deleteClient(clientId);
            setClients(prevClients => prevClients.filter(client => client.id !== clientId));
        }
        catch (error) {
            console.error('Failed to delete client:', error);
            throw error;
        }
    };

    return (
        <ClientContext.Provider value={{ 
            isLoadingClients, 
            clients, 
            createClient,
            updateClient,
            deleteClient
        }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClientContext = (): ClientContextType => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClient must be used within a ClientProvider');
    }
    return context;
};