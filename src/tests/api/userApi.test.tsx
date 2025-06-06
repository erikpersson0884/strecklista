import api from "../../api/axiosInstance";
import userApi from "../../api/usersApi";


jest.mock("../../api/axiosInstance", () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

describe("API functions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("getCurrentUser should fetch and transform user data", async () => {
        const mockApiUser: ApiUser = {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            nick: "JD",
            avatarUrl: "avatar.png",
            balance: 100,
        };

        (api.get as jest.Mock).mockResolvedValue({ data: { data: { user: mockApiUser } } });
        
        const user = await userApi.getCurrentUser();
        
        expect(api.get).toHaveBeenCalledWith("/api/user");
        expect(user).toEqual({
            id: 1,
            firstName: "John",
            lastName: "Doe",
            name: "John Doe",
            nick: "JD",
            icon: "avatar.png",
            balance: 100,
        });
    });

    test("getUsers should fetch and transform users data", async () => {
        const mockApiUsers: ApiUser[] = [
            { id: 1, firstName: "Alice", lastName: "Smith", nick: "Ali", avatarUrl: "alice.png", balance: 200 },
            { id: 2, firstName: "Bob", lastName: "Brown", nick: "Bobby", avatarUrl: "bob.png", balance: 150 },
        ];

        (api.get as jest.Mock).mockResolvedValue({ data: { data: { members: mockApiUsers } } });
        
        const users = await userApi.getUsers();
        
        expect(api.get).toHaveBeenCalledWith("api/group");
        expect(users).toEqual([
            { id: 1, firstName: "Alice", lastName: "Smith", name: "Alice Smith", nick: "Ali", icon: "alice.png", balance: 200 },
            { id: 2, firstName: "Bob", lastName: "Brown", name: "Bob Brown", nick: "Bobby", icon: "bob.png", balance: 150 },
        ]);
    });
});
