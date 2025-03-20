import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_CREATE_ROOT_CONTAINERS } from "react-dom/client";


//  API Types
export interface IApiUser {
    id: IUserId;
    firstName: string;
    lastName: string;
    nick: string;
    avatarUrl: string;
    balance: number;
}

export interface IApiGroup {
    id: IGroupId;
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

interface IApiTransaction {
    id: number
    type: "purchase" | "deposit"
    createdBy: IUserId
    createdFor: IUserId
    createdTime: number
}

export interface IApiPurchase extends IApiTransaction {
    type: "purchase",
    items: IApiPurchaseItem[]
}

export interface IApiPurchaseItem {
    item: {
        id: number
        displayName: string
        icon: string
    }
    quantity: number
    purchasePrice: IApiPrice
}

export interface IApiDeposit extends IApiTransaction {
    type: "deposit",
    amount: number
}


// Frontend Types
export type IUserId = string;
export type IGroupId = string;

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

export interface Group {
    id: DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_CREATE_ROOT_CONTAINERS;
    name: string;
    users: string[];
    products: Product[];
    icon: string;
}

export interface User {
    id: number;

    firstName: string
    lastName: string
    name: string;
    nick: string;

    icon: string;

    balance: number;
}



export interface Purchase {
    id: number;

    purchaseTime: number;
    date: number;

    
    items: PurchaseItem[];
    amount: number;

    buyingUser: User;
    paygingUser: User;

    group: Group;
}

interface PurchaseItem {
    name: string;
    amount: number;
    price: number;
}
