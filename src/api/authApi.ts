import api from "./axiosInstance";

export const authApi = {
    authenticate: async () => {
        const authenticationUrl = (__API_BASE__ + "/oauth2/authorize");
        window.location.href = authenticationUrl;
    },
    login: async (code: string): Promise<{ token: string; user: User }> => {
        try {
            const body = {
                "grant_type": "authorization_code",
                "code": code,
            }
            const response = await api.post(`/oauth2/token`, body);
            return {
                token: response.data.access_token,
                user: response.data.user,
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Login failed");
        }
    }
};

export default authApi;
