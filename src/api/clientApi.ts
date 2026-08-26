import api from "./axiosInstance";
import { apiGroupClient, ApiGroupClient } from "../schemas/api";

const clientApi = {
    getClients: async (): Promise<ApiGroupClient[]> => {
        try {
            const response = await api.get("/group/client");
            const success = apiGroupClient.array().safeParse(response.data.data.clients);
            if (!success.success) {
                console.log(success.error)
                throw new Error("Failed to parse clients:" + success.error);
            }
            return success.data;
        } catch (error) {
            console.error("Error fetching clients:", error);
            throw error;
        }
    },

    getClient: async (clientId: string): Promise<ApiGroupClient> => {
        try {
            const response = await api.get(`/group/client/${clientId}`);
            const success = apiGroupClient.safeParse(response.data.data.client);
            if (!success.success) {
                throw new Error("Failed to parse client:" + success.error);
            }
            return success.data;
        } catch (error) {
            console.error(`Error fetching client with ID ${clientId}:`, error);
            throw error;
        }
    },

    createClient: async (name: string, description: string, scope: string): Promise<ApiGroupClient> => {
        try {
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
            return success.data;
        } catch (error) {
            console.error("Error creating client:", error);
            throw error;
        }
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
        try {
            await api.delete(`/group/client/${clientId}`);
        } catch (error) {
            console.error(`Error deleting client with ID ${clientId}:`, error);
            throw error;
        }
    },
}

export default clientApi;