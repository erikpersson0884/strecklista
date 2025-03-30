import api from "./axiosInstance";

export const authenticate = async () => {
  try {
    const response = await api.get("/authorize");
    return response.data.data; // Returns { token, user }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Authentication failed");
  }
}
export const login = async (code: string): Promise<{ token: string; user: User }> => {
  try {
    const response = await api.post(`/login?code=${code}`);
    return {
      token: response.data.access_token,
      user: response.data.user,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

