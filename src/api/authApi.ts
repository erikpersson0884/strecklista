import api from "./axiosInstance";
import { apiUserLoginResponse } from "../schemas/api";
import authAdapter from "../adapters/authAdapter";

export const authApi = {
    authenticate: async () => {
        const authenticationUrl = (__API_BASE__ + "/oauth2/authorize");
        window.location.href = authenticationUrl;
    },
    login: async (code: string): Promise<{ token: string; user: User }> => {
        const body = {
            "grant_type": "authorization_code",
            "code": code,
        }
        const response = await api.post(`/oauth2/token`, body);
        const parsed = apiUserLoginResponse.safeParse(response.data);
        if (!parsed.success) {
            throw new Error("Invalid response from server " + parsed.error);
        } 
        const {token, user} = authAdapter.adaptLoginResponse(parsed.data);
        return {token, user}
    }
};

export default authApi;
