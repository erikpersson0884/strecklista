import api from "./axiosInstance";
import { apiUserLoginResponse } from "../schemas/api";
import authAdapter from "../adapters/authAdapter";

export const authApi = {
    authenticate: async () => {
        window.location.href = "/api/oauth2/authorize";
    },

    login: async (code: string): Promise<{ token: string; user: User }> => {
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
    }
};

export default authApi;
