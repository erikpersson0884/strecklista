import api from "./axiosInstance";
// import { z } from "zod";
import { ApiItem, apiItem, apiStockUpdate } from "../schemas/api";
import itemadapter from "../adapters/itemAdapter";
import transactionAdapter from "../adapters/transactionAdapter";

const inventoryApi = {
    /**
     * Fetches the inventory data from the API.
     *
     * @returns {Promise<Item[]>} A promise that resolves to an array of items.
     * @throws Will throw an error if the API request fails.
     */
    getInventory: async (): Promise<Item[]> => {
        const response = await api.get("/group/item");

        
        // const parsed = z.array(apiItem).safeParse(response.data.data.items);
        // if (!parsed.success) {
        //     console.error("Zod: Unexpected /group/item response shape:", parsed.error.issues);
        //      throw new Error("Failed to parse inventory data"); 
        // }
        //TODO: Uncomment this line to throw an error when parsing fails when backend has fixed the issue sending object instead of date for createdTime in some items. This is a temporary workaround to allow the app to continue functioning while the backend issue is being resolved.

        // return parsed.data.map(productAdapter);
        return response.data.data.items.map(itemadapter.apiItemToItem);
    },

    /**
     * Makes an API call to add a new item to the inventory.
     *
     * @param displayName - The name of the item to be displayed.
     * @param prices - An array of price objects associated with the item.
     * @param icon - (Optional) A string representing the icon for the item.
     * @returns A promise that resolves to a boolean indicating whether the item was successfully added.
     */
    addProduct: async (displayName: string, prices: Price[], icon?: string): Promise<Item> => {
        const response = await api.post("/group/item", {
            displayName: displayName,
            prices: prices,
            ...(icon && { icon }),
        });
         const parsed = apiItem.safeParse(response.data.data.item);
        if (!parsed.success) {
            console.error("Zod: Unexpected /group/item response shape:", parsed.error.issues);
            throw new Error("Failed to parse added item data");
        }
        return itemadapter.apiItemToItem(parsed.data);
    },

    /**
     * Updates a item with the specified updates.
     *
     * @param productId - The unique identifier of the item to update.
     * @param updates - A partial object containing the fields to update in the item.
     * @returns A promise that resolves to `true` if the update was successful (HTTP status 200),
     *          or `false` otherwise.
     */
    updateProduct: async (productId: ProductId, updates: Partial<ApiItem>): Promise<Item> => {
        const response = await api.patch(`/group/item/${productId}`, updates);
        const parsed = apiItem.safeParse(response.data.data.item);
        if (!parsed.success) {
            console.error("Zod: Unexpected /group/item response shape:", parsed.error.issues);
            throw new Error("Failed to parse updated item data");
        }
        return itemadapter.apiItemToItem(parsed.data);
    },

    /**
     * Deletes a item by its ID.
     *
     * @param id - The unique identifier of the item to be deleted.
     * @returns A promise that resolves to `true` if the item was successfully deleted (HTTP status 200),
     *          or `false` otherwise.
     *
     * @throws Will throw an error if the API request fails.
     */
    deleteProduct: async (id: Id): Promise<Item> => {
        const response = await api.delete(`/group/item/${id}`);
        const success = apiItem.safeParse(response.data.data.item);
        if (!success.success) {
            console.error("Zod: Unexpected /group/item response shape:", success.error.issues);
            throw new Error("Failed to parse deleted item data");
        }
        return itemadapter.apiItemToItem(success.data);
    },

    refillProduct: async (id: Id, amount: number): Promise<StockUpdate> => {
        const body = {
            items: [
                {
                    id: Number(id),
                    quantity: amount
                }
            ]
        }
        const response = await api.post(`/group/stock`, body);
        const parsed = apiStockUpdate.safeParse(response.data.data.transaction);
        if (!parsed.success) {
            console.error("Zod: Unexpected /group/stock response shape:", parsed.error.issues);
            throw new Error("Failed to parse stock refill response data");
        }
        return transactionAdapter.adaptStockUpdate(parsed.data);
    },

    setProductQuantity: async (id: Id, amount: number): Promise<StockUpdate> => {
        const body = {
            items: [
                {
                    id: id,
                    quantity: amount,
                    absolute: true
                }
            ]
        }
        const response = await api.post(`/group/stock`, body);
        const parsed = apiStockUpdate.safeParse(response.data.data.transaction);
        if (!parsed.success) {
            console.error("Zod: Unexpected /group/stock response shape:", parsed.error.issues);
            throw new Error("Failed to parse stock update response data");
        }
        return transactionAdapter.adaptStockUpdate(parsed.data);
    }
};

export default inventoryApi;
