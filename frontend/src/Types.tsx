
export interface Price {
    price: number;
    displayName: string;
}

export interface Product {
    id: string;

    name: string;
    imageUrl: string;

    prices: Price[];
    price: number;

    amountInStock: number;

    available: boolean;
    favorite: boolean;
}

export interface Group {
    id: string;
    name: string;
    users: string[];
    products: Product[];
    imageUrl: string;
}

export interface User {
    id: string;

    firstName: string
    lastName: string
    name: string;
    nick: string;

    imageUrl: string;

    balance: number;
}



export interface Purchase {
    id: string;

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
