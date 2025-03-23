import api from "./axiosInstance";
import { Product, Price, IApiItem } from "../Types";




const transformApiItemToProduct = (apiItem: IApiItem): Product => ({
    id: apiItem.id,
    name: apiItem.displayName,
    icon: apiItem.icon || "",
    available: apiItem.visible,
    favorite: apiItem.favorite,
    prices: apiItem.prices,
    price: apiItem.prices[0].price,
    addedTime: apiItem.addedTime,
    timesPurchased: apiItem.timesPurchased,

    amountInStock: 0, //TODO: set to actual value when api implementes stock tracking
});


export const getInventory = async (): Promise<Product[]> => {
    const response = await api.get("/api/group/item");
    const items = response.data.data.items.map(transformApiItemToProduct);
    return items;
};



export const addProduct = async (displayName: string, prices: Price[], icon?: string): Promise<boolean> => {
    const response = await api.post("api/group/item", {
        displayName: displayName,
        prices: prices,
        ...(icon && { icon }),
    });

    return response.status === 200;
};

export const updateProduct = async (productId: number, updates: Partial<IApiItem>): Promise<boolean> => {
    const response = await api.patch(`api/group/item/${productId}`, updates);
    return response.status === 200;
};


export const deleteProduct = async (id: number): Promise<boolean> => {
    const response = await api.delete(`api/group/item/${id}`);
    return response.status === 200;
}
