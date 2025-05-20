import api from "./axiosInstance";

const userApiToUser = (apiUser: IApiUser): User => {
    return {
        id: apiUser.id,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        name: apiUser.firstName + " " + apiUser.lastName,
        nick: apiUser.nick,
        icon: apiUser.avatarUrl,
        balance: apiUser.balance,
    };
};


export const usersApi = {

    /**
     * Fetches the current user's data from the API.
     *
     * @returns {Promise<User>} A promise that resolves to the current user's data.
     * @throws Will throw an error if the request fails.
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get("/api/user");
        const user = userApiToUser(response.data.data.user);
        return user;
    },  

    getUsers: async (): Promise<User[]> => {
        const response = await api.get("api/group");
        const apiUsers = response.data.data.members;
        const users = apiUsers.map(userApiToUser);
        return users;
    },
}

export default usersApi;
