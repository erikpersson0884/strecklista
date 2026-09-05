import api from "./axiosInstance";
import { apiGroupClient, ApiGroupClient, apiScope } from "../schemas/api";
import clientAdapter from "@/adapters/clientAdapter";

const clientApi = {
    getScopes: async (): Promise<string[]> => {
        const response = await api.get("/meta");
        const success = apiScope.array().safeParse(response.data.data.supportedScopes);
        if (!success.success) {
            throw new Error("Failed to parse scopes:" + success.error);
        } else {
            return success.data;
        }
    },

    getClients: async (): Promise<ApiGroupClient[]> => {
        const response = await api.get("/group/client");
        const success = apiGroupClient.array().safeParse(response.data.data.clients);
        if (!success.success) {
            console.log(success.error)
            throw new Error("Failed to parse clients:" + success.error);
        }
        return success.data;
    },

    getClient: async (clientId: string): Promise<ApiGroupClient> => {
        const response = await api.get(`/group/client/${clientId}`);
        const success = apiGroupClient.safeParse(response.data.data.client);
        if (!success.success) {
            throw new Error("Failed to parse client:" + success.error);
        }
        return success.data;
    },

    createClient: async (name: string, description: string, scope: string): Promise<{client: Client, secret: string}> => {
        const clientData = { 
            displayName: name, 
            description, 
            scope
        };
        const response = await api.post("/group/client", clientData);
        const success = apiGroupClient.safeParse(response.data.data.client);
        if (!success.success) {
            console.error("Failed to parse created client: ", success.error);
            throw new Error("Failed to parse created client: " + success.error);
        }
        const client = clientAdapter.adaptClient(success.data);
        const secret = response.data.data.client.secret;
        if (!secret) throw new Error("Failed to retrieve secret for the created client.");
        
        return { client, secret };
    },

    updateClient: async (clientId: string, name: string, description: string, scope: string): Promise<ApiGroupClient> => {
        try {
            const clientData = {
                displayName: name,
                description,
                scope
            };
            const response = await api.patch(`/group/client/${clientId}`, clientData);
            const success = apiGroupClient.safeParse(response.data.data.client);
            if (!success.success) {
                console.error("Failed to parse updated client: " + success.error);
                throw new Error("Failed to parse updated client: " + success.error);
            }
            return success.data;
        } catch (error) {
            console.error(`Error updating client with ID ${clientId}:`, error);
            throw error;
        }   
    },

    deleteClient: async (clientId: string): Promise<void> => {
        api.delete(`/group/client/${clientId}`)
    },
}

export default clientApi;