import api from "./axiosInstance";
import { Product } from "../Types";

interface AddProductProps {
    name: string;
    price: number;
    amountInStock: number;
    imageUrl?: string;
    available: boolean;
}

export interface ApiItem {
    id: number
    
    icon?: string
    displayName: string
    prices: any[]
    visible: boolean
    favorite: boolean
}

const transformApiItemToProduct = (item: ApiItem): Product => ({
    id: item.id.toString(), // Convert number ID to string
    name: item.displayName, // Map displayName -> name
    amountInStock: 0, // API does not provide stock, default to 0
    prices: item.prices, // Map prices
    price: item.prices.find((price: any) => price.displayName === "P.R.I.T.")?.price, // Map prices -> price where display_name is "intern"
    available: item.visible, // Map visible -> available
    imageUrl: item.icon || "", // Handle missing icon
    favorite: item.favorite
});

const transformProductToApiItem = (product: Product): ApiItem => ({
    id: Number(product.id),
    displayName: product.name,
    prices: product.prices,
    visible: product.available,
    icon: product.imageUrl || "",
    favorite: product.favorite
});


export const getInventory = async (): Promise<Product[]> => {
    const response = await api.get("/api/group/item");
    console.log(response.data.data.items);
    const items = response.data.data.items.map(transformApiItemToProduct);
    return items;
};



export const addProduct = async (product: AddProductProps): Promise<boolean> => {
    const response = await api.post("/group/item", {
        displayName: product.name,
        prices: [{ displayName: "Intern", price: product.price }],
        visible: product.available,
        icon: product.imageUrl || "",
    });

    return response.status === 200;
};

export const updateProduct = async (product: Product): Promise<boolean> => {
    console.log(product);
    const body = transformProductToApiItem(product);
    const response = await api.patch(`/group/item/${product.id}`, "test");

    return response.status === 200;
}