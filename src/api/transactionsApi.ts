import api from "./axiosInstance";
import { apiTransaction } from "../schemas/api";
import transactionAdapter from "../adapters/transactionAdapter";

const transactionsApi = {
    /**
     * Fetch transactions from the API.
     *
     * @param {string | null} [url] - The URL to fetch transactions from. If not provided, the default endpoint will be used.   
     * @param {number} [limit=10] - The maximum number of transactions to fetch.
     * @param {number} [offset=0] - The number of transactions to skip before starting to collect the result set.
     * 
     * @returns {Promise<{
     *   transactions: ITransaction[], 
     *   nextUrl: string | null, 
     *   prevUrl: string | null
     * }>} A promise that resolves to an object containing the fetched transactions and pagination URLs.
     * 
     * @throws Will throw an error if the request fails.
     */
    fetchTransactions: async (url?: string | null, limit: number = 10, offset: number = 0)
    : Promise<{
        transactions: ITransaction[], 
        nextUrl: string | null, 
        prevUrl: string | null
    }> => {
        try {
            let response;
            if (url) {
                response = await api.get(url);
            } else {
                response = await api.get(`/group/transaction`, {
                    params: { limit, offset },
                });
            }

            const parsed = apiTransaction.array().safeParse(response.data.data.transactions);
            if (!parsed.success) {
                console.error("Failed to parse transactions:", parsed.error);
                throw new Error(`Failed to parse transactions: ${parsed.error}`);
            }
            const transactions: ITransaction[] = parsed.data.map(transaction => transactionAdapter.adaptTransaction(transaction));

            const nextUrl: string | null = response.data.data.next || null;
            const prevUrl: string | null = response.data.data.previous || null;
            return { transactions, nextUrl, prevUrl };
        } catch (error: any) {
            console.error(error.response?.data?.message || "Failed to fetch transactions");
            throw error;
        }
    },

    
    /**
     * Make a deposit to a user's balance.
     *
     * @param {UserId} userId - The ID of the user making the deposit.
     * @param {number} amount - The amount to deposit.
     *
     * @returns {Promise<number>} A promise that resolves to the users new balance.
     * @throws Will throw an error if the request fails.
     */
    makeDeposit: async (userId: UserId, amount: number, comment?: string): Promise<number> => {
        try {
            const response = await api.post("/group/deposit", { 
                userId: Number(userId), 
                total: amount,
                comment,
            });
            const newBalance: number = response.data.data.balance;
            return newBalance;
        } catch (error) {
            console.error("Failed to make deposit:", error);
            throw error; // Re-throw the error to ensure the function does not return undefined
        }
    },

    /**
     * Makes a purchase for a user.
     * @param {UserId} userId - The ID of the user making the purchase.
     * @param {ProductInCart[]} products - The products to be purchased.
     * @param {string} [comment] - An optional comment for the purchase.
     *
     * @returns {Promise<number>} A promise that resolves to the user's new balance.
     * @throws Will throw an error if the request fails.
     */
    makePurchase: async (userId: UserId, products: ProductInCart[], comment?: string): Promise<number> => {
        try {
            const apiItems = products.map(transactionAdapter.adaptProductToPurchaseItem);
            const response = await api.post("/group/purchase", { 
                userId: Number(userId), 
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

    /**
     * Remove a transaction by marking it as removed.
     * @param {Id} id - The ID of the transaction to be removed.
     * 
     * @returns {Promise<boolean>} A promise that resolves to true if the transaction was successfully marked as removed.
     */
    removeTransaction: async (id: Id): Promise<boolean> => {
        try {
            const success = await api.patch(`/group/transaction/${id}`, { removed: true });
            return success.status === 204 || success.status === 200; // Return true if the request succeeds
        } catch (error: any) {
            return false;
        }
    }
};

export default transactionsApi;
