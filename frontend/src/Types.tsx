

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
