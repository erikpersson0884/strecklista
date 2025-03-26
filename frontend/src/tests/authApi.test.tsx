import { authenticate, login } from "../api/authApi";
import api from "../api/axiosInstance";  // Mock this

jest.mock("../api/axiosInstance"); // Mock Axios instance

describe("Auth API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("authenticate should return user data and token", async () => {
    const mockResponse = {
      data: { data: { token: "mockToken", user: { id: 1, name: "Test User" } } },
    };

    (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await authenticate();

    expect(api.get).toHaveBeenCalledWith("/authorize");
    expect(result).toEqual(mockResponse.data.data);
  });

  test("authenticate should throw an error on failure", async () => {
    (api.get as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Authentication failed" } },
    });

    await expect(authenticate()).rejects.toThrow("Authentication failed");
  });

  test("login should return token and user data", async () => {
    const mockResponse = {
      data: { access_token: "mockToken", user: { id: 2, name: "Another User" } },
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await login("testCode");

    expect(api.post).toHaveBeenCalledWith("/login?code=testCode");
    expect(result).toEqual({
      token: "mockToken",
      user: { id: 2, name: "Another User" },
    });
  });

  test("login should throw an error on failure", async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Login failed" } },
    });

    await expect(login("wrongCode")).rejects.toThrow("Login failed");
  });
});
