//  API Types
export interface IApiUser {
    id: string;
    firstName: string;
    lastName: string;
    nick: string;
    avatarUrl: string;
    balance: number;
}

export interface IApiGroup {
    id: string;
    prettyName: string;
    avatarUrl: string;
}

export interface IApiItem {
    id: number

    addedTime: number
    icon: string
    displayName: string
    prices: Price[]
    timesPurchased: number
    visible: boolean
    favorite: boolean
}

export interface IApiPrice {
    price: number
    displayName: string
}

// Frontend Types

export interface Transaction {
    id: number
    type: "purchase" | "deposit"
    createdBy: User
    createdFor: User
    createdTime: number
}

export interface Purchase extends Transaction {
    type: "purchase",
    items: PurchaseItem[]
}

export interface PurchaseItem {
    item: {
        id: number
        displayName: string
        icon: string
    }
    quantity: number
    purchasePrice: IApiPrice
}

export interface Deposit extends Transaction {
    type: "deposit",
    total: number
}

export interface Price {
    price: number;
    displayName: string;
}

export interface Product {
    id: number;

    name: string;
    icon: string;

    prices: Price[];
    price: number;

    amountInStock: number;

    available: boolean;
    favorite: boolean;
    
    addedTime: number;
    timesPurchased: number
}

export interface ProductInCart extends Product {
    quantity: number;
}

export interface Group {
    id: string;
    name: string;
    users: string[];
    products: Product[];
    icon: string;
}

export interface User {
    id: string;

    firstName: string
    lastName: string
    name: string;
    nick: string;

    icon: string;

    balance: number;
}

export interface Page {
    url: string;
    linkText: string;
    component: JSX.Element;
}