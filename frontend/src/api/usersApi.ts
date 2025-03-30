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



/**
 * Fetches the current user's data from the API.
 *
 * @returns {Promise<User>} A promise that resolves to the current user's data.
 * @throws Will throw an error if the request fails.
 */
export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get("/api/user");
    const user = userApiToUser(response.data.data.user);
    return user;
};  

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get("api/group");
    const apiUsers = response.data.data.members;
    const users = apiUsers.map(userApiToUser);
    return users;
};


export const makeDeposit = async (userId: UserId, amount: number): Promise<number> => {
    try {
        const response = await api.post("/api/group/deposit", { userId, total: amount });
        const newBalance: number = response.data.data.balance;
        return newBalance; // Return true if the request succeeds
    } catch (error) {
        console.error("Failed to make deposit:", error);
        throw error; // Re-throw the error to ensure the function does not return undefined
    }
}

export const makePurchase = async (userId: UserId, products: ProductInCart[]): Promise<number> => {
    try {
        const apiItems = products.map(productToApiItem);
        const response = await api.post("/api/group/purchase", { userId, items: apiItems });
        const newBalance: number = response.data.data.balance;
        return newBalance; // Return true if the request succeeds
    } catch (error) {
        console.error("Failed to make purchase:", error);
        throw error; // Re-throw the error to ensure the function does not return undefined
    }
}

interface ApiPurchaseItem {
    id: number;
    quantity: number;
    purchasePrice: Price;
}

const productToApiItem = (product: ProductInCart): ApiPurchaseItem => { // TODO count quantity correctly
    return {
        id: product.id,
        quantity: product.quantity,
        purchasePrice: {
            displayName: "Internt",
            price: product.internalPrice,
        }
    };
};