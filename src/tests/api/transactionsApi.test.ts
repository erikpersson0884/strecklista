import { describe, it, expect, vi, afterEach } from "vitest";
import api from "../../api/axiosInstance";
import transactionsApi from "../../api/transactionApi";

vi.mock("@/api/axiosInstance");

const mockedApi = api as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
};

// Full ItemInCart fixture used for makePurchase / makeDeposit style tests
const mockProduct: ItemInCart = {
    id: "1",
    name: "Test Item",
    icon: "test.png",
    internalPrice: 10,
    patetPrice: undefined,
    externalPrice: undefined,
    amountInStock: 50,
    available: true,
    favorite: false,
    addedTime: new Date(1620000000000),
    timesPurchased: 0,
    quantity: 2,
};

const mockProducts = [mockProduct];

// Raw API-shaped fixtures (as returned by the backend, before adapting)
const apiPurchaseFixture = {
    id: 1,
    type: "purchase",
    createdBy: { userId: 42 },
    createdFor: 100,
    items: [
        {
            item: { id: 5, displayName: "Kaffe", icon: "coffee.png" },
            quantity: 2,
            purchasePrice: { price: "10", displayName: "Internt" },
        },
    ],
    createdTime: "2024-01-01T00:00:00.000Z",
    removed: false,
    comment: "Test purchase",
};

const apiDepositFixture = {
    id: 2,
    type: "deposit",
    createdBy: { clientId: "client-1" },
    createdFor: 200,
    total: "50",
    createdTime: "2024-01-02T00:00:00.000Z",
    removed: false,
    comment: null,
};

describe("transactions", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("fetchTransactions", () => {
        it("fetches, validates and adapts transactions from the default endpoint", async () => {
            const mockData = {
                data: {
                    data: {
                        transactions: [apiPurchaseFixture, apiDepositFixture],
                        next: "/next",
                        previous: "/prev",
                    },
                },
            };
            mockedApi.get.mockResolvedValueOnce(mockData as any);

            const result = await transactionsApi.fetchTransactions(null, 5, 0);

            expect(mockedApi.get).toHaveBeenCalledWith("/group/transaction", {
                params: { limit: 5, offset: 0 },
            });

            expect(result.nextUrl).toBe("/next");
            expect(result.prevUrl).toBe("/prev");
            expect(result.transactions).toHaveLength(2);

            expect(result.transactions[0]).toMatchObject({
                id: "1",
                type: "purchase",
                createdBy: { type: "user", id: "42" },
                createdFor: "100",
                total: 20,
                removed: false,
                comment: "Test purchase",
            });

            expect(result.transactions[1]).toMatchObject({
                id: "2",
                type: "deposit",
                createdBy: { type: "client", id: "client-1" },
                createdFor: "200",
                total: 50,
                removed: false,
                comment: "",
            });
        });

        it("fetches transactions from a custom URL without adding params", async () => {
            const mockData = { data: { data: { transactions: [], next: null, previous: null } } };
            mockedApi.get.mockResolvedValueOnce(mockData as any);

            const result = await transactionsApi.fetchTransactions("/custom-url");

            expect(mockedApi.get).toHaveBeenCalledWith("/custom-url");
            expect(mockedApi.get).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ transactions: [], nextUrl: null, prevUrl: null });
        });

        it("throws when the transactions fail schema validation", async () => {
            const mockData = {
                data: { data: { transactions: [{ id: 1, type: "purchase" }], next: null, previous: null } },
            };
            mockedApi.get.mockResolvedValueOnce(mockData as any);

            await expect(transactionsApi.fetchTransactions()).rejects.toThrow(
                /Failed to parse transactions/
            );
        });

        it("propagates the error when the request fails", async () => {
            mockedApi.get.mockRejectedValueOnce(new Error("Network Error"));

            await expect(transactionsApi.fetchTransactions()).rejects.toThrow("Network Error");
        });
    });

    describe("makeDeposit", () => {
        it("makes a deposit successfully", async () => {
            const mockResponse = { data: { data: { balance: 150 } } };
            mockedApi.post.mockResolvedValueOnce(mockResponse as any);

            const result = await transactionsApi.makeDeposit("1111", 50, "Test deposit");

            expect(mockedApi.post).toHaveBeenCalledWith("/group/deposit", {
                userId: 1111,
                total: 50,
                comment: "Test deposit",
            });
            expect(result).toBe(150);
        });

        it("throws error when deposit fails", async () => {
            mockedApi.post.mockRejectedValueOnce(new Error("Deposit failed"));
            await expect(transactionsApi.makeDeposit("1111", 50)).rejects.toThrow("Deposit failed");
        });
    });

    describe("makePurchase", () => {
        it("makes a purchase successfully, sending the item's own name/price as the purchase price", async () => {
            const mockResponse = { data: { data: { balance: 200 } } };
            mockedApi.post.mockResolvedValueOnce(mockResponse as any);

            const result = await transactionsApi.makePurchase("1111", mockProducts, "Test purchase");

            expect(mockedApi.post).toHaveBeenCalledWith("/group/purchase", {
                userId: 1111,
                items: [
                    {
                        id: 1,
                        quantity: 2,
                        purchasePrice: { displayName: "Test Item", price: 10 },
                    },
                ],
                comment: "Test purchase",
            });
            expect(result).toBe(200);
        });

        it("throws error when purchase fails", async () => {
            mockedApi.post.mockRejectedValueOnce(new Error("Purchase failed"));
            await expect(
                transactionsApi.makePurchase("1111", mockProducts)
            ).rejects.toThrow("Purchase failed");
        });
    });

    describe("removeTransaction", () => {
        it("returns true on success (status 204)", async () => {
            mockedApi.patch.mockResolvedValueOnce({ status: 204 } as any);
            const result = await transactionsApi.removeTransaction("1");
            expect(mockedApi.patch).toHaveBeenCalledWith("/group/transaction/1", { removed: true });
            expect(result).toBe(true);
        });

        it("returns true on success (status 200)", async () => {
            mockedApi.patch.mockResolvedValueOnce({ status: 200 } as any);
            const result = await transactionsApi.removeTransaction("1");
            expect(result).toBe(true);
        });

        it("returns false on error", async () => {
            mockedApi.patch.mockRejectedValueOnce(new Error("Failed"));
            const result = await transactionsApi.removeTransaction("1");
            expect(result).toBe(false);
        });
    });
});
