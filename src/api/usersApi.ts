import api from "./axiosInstance";
import { userAdapter, groupMemberAdapter } from "../adapters/userAdapter";
import { apiGroupUser, apiGroupMember } from '../schemas/api'; 
import { z } from "zod";

export const usersApi = {
    /**
     * Fetches the current user's data from the API.
     *
     * @returns {Promise<User>} A promise that resolves to the current user's data.
     * @throws Will throw an error if the request fails.
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get("/user");
        try {
            const parsed = apiGroupUser.safeParse(response.data.data);
            if (!parsed.success) {
                console.error("Zod: Unexpected /user response shape:", parsed.error.issues);
                throw new Error("Failed to parse user data");
            }
            const user: User = userAdapter(parsed.data);            
            return user;
        }
        catch (error) {
            console.error("Error adapting user data:", error);
            throw new Error("Failed to adapt user data");
        }
    },

    getUsers: async (): Promise<User[]> => {
        const response = await api.get("/group");

        const parsed = z.array(apiGroupMember).safeParse(response.data.data.members);
        if (!parsed.success) {
            console.error("Zod: Unexpected /group members shape:", parsed.error.issues);
            throw new Error("Failed to parse group members");
        }

        return parsed.data.map(groupMemberAdapter);
    },

    getGroupInfo: async (): Promise<GroupInfo> => {
        const response = await api.get("/group");
        const groupInfo = response.data.data.group;
        return groupInfo;
    }
}

export default usersApi;
