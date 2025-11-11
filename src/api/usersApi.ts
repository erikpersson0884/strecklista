import api from "./axiosInstance";
import { userAdapter } from "../adapters/userAdapter";


export const usersApi = {
    /**
     * Fetches the current user's data from the API.
     *
     * @returns {Promise<User>} A promise that resolves to the current user's data.
     * @throws Will throw an error if the request fails.
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get("/user");
        const user = userAdapter(response.data.data.user);
        return user;
    },  

    getUsers: async (): Promise<User[]> => {
        const response = await api.get("/group");
        const apiUsers = response.data.data.members;
        const users = apiUsers.map(userAdapter);
        return users;
    },
}

export default usersApi;
