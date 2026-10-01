import api from "./axiosInstance";
import { apiUserLoginResponse, apiClientLoginResponse } from "@/schemas/api";
import authAdapter from "@/adapters/authAdapter";

export const authApi = {
    /**
     * Redirects the user to the OAuth2 provider to begin the authorization
     * code flow.
     *
     * The provider redirects back to the application with an authorization
     * code, which should be passed to {@link userLogin}.
     */
    userAuthenticate: async () => {
        window.location.href = "/api/oauth2/authorize";
    },

    /**
     * Exchanges an OAuth2 authorization code for an access token and user.
     *
     * @param code - The authorization code returned by the OAuth2 provider.
     * @returns The access token and authenticated user.
     * @throws An error when the response cannot be parsed.
     */
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

    /**
     * Authenticates an API client using the OAuth2 Client Credentials flow.
     *
     * @param clientId - The OAuth2 client identifier.
     * @param clientSecret - The OAuth2 client secret.
     * @returns The access token and the authenticated client's details and scope.
     * @throws An error when authentication fails or the response cannot be parsed.
    *
    * The client credentials are sent to the token endpoint. The returned
    * client data is reduced to the fields required by the application.
     */
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
                throw new Error("Failed to parse login response " + parsed.error);
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
