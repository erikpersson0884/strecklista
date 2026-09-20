import api from "./axiosInstance";
import { apiUserLoginResponse, apiClientLoginResponse } from "../schemas/api";
import authAdapter from "../adapters/authAdapter";

export const authApi = {
    // Login via OAuth2 Authorization Code Flow
    userAuthenticate: async () => {
        window.location.href = "/api/oauth2/authorize";
    },

    userLogin: async (code: string): Promise<{ token: string; user: User }> => {
        const body = {
            "grant_type": "authorization_code",
            "code": code,
        }

        const response = await api.post(`/oauth2/token`, body);
        const parsed = apiUserLoginResponse.safeParse(response.data);
        if (!parsed.success) {
            console.error("Failed to parse login response", parsed.error);
            throw new Error("Failed to parse login response");
        }

        const { token, user } = authAdapter.adaptLoginResponse(parsed.data);
        return { token, user };
    },

    // Login via OAuth2 Client Credentials Flow
    clientLogin: async (clientId: string, clientSecret: string): Promise<{token: string, client: Partial<Client>}> => {
        try {
            const body = {
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret,
            };

            const response = await api.post("/oauth2/token", body);
            const parsed = apiClientLoginResponse.safeParse(response.data)

            if (!parsed.success)  {
                throw new Error("Failed to parse group members " + parsed.error);
            }
            const token: string = parsed.data.access_token
            const client: Partial<Client> = {
                id: parsed.data.client.id, 
                displayName: parsed.data.client.displayName,
                scope: parsed.data.scope,
            }
            return {token, client}
        } catch (error: any) {
            console.error("Login failed:", error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error?.message ||
                error.response?.data?.message ||
                error.message ||
                "Login failed, no additional error information available."
            );
        }
    },
};

export default authApi;
