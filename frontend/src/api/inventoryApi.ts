import api from "./axiosInstance";


/**
 * Fetches the inventory data from the API.
 *
 * @returns {Promise<ProductT[]>} A promise that resolves to an array of products.
 * @throws Will throw an error if the API request fails.
 */
export const getInventory = async (): Promise<IApiItem[]> => {
    const response = await api.get("/api/group/item");
    const items = response.data.data.items;
    return items;
};

/**
 * Makes an API call to add a new product to the inventory.
 *
 * @param displayName - The name of the product to be displayed.
 * @param prices - An array of price objects associated with the product.
 * @param icon - (Optional) A string representing the icon for the product.
 * @returns A promise that resolves to a boolean indicating whether the product was successfully added.
 */
export const addProduct = async (displayName: string, prices: Price[], icon?: string): Promise<boolean> => {
    const response = await api.post("api/group/item", {
        displayName: displayName,
        prices: prices,
        ...(icon && { icon }),
    });
    return response.status === 200;
};

/**
 * Updates a product with the specified updates.
 *
 * @param productId - The unique identifier of the product to update.
 * @param updates - A partial object containing the fields to update in the product.
 * @returns A promise that resolves to `true` if the update was successful (HTTP status 200),
 *          or `false` otherwise.
*/
export const updateProduct = async (productId: productId, updates: Partial<IApiItem>): Promise<boolean> => {
        const response = await api.patch(`api/group/item/${productId}`, updates);
        return response.status === 200;
};

/**
 * Deletes a product by its ID.
 *
 * @param id - The unique identifier of the product to be deleted.
 * @returns A promise that resolves to `true` if the product was successfully deleted (HTTP status 200),
 *          or `false` otherwise.
 *
 * @throws Will throw an error if the API request fails.
 */
export const deleteProduct = async (id: number): Promise<boolean> => {
    const response = await api.delete(`api/group/item/${id}`);
    return response.status === 200;
}
