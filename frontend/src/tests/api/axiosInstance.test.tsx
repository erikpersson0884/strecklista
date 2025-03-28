import { api, setAuthToken } from "../api/axiosInstance";
import axios from "axios";


jest.mock("axios", () => ({
    create: jest.fn(() => ({
      defaults: { headers: { common: {} } },
    })),
  }));
  
  describe("setAuthToken", () => {
    let mockApi: any;
  
    beforeEach(() => {
      jest.clearAllMocks();
      mockApi = axios.create(); // Manually get the mocked instance
    });

  test("should set Authorization header when token is provided", async () => {
    const token = "mockToken";
    
    await setAuthToken(token);

    expect(api.defaults.headers.common["Authorization"]).toBe(`Bearer ${token}`);
  });

  test("should remove Authorization header when token is null", async () => {
    await setAuthToken(null);

    expect(api.defaults.headers.common["Authorization"]).toBeUndefined();
  });

  test("should initialize with token from localStorage if present", async () => {
    Storage.prototype.getItem = jest.fn(() => "storedToken");

    // Re-import the module to trigger initial token setup
    jest.resetModules();
    const { api: newApi } = await import("../api/axiosInstance");

    expect(newApi.defaults.headers.common["Authorization"]).toBe("Bearer storedToken");
  });
});
