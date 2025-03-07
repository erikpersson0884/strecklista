import api from "./axiosInstance";

export const login = async (code: string) => {
  try {
    const response = await api.post(`/login?code=${code}`);
    return response.data.data; // Returns { token, user }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};
