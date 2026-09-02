import { ApiItem, ApiPrice } from '../schemas/api';

export const itemAdapter = {
    apiItemToItem(apiItem: ApiItem): Item {
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
            externalId: internalPrice.externalId ?? undefined,
            addedTime: apiItem.createdTime,
            timesPurchased: apiItem.timesPurchased,
            amountInStock: apiItem.stock,
        };
    },

    itemToApiItem(item: Item): ApiItem {
        const apiItem: ApiItem = {
            id: Number(item.id),
            displayName: item.name,
            icon: item.icon || "",
            visible: item.available,
            favorite: item.favorite,
            prices: [
                {
                    displayName: "Internt",
                    price: item.internalPrice.toString(),
                    externalId: item.externalId,
                },
            ],
            createdTime: item.addedTime,
            timesPurchased: item.timesPurchased,
            stock: item.amountInStock,
        };
        return apiItem;
    },
    
    partialItemToPartialApiItem(partialItem: Partial<Item>): Partial<ApiItem> {
        const apiItem: Partial<ApiItem> = {};
        if (partialItem.icon !== undefined) apiItem.icon = partialItem.icon;
        if (partialItem.name !== undefined) apiItem.displayName = partialItem.name;
        if (partialItem.available !== undefined) apiItem.visible = partialItem.available;
        if (partialItem.favorite !== undefined) apiItem.favorite = partialItem.favorite;
        if (partialItem.internalPrice !== undefined || partialItem.externalId !== undefined) {
            const price: Partial<ApiPrice> = {
                displayName: "Internt",
            };
            if (partialItem.internalPrice !== undefined) {
                price.price = partialItem.internalPrice.toString();
            }
            if (partialItem.externalId !== undefined) {
                price.externalId = partialItem.externalId;
            }
            apiItem.prices = [price as ApiPrice];
        }

        return apiItem;
    }
}

export default itemAdapter;
