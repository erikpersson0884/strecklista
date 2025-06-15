import auhtApi from "../../api/authApi";
import api from "../../api/axiosInstance";  // Mock this

jest.mock("../../api/axiosInstance"); // Mock Axios instance

describe("Auth API", () => {
    const mockToken = "mockToken";

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("login should return token and user data", async () => {
        const mockResponse = {
            data: { access_token: mockToken, user: { id: 2, name: "Another User" } },
        };

        (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await auhtApi.login("testCode");

        expect(api.post).toHaveBeenCalledWith("/login?code=testCode");
        expect(result).toEqual({
            token: mockToken,
            user: { id: 2, name: "Another User" },
        });
    });

    test("login should throw an error on failure", async () => {
        (api.post as jest.Mock).mockRejectedValueOnce({
            response: { data: { message: "Login failed" } },
        });

        await expect(auhtApi.login("wrongCode")).rejects.toThrow("Login failed");
    });
});
