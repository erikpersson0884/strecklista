import { ApiTransaction, ApiPurchase, ApiDeposit, ApiStockUpdate, ApiPurchasedItem } from '@/schemas/api';


export const transactionAdapter = {
    adaptTransaction(apiTransaction: ApiTransaction): ITransaction {
        if (apiTransaction.type === 'purchase'){
            return this.adaptPurchase(apiTransaction as ApiPurchase);
        } 
        else if (apiTransaction.type === 'deposit') {
            return this.adaptDeposit(apiTransaction as ApiDeposit);
        }
        else if (apiTransaction.type === 'stockUpdate') {
            return this.adaptStockUpdate(apiTransaction as ApiStockUpdate);
        }
        
        throw new Error(`Unknown transaction type: ${apiTransaction}`);
    },

    adaptTime(apiTime: string): Date {
        return new Date(apiTime);
    },

    adaptCretedBy(apiCreatedBy: { userId?: number; clientId?: string }): { type: "user" | "client"; id: Id } {
        if (apiCreatedBy.userId !== undefined) {
            return {
                type: "user",
                id: apiCreatedBy.userId.toString()
            };
        } else if (apiCreatedBy.clientId !== undefined) {
            return {
                type: "client",
                id: apiCreatedBy.clientId
            };
        } else {
            throw new Error("Unknown createdBy format: " + apiCreatedBy);
        }
    },


    adaptPurchase(apiPurchase: ApiPurchase): Purchase {
        return {
            id: apiPurchase.id.toString(),
            type: 'purchase',
            createdBy: this.adaptCretedBy(apiPurchase.createdBy),
            createdFor: apiPurchase.createdFor.toString(),
            items: apiPurchase.items.map(item => this.apiPurchasedItemToPurchasedItem(item)),
            createdTime: apiPurchase.createdTime,
            total: apiPurchase.items.reduce((acc, item) => acc + Number(item.purchasePrice.price) * item.quantity, 0),
            removed: apiPurchase.removed,
            comment: apiPurchase.comment || ''
        };
    },

    adaptDeposit(apiDeposit: ApiDeposit): Deposit {
        return {
            id: apiDeposit.id.toString(),
            type: 'deposit',
            createdBy: this.adaptCretedBy(apiDeposit.createdBy),
            createdFor: apiDeposit.createdFor.toString(),
            total: Number(apiDeposit.total),
            createdTime: apiDeposit.createdTime,
            removed: apiDeposit.removed,
            comment: apiDeposit.comment || ''
        };
    },

    adaptStockUpdate(apiStockUpdate: ApiStockUpdate): StockUpdate {
        const items = apiStockUpdate.items.map((apiItem): StockUpdateItem => {
            return {
                before: apiItem.before,
                after: apiItem.after,
                name: '', //TODO: Implement logic for this when backend return name of the item
                id: apiItem.id.toString(),
            };
        });
        return {
            id: apiStockUpdate.id.toString(),
            type: 'stockUpdate',
            createdBy: this.adaptCretedBy(apiStockUpdate.createdBy),
            items: items,
            createdTime: apiStockUpdate.createdTime,
            removed: apiStockUpdate.removed,
        };
    },

    apiPurchasedItemToPurchasedItem(apiItem: ApiPurchasedItem): PurchasedItem {
        return {
            item: {
                id: apiItem.item.id != null
                    ? apiItem.item.id.toString()
                    : "no-id-was-provided...",
                displayName: apiItem.item.displayName,
                icon: apiItem.item.icon || "",
            },
            quantity: apiItem.quantity,
            purchasePrice: {
                price: Number(apiItem.purchasePrice.price), 
                displayName: apiItem.purchasePrice.displayName
            }
        };
    },

    ItemInCartToApiItems(item: ItemInCart) {
        return {
            id: Number(item.id),
            purchasePrice: {
                price: item.internalPrice,
                displayName: item.name
            },
            quantity: item.quantity,
        };
    },
}

export default transactionAdapter;
