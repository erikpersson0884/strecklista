export {}; // Ensures the file is treated as a module and avoids conflicts.
declare const __API_BASE__: string;

declare global {
    const __API_BASE__: string;
    
    // API Types
    type ApiId = number;
    

    interface ApiUser {
        id: ApiId;
        firstName: string;
        lastName: string;
        nick: string;
        avatarUrl: string;
        balance: number;
    }

    interface ApiGroup {
        id: ApiId;
        prettyName: string;
        avatarUrl: string;
    }

    interface ApiItem {
        id: ApiId;
        addedTime: number;
        icon: string;
        displayName: string;
        prices: Price[];
        timesPurchased: number;
        visible: boolean;
        favorite: boolean;
        stock: number;
    }

    interface ApiPrice {
        price: number;
        displayName: string;
    }

    interface ApiTransaction {
        id: ApiId;
        type: "purchase" | "deposit" | "stockUpdate";
        createdBy: ApiId;
        createdTime: number;
        removed: boolean;
    }

    interface ApiPurchase extends ApiTransaction {
        type: "purchase";
        createdFor: ApiId;
        items: ApiPurchaseItem[];
        comment?: string;
    }

    interface ApiPurchaseItem {
        item: {
            id: ApiId;
            displayName: string;
            icon?: string;
        };
        quantity: number;
        purchasePrice: ApiPrice;
    }

    interface ApiDeposit extends ApiTransaction {
        type: "deposit";
        createdFor: ApiId;
        total: number;
        comment?: string;
    }

    interface ApiStockUpdate extends ApiTransaction {
        type: "stockUpdate";
        items: ApiTransactionItem[];
    }

    interface ApiTransactionItem {
        id: ApiId;
        before: number;
        after: number;
    }

    interface ApiPurchaseRequestItem {
        id: ApiId;
        quantity: number;
        purchasePrice: ApiPrice;
    }


    // Frontend Types
    type Id = ApiId;
    type UserId = Id;
    type GroupId = Id;
    type ProductId = Id;
    type TransactionType = "purchase" | "deposit" | "stockUpdate";

    interface ITransaction {
        id: Id;
        type: TransactionType;
        createdBy: User;
        createdTime: Date;
        removed: boolean;
    }

    interface FinancialTransaction  extends ITransaction {
        createdFor: User;
        total: number;
        comment: string;
    }

    interface Purchase extends FinancialTransaction {
        type: "purchase";
        items: PurchasedItem[];
    }

    interface PurchasedItem {
        item: {
            id: Id;
            displayName: string;
            icon: string;
        };
        quantity: number;
        purchasePrice: ApiPrice;
    }

    interface Deposit extends FinancialTransaction {
        type: "deposit";
        createdFor: User;
    }

    interface StockUpdate extends ITransaction {
        type: "stockUpdate";
        items: StockUpdateItem[];
    }

    interface StockUpdateItem extends IItem {
        before: number;
        after: number;
    }

    interface Price {
        price: number;
        displayName: string;
    }

    interface IItem {
        id: Id;
        name: string;
        icon: string;
        internalPrice: number;
        patetPrice?: number;
        externalPrice?: number;
        amountInStock: number;
        available: boolean;
        favorite: boolean;
        addedTime: number;
        timesPurchased: number;
    }

    interface ProductInCart extends IItem {
        quantity: number;
    }

    interface Group {
        id: Id;
        name: string;
        users: string[];
        products: IItem[];
        icon: string;
    }

    interface User {
        id: Id;
        firstName: string;
        lastName: string;
        name: string;
        nick: string;
        icon: string;
        balance: number;
    }
}
