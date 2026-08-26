import { ApiItem, ApiPrice } from '../schemas/api';

export function productAdapter(apiItem: ApiItem): IItem {
    const internalPrice: ApiPrice | undefined = apiItem.prices.find(
        (price) => price.displayName === "Internt"
    );

    if (!internalPrice) {
        throw new Error(`Internal price for item "${apiItem.displayName}" (id: ${apiItem.id}) not found`);
    }

    return {
        id: apiItem.id.toString(),
        name: apiItem.displayName,
        icon: apiItem.icon || "",
        available: apiItem.visible,
        favorite: apiItem.favorite,
        internalPrice: Number(internalPrice.price),
        addedTime: apiItem.createdTime,
        timesPurchased: apiItem.timesPurchased,
        amountInStock: apiItem.stock,
    };
}