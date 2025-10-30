import { describe, it, expect, vi, afterEach } from "vitest";
import transactionsApi from "../../api/transactionsApi";
import api from "../../api/axiosInstance";

vi.mock("../../api/axiosInstance");

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const mockProduct = {
    id: 1,
    name: "Test Item",
    icon: "test.png",
    internalPrice: 10,
    patetPrice: undefined,
    externalPrice: undefined,
    amountInStock: 50,
    available: true,
    favorite: false,
    addedTime: 1620000000000,
    timesPurchased: 0,
    quantity: 2,
};

const mockProducts = [mockProduct];


describe("transactionsApi", () => {
    afterEach(() => {
        vi.clearAllMocks();
});

    describe("fetchTransactions", () => {
        it("fetches transactions from default endpoint", async () => {
        const mockData = {
            data: {
                data: {
                    transactions: [{ id: 1 }, { id: 2 }],
                    next: "/next",
                    previous: "/prev",
                },
            },
        };
        mockedApi.get.mockResolvedValueOnce(mockData as any);

        const result = await transactionsApi.fetchTransactions(null, 5, 0);

        expect(mockedApi.get).toHaveBeenCalledWith("api/group/Transaction", {
                params: { limit: 5, offset: 0 },
        });
        expect(result).toEqual({
            apiTransactions: mockData.data.data.transactions,
            nextUrl: "/next",
            prevUrl: "/prev",
        });
        });

        it("fetches transactions from custom URL", async () => {
            const mockData = { data: { data: { transactions: [], next: null, previous: null } } };
            mockedApi.get.mockResolvedValueOnce(mockData as any);

            await transactionsApi.fetchTransactions("/custom-url");
            expect(mockedApi.get).toHaveBeenCalledWith("/custom-url");
        });

        it("throws error when request fails", async () => {
            mockedApi.get.mockRejectedValueOnce({
                response: { data: { message: "Server error" } },
            });

            await expect(transactionsApi.fetchTransactions()).rejects.toThrow("Server error");
        });
    });

    describe("makeDeposit", () => {
        it("makes a deposit successfully", async () => {
            const mockResponse = { data: { data: { balance: 150 } } };
            mockedApi.post.mockResolvedValueOnce(mockResponse as any);

            const result = await transactionsApi.makeDeposit(1111, 50, "Test deposit");

            expect(mockedApi.post).toHaveBeenCalledWith("/api/group/deposit", {
                userId: 1111,
                total: 50,
                comment: "Test deposit",
            });
                expect(result).toBe(150);
        });

        it("throws error when deposit fails", async () => {
            mockedApi.post.mockRejectedValueOnce(new Error("Deposit failed"));
            await expect(transactionsApi.makeDeposit(1111, 50)).rejects.toThrow("Deposit failed");
        });
    });

    describe("makePurchase", () => {
        it("makes a purchase successfully", async () => {
            const mockResponse = { data: { data: { balance: 200 } } };
            mockedApi.post.mockResolvedValueOnce(mockResponse as any);

            const result = await transactionsApi.makePurchase(1111, mockProducts, "Test purchase");

            expect(mockedApi.post).toHaveBeenCalledWith("/api/group/purchase", {
                userId: 1111,
                items: [
                {
                    id: 1,
                    quantity: 2,
                    purchasePrice: { displayName: "Internt", price: 10 },
                },
                ],
                comment: "Test purchase",
            });
            expect(result).toBe(200);
        });

        it("throws error when purchase fails", async () => {
            mockedApi.post.mockRejectedValueOnce(new Error("Purchase failed"));
            await expect(
                transactionsApi.makePurchase(1111, [mockProduct])
            ).rejects.toThrow("Purchase failed");
        });
    });

    describe("removeTransaction", () => {
        it("returns true on success (status 204)", async () => {
            mockedApi.patch.mockResolvedValueOnce({ status: 204 } as any);
            const result = await transactionsApi.removeTransaction(1);
            expect(mockedApi.patch).toHaveBeenCalledWith("api/group/Transaction/1", { removed: true });
            expect(result).toBe(true);
        });

        it("returns true on success (status 200)", async () => {
            mockedApi.patch.mockResolvedValueOnce({ status: 200 } as any);
            const result = await transactionsApi.removeTransaction(1);
            expect(result).toBe(true);
        });

        it("returns false on error", async () => {
            mockedApi.patch.mockRejectedValueOnce(new Error("Failed"));
            const result = await transactionsApi.removeTransaction(1);
            expect(result).toBe(false);
        });
    });
});
