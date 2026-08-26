import { ApiGroupClient } from "../schemas/api";

export {}; // Ensures the file is treated as a module and avoids conflicts.
declare const __API_BASE__: string;

declare global {
    const __API_BASE__: string;

    // Frontend Types
    type Id = string;
    type UserId = Id;
    type GroupId = Id;
    type ProductId = Id;
    type ClientId = Id;
    type TransactionType = "purchase" | "deposit" | "stockUpdate";

    interface ITransaction {
        id: Id;
        type: TransactionType;
        createdBy: Id;
        createdTime: Date;
        removed: boolean;
    }

    interface FinancialTransaction  extends ITransaction {
        createdFor: Id;
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
        purchasePrice: {
            price: number;
            displayName: string;
        };
    }

    interface Deposit extends FinancialTransaction {
        type: "deposit";
    }

    interface StockUpdate extends ITransaction {
        type: "stockUpdate";
        items: StockUpdateItem[];
    }

    interface StockUpdateItem {
        id: Id;
        name: string
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
        addedTime: Date;
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

    interface GroupInfo {
        id: Id;
        gammaId: string;
        avatarUrl: string;
        prettyName: string;
    }

    type Client = ApiGroupClient
}
