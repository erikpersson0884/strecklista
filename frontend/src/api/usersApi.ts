import api from "./axiosInstance";
import { User } from "../Types";


export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};


/**
 * Fetches the current user's data from the API.
 *
 * @returns {Promise<any>} A promise that resolves to the current user's data.
 * @throws Will throw an error if the request fails.
 */
export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get("/user");
    return response.data;
};  

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

