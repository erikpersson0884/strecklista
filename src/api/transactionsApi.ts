import api from "./axiosInstance";


const productToApiItem = (product: ProductInCart): ApiPurchaseRequestItem => {
    return {
        id: product.id,
        quantity: product.quantity,
        purchasePrice: {
            displayName: "Internt",
            price: product.internalPrice,
        }
    };
};

const transactionsApi = {
    fetchTransactions: async (url?: string | null, limit: number = 10, offset: number = 0): Promise<{apiTransactions: ApiTransaction[], nextUrl: string | null, prevUrl: string | null}> => {
        try {
            let response;
            if (url) {
                response = await api.get(url);
            } else {
                response = await api.get(`api/group/transaction`, {
                    params: { limit, offset },
                });
            }

            const apiTransactions: ApiTransaction[] = response.data.data.transactions;
            const nextUrl: string | null = response.data.data.next || null;
            const prevUrl: string | null = response.data.data.previous || null;
            return { apiTransactions, nextUrl, prevUrl };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to fetch purchases");
        }
    },

    makeDeposit: async (userId: UserId, amount: number, comment?: string): Promise<number> => {
        try {
            const response = await api.post("/api/group/deposit", { 
                userId, 
                total: amount,
                comment,
            });
            const newBalance: number = response.data.data.balance;
            return newBalance; // Return true if the request succeeds
        } catch (error) {
            console.error("Failed to make deposit:", error);
            throw error; // Re-throw the error to ensure the function does not return undefined
        }
    },

    makePurchase: async (userId: UserId, products: ProductInCart[], comment?: string): Promise<number> => {
        try {
            const apiItems = products.map(productToApiItem);
            const response = await api.post("/api/group/purchase", { 
                userId, 
                items: apiItems,
                comment,
            });
            const newBalance: number = response.data.data.balance;
            return newBalance; // Return true if the request succeeds
        } catch (error) {
            console.error("Failed to make purchase:", error);
            throw error; // Re-throw the error to ensure the function does not return undefined
        }
    },

    deleteTransaction: async (id: Id): Promise<boolean> => {
        try {
            const success = await api.delete(`api/group/transaction/${id}`);
            return success.status === 204;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to delete transaction");
        }
    }
};

export default transactionsApi;
