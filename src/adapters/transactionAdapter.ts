
export function adaptTransaction(
    apiTransaction: ApiTransaction,
    getUserFromUserId: (id: Id) => User,
    getProductById: (id: Id) => IItem
): ITransaction {
    if (apiTransaction.type === 'purchase') return adaptPurchase(apiTransaction as ApiPurchase, getUserFromUserId, getProductById);
    if (apiTransaction.type === 'deposit') return adaptDeposit(apiTransaction as ApiDeposit, getUserFromUserId);
    if (apiTransaction.type === 'stockUpdate') return adaptStockUpdate(apiTransaction as ApiStockUpdate, getUserFromUserId, getProductById);
    throw new Error(`Unknown ITransaction type: ${apiTransaction.type}`);
}

function adaptTime(apiTime: number): Date {
    return new Date(apiTime);
}


function adaptPurchase(
    apiPurchase: ApiPurchase,
    getUserFromUserId: (id: Id) => User,
    getProductById: (id: Id) => IItem
): Purchase {
    return {
        id: apiPurchase.id,
        type: 'purchase',
        createdBy: getUserFromUserId(apiPurchase.createdBy),
        createdFor: getUserFromUserId(apiPurchase.createdFor),
        items: apiPurchase.items.map(item => adaptPurchaseItem(item, getProductById)),
        createdTime: adaptTime(apiPurchase.createdTime),
        total: apiPurchase.items.reduce((acc, item) => acc + Number(item.purchasePrice.price) * item.quantity, 0),
        removed: apiPurchase.removed,
        comment: apiPurchase.comment || ''
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
        createdTime: adaptTime(apiDeposit.createdTime),
        removed: apiDeposit.removed,
        comment: apiDeposit.comment || ''
    };
}

function adaptStockUpdate(
    apiStockUpdate: ApiStockUpdate,
    getUserFromUserId: (id: Id) => User,
    getProductById: (id: Id) => IItem
): StockUpdate {
    const items = apiStockUpdate.items.map((apiItem: ApiTransactionItem): StockUpdateItem => {
        const item: IItem | undefined = getProductById(apiItem.id);
        if (!item) throw new Error(`Item with id ${apiItem.id} not found`);
        return {
            ...item,
            id: item.id,
            before: apiItem.before,
            after: apiItem.after
        };
    });
    return {
        id: apiStockUpdate.id,
        type: 'stockUpdate',
        createdBy: getUserFromUserId(apiStockUpdate.createdBy),
        items: items,
        createdTime: adaptTime(apiStockUpdate.createdTime),
        removed: apiStockUpdate.removed,
    };
}

function adaptPurchaseItem(
    apiItem: ApiPurchaseItem,
    getProductById: (id: Id) => IItem
): PurchasedItem {
    const item = getProductById(apiItem.item.id);
    if (!item) throw new Error(`Item with id ${apiItem.item.id} not found`);
    
    return {
        item: {
            id: item.id,
            displayName: item.name,
            icon: item.icon
        },
        quantity: apiItem.quantity,
        purchasePrice: apiItem.purchasePrice
    };
}
