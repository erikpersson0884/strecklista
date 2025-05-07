import api from "../../api/axiosInstance";
import inventoryApi from "../../api/inventoryApi";


jest.mock("../../api/axiosInstance");

describe("Inventory API functions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("getInventory should fetch inventory data", async () => {
        const mockData = { data: { data: { items: [{ id: 1, name: "Test Item" }] } } };
        (api.get as jest.Mock).mockResolvedValue(mockData);

        const result = await inventoryApi.getInventory();
        expect(api.get).toHaveBeenCalledWith("/api/group/item");
        expect(result).toEqual(mockData.data.data.items);
    });

    test("addProduct should make a POST request and return true on success", async () => {
        (api.post as jest.Mock).mockResolvedValue({ status: 200 });
        const result = await inventoryApi.addProduct("Test Product", [{ price: 100, displayName: "Default Price" }], "icon.png");

        expect(api.post).toHaveBeenCalledWith("api/group/item", {
            displayName: "Test Product",
            prices: [{ 
                displayName: "Default Price",
                price: 100 
            }],
            icon: "icon.png",
        });
        expect(result).toBe(true);
    });

    test("updateProduct should make a PATCH request and return true on success", async () => {
        (api.patch as jest.Mock).mockResolvedValue({ status: 200 });
        const update = { displayName: "Updated Name" };
        const result = await inventoryApi.updateProduct(1, update);

        expect(api.patch).toHaveBeenCalledWith("api/group/item/1", update);
        expect(result).toBe(true);
    });

    test("deleteProduct should make a DELETE request and return true on success", async () => {
        (api.delete as jest.Mock).mockResolvedValue({ status: 200 });
        const result = await inventoryApi.deleteProduct(1);

        expect(api.delete).toHaveBeenCalledWith("api/group/item/1");
        expect(result).toBe(true);
    });

    test("deleteProduct should return false on failure", async () => {
        (api.delete as jest.Mock).mockResolvedValue({ status: 400 });
        const result = await inventoryApi.deleteProduct(1);

        expect(api.delete).toHaveBeenCalledWith("api/group/item/1");
        expect(result).toBe(false);
    });
});
