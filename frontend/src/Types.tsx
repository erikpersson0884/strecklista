

export interface Product {
    id: number;
    name: string;
    amountInStock: number;
    price: number;
    available: boolean;
    imageUrl: string;
}

export interface User {
    id: string;
    name: string;
    nick: string;
    balance: number;
    imageUrl: string;
}

export interface Purchase {
    id: string;
    items: PurchaseItem[];
    amount: number;
    date: Date;
    buyingUser: User;
    paygingUser: User;
}

interface PurchaseItem {
    name: string;
    amount: number;
    price: number;
}