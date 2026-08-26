import api from "./axiosInstance";
// import { z } from "zod";
import { ApiItem } from "../schemas/api";
import { productAdapter } from "../adapters/productAdapter";

const inventoryApi = {
    /**
     * Fetches the inventory data from the API.
     *
     * @returns {Promise<IItem[]>} A promise that resolves to an array of products.
     * @throws Will throw an error if the API request fails.
     */
    getInventory: async (): Promise<IItem[]> => {
        const response = await api.get("/group/item");

        
        // const parsed = z.array(apiItem).safeParse(response.data.data.items);
        // if (!parsed.success) {
        //     console.error("Zod: Unexpected /group/item response shape:", parsed.error.issues);
        //      throw new Error("Failed to parse inventory data"); 
        // }
        //TODO: Uncomment this line to throw an error when parsing fails when backend has fixed the issue sending object instead of date for createdTime in some items. This is a temporary workaround to allow the app to continue functioning while the backend issue is being resolved.

        // return parsed.data.map(productAdapter);
        return response.data.data.items.map(productAdapter);
    },

    /**
     * Makes an API call to add a new item to the inventory.
     *
     * @param displayName - The name of the item to be displayed.
     * @param prices - An array of price objects associated with the item.
     * @param icon - (Optional) A string representing the icon for the item.
     * @returns A promise that resolves to a boolean indicating whether the item was successfully added.
     */
    addProduct: async (displayName: string, prices: Price[], icon?: string): Promise<boolean> => {
        const response = await api.post("/group/item", {
            displayName: displayName,
            prices: prices,
            ...(icon && { icon }),
        });
        return response.status === 200 || response.status === 201;
    },

    /**
     * Updates a item with the specified updates.
     *
     * @param productId - The unique identifier of the item to update.
     * @param updates - A partial object containing the fields to update in the item.
     * @returns A promise that resolves to `true` if the update was successful (HTTP status 200),
     *          or `false` otherwise.
     */
    updateProduct: async (productId: ProductId, updates: Partial<ApiItem>): Promise<boolean> => {
        const response = await api.patch(`/group/item/${productId}`, updates);
        return response.status === 200;
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
    deleteProduct: async (id: Id): Promise<boolean> => {
        const response = await api.delete(`/group/item/${id}`);
        return response.status === 200;
    },

    refillProduct: async (id: Id, amount: number): Promise<boolean> => {
        const body = {
            items: [
                {
                    id: Number(id),
                    quantity: amount
                }
            ]
        }
        const response = await api.post(`/group/stock`, body);
        return response.status === 200 || response.status === 201;
    },

    setProductQuntity: async (id: Id, amount: number): Promise<boolean> => {
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
        return response.status === 200;
    }
};

export default inventoryApi;
