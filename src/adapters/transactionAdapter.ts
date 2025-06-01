
export function adaptTransaction(
    apiTransaction: ApiTransaction,
    getUserFromUserId: (id: Id) => User,
    getProductById: (id: Id) => ProductT
): Transaction {
    if (apiTransaction.type === 'purchase') return adaptPurchase(apiTransaction as ApiPurchase, getUserFromUserId, getProductById);
    if (apiTransaction.type === 'deposit') return adaptDeposit(apiTransaction as ApiDeposit, getUserFromUserId);
    if (apiTransaction.type === 'stockUpdate') return adaptStockUpdate(apiTransaction as ApiStockUpdate, getUserFromUserId, getProductById);
    throw new Error(`Unknown transaction type: ${apiTransaction.type}`);
}

function adaptPurchase(
    apiPurchase: ApiPurchase,
    getUserFromUserId: (id: Id) => User,
    getProductById: (id: Id) => ProductT
): Purchase {
    return {
        id: apiPurchase.id,
        type: 'purchase',
        createdBy: getUserFromUserId(apiPurchase.createdBy),
        createdFor: getUserFromUserId(apiPurchase.createdFor),
        items: apiPurchase.items.map(item => adaptPurchaseItem(item, getProductById)),
        createdTime: apiPurchase.createdTime,
        total: apiPurchase.items.reduce((acc, item) => acc + Number(item.purchasePrice.price) * item.quantity, 0)
    };
}

function adaptDeposit(
    apiDeposit: ApiDeposit,
    getUserFromUserId: (id: Id) => User
): Deposit {
    return {
        id: apiDeposit.id,
        type: 'deposit',
        createdBy: getUserFromUserId(apiDeposit.createdBy),
        createdFor: getUserFromUserId(apiDeposit.createdFor),
        total: apiDeposit.total,
        createdTime: apiDeposit.createdTime,
    };
}

function adaptStockUpdate(
    apiStockUpdate: ApiStockUpdate,
    getUserFromUserId: (id: Id) => User,
    getProductById: (id: Id) => ProductT
): StockUpdate {
    const items = apiStockUpdate.items.map((item: ApiTransactionItem): StockUpdateItem => {
        const product: ProductT | undefined = getProductById(item.id);
        if (!product) throw new Error(`Product with id ${item.id} not found`);
        return {
            ...product,
            id: item.id,
            before: item.before,
            after: item.after
        };
    });
    return {
        id: apiStockUpdate.id,
        type: 'stockUpdate',
        createdBy: getUserFromUserId(apiStockUpdate.createdBy),
        items: items,
        createdTime: apiStockUpdate.createdTime
    };
}

function adaptPurchaseItem(
    apiItem: ApiPurchaseItem,
    getProductById: (id: Id) => ProductT
): PurchasedItem {
    const product = getProductById(apiItem.item.id);
    if (!product) throw new Error(`Product with id ${apiItem.item.id} not found`);
    
    return {
        item: {
            id: product.id,
            displayName: product.name,
            icon: product.icon
        },
        quantity: apiItem.quantity,
        purchasePrice: apiItem.purchasePrice
    };
}
