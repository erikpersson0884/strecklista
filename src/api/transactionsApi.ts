import api from "./axiosInstance";


interface FetchTransactionsResult {
    transactions: Transaction[];
    nextUrl: string | null;
    prevUrl: string | null;
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

const transactionsApi = {
    fetchTransactions: async (url?: string | null, limit: number = 5, offset: number = 0): Promise<FetchTransactionsResult> => {
        try {
            let response;
            if (url) {
                response = await api.get(url);
            } else {
                response = await api.get(`api/group/transaction`, {
                    params: { limit, offset },
                });
            }

            const transactions: Transaction[] = response.data.data.transactions;
            const nextUrl: string | null = response.data.data.next || null;
            const prevUrl: string | null = response.data.data.previous || null;
            return { transactions, nextUrl, prevUrl };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to fetch purchases");
        }
    },

    makeDeposit: async (userId: UserId, amount: number): Promise<number> => {
        try {
            const response = await api.post("/api/group/deposit", { userId, total: amount });
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

    deleteTransaction: async (id: number): Promise<boolean> => {
        try {
            const success = await api.delete(`api/group/transaction/${id}`);
            return success.status === 204;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to delete transaction");
        }
    }
};

export default transactionsApi;
