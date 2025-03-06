import api from "./axiosInstance";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/user");
    return response.data;
};  

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

