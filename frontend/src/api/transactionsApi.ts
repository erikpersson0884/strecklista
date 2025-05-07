import api from "./axiosInstance";


interface FetchTransactionsResult {
    transactions: Transaction[];
    nextUrl: string | null;
    prevUrl: string | null;
}

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
