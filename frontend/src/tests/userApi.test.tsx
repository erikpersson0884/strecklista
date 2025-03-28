import api from "../api/axiosInstance";
import { getCurrentUser, getUsers, makeDeposit, makePurchase } from "../api/usersApi"; // Replace with actual file name
import { IApiUser, ProductInCart } from "../types/Types";

jest.mock("../api/axiosInstance", () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

describe("API functions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("getCurrentUser should fetch and transform user data", async () => {
        const mockApiUser: IApiUser = {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            nick: "JD",
            avatarUrl: "avatar.png",
            balance: 100,
        };

        (api.get as jest.Mock).mockResolvedValue({ data: { data: { user: mockApiUser } } });
        
        const user = await getCurrentUser();
        
        expect(api.get).toHaveBeenCalledWith("/api/user");
        expect(user).toEqual({
            id: "1",
            firstName: "John",
            lastName: "Doe",
            name: "John Doe",
            nick: "JD",
            icon: "avatar.png",
            balance: 100,
        });
    });

    test("getUsers should fetch and transform users data", async () => {
        const mockApiUsers: IApiUser[] = [
            { id: "1", firstName: "Alice", lastName: "Smith", nick: "Ali", avatarUrl: "alice.png", balance: 200 },
            { id: "2", firstName: "Bob", lastName: "Brown", nick: "Bobby", avatarUrl: "bob.png", balance: 150 },
        ];

        (api.get as jest.Mock).mockResolvedValue({ data: { data: { members: mockApiUsers } } });
        
        const users = await getUsers();
        
        expect(api.get).toHaveBeenCalledWith("api/group");
        expect(users).toEqual([
            { id: "1", firstName: "Alice", lastName: "Smith", name: "Alice Smith", nick: "Ali", icon: "alice.png", balance: 200 },
            { id: "2", firstName: "Bob", lastName: "Brown", name: "Bob Brown", nick: "Bobby", icon: "bob.png", balance: 150 },
        ]);
    });

    test("makeDeposit should post data and return new balance", async () => {
        (api.post as jest.Mock).mockResolvedValue({ data: { data: { balance: 250 } } });

        const newBalance = await makeDeposit("1", 50);
        
        expect(api.post).toHaveBeenCalledWith("/api/group/deposit", { userId: "1", total: 50 });
        expect(newBalance).toBe(250);
    });

    test("makePurchase should post data and return new balance", async () => {
        const mockProducts: ProductInCart[] = [
            { id: 101, quantity: 2, internalPrice: 10, name: "Product A", icon: "iconA.png", amountInStock: 100, available: true, favorite: false, addedTime: new Date().getTime(), timesPurchased: 0 },
            { id: 102, quantity: 1, internalPrice: 15, name: "Product B", icon: "iconB.png", amountInStock: 50, available: true, favorite: false, addedTime: new Date().getTime(), timesPurchased: 0 },
        ];

        (api.post as jest.Mock).mockResolvedValue({ data: { data: { balance: 180 } } });

        const newBalance = await makePurchase("1", mockProducts);
        
        expect(api.post).toHaveBeenCalledWith("/api/group/purchase", {
            userId: "1",
            items: [
                { id: 101, quantity: 2, purchasePrice: { displayName: "Internt", price: 10 } },
                { id: 102, quantity: 1, purchasePrice: { displayName: "Internt", price: 15 } },
            ],
        });
        expect(newBalance).toBe(180);
    });
});
