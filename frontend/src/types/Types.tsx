export {}; // Ensures the file is treated as a module and avoids conflicts.

declare global {
    // API Types
    interface IApiUser {
        id: string;
        firstName: string;
        lastName: string;
        nick: string;
        avatarUrl: string;
        balance: number;
    }

    interface IApiGroup {
        id: string;
        prettyName: string;
        avatarUrl: string;
    }

    interface IApiItem {
        id: number;
        addedTime: number;
        icon: string;
        displayName: string;
        prices: Price[];
        timesPurchased: number;
        visible: boolean;
        favorite: boolean;
    }

    interface IApiPrice {
        price: number;
        displayName: string;
    }

    // Frontend Types
    interface Transaction {
        id: number;
        type: "purchase" | "deposit";
        createdBy: User;
        createdFor: User;
        createdTime: number;
    }

    interface Purchase extends Transaction {
        type: "purchase";
        items: PurchaseItem[];
    }

    interface PurchaseItem {
        item: {
            id: number;
            displayName: string;
            icon: string;
        };
        quantity: number;
        purchasePrice: IApiPrice;
    }

    interface Deposit extends Transaction {
        type: "deposit";
        total: number;
    }

    interface Price {
        price: number;
        displayName: string;
    }

    interface ProductT {
        id: number;
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

    interface ProductInCart extends ProductT {
        quantity: number;
    }

    interface Group {
        id: string;
        name: string;
        users: string[];
        products: Product[];
        icon: string;
    }

    interface User {
        id: string;
        firstName: string;
        lastName: string;
        name: string;
        nick: string;
        icon: string;
        balance: number;
    }
}
