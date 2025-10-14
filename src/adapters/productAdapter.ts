
export function productAdapter(apiItem: ApiItem): IProduct {
    const internalPrice: Price | undefined = apiItem.prices.find((price: Price) => price.displayName === "Internt");
    if (!internalPrice) {
        alert(`Internal price for an item was not found:\ndisplayName: ${apiItem.displayName}\nid: ${apiItem.id}`);
        throw new Error(`Internal price for item ${apiItem.displayName}, ${apiItem.id} not found`);
    }

    return {
        id: apiItem.id,
        name: apiItem.displayName,
        icon: apiItem.icon || "",
        available: apiItem.visible,
        favorite: apiItem.favorite,
        internalPrice: internalPrice.price,
        addedTime: apiItem.addedTime,
        timesPurchased: apiItem.timesPurchased,
        amountInStock: apiItem.stock,
    }
};
