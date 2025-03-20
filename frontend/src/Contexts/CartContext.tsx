import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../Types';

interface OrderItemWithAmount extends Product {
    amount: number;
}

interface CartContextType {
    items: OrderItemWithAmount[];
    total: number;
    addProduct: (item: Product) => void;
    decreaseProductAmount: (product: Product) => void;
    removeItem: (product: Product) => void;
    clearOrder: () => void;
    buyProducts: (arg0: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<OrderItemWithAmount[]>([]);
    const [ total, setTotal ] = useState<number>(0);

    const addProduct = (item: Product) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                return prevItems.map(i => 
                    i.id === item.id ? { ...i, amount: i.amount + 1 } : i
                );
            } else {
                return [...prevItems, { ...item, amount: 1 }];
            }
        });
    };

    const decreaseProductAmount = (product: Product) => {
        setItems((prevItems) => 
            prevItems
                .map(p => p.id === product.id ? { ...p, amount: p.amount - 1 } : p)
                .filter(p => p.amount > 0)
        );
    };

    const removeItem = (product: Product) => {
        setItems((prevItems) => prevItems.filter(item => item.id !== product.id));
    };

    const clearOrder = () => {
        setItems([]);
    };

    useEffect(() => {
        const newTotal = items.reduce((sum, item) => sum + item.price * item.amount, 0);
        setTotal(newTotal);
        console.log('Total:', newTotal);
    }, [items]);

    const buyProducts = (userid: number, comment?: string): boolean => {
        // Implement buying products


        console.log('Buying products for user with id:', userId);
        console.log('Comment:', comment);
        
        clearOrder();
        return true; //TODO: implement buying products
    }



    return (
        <CartContext.Provider value={{ items, addProduct, removeItem, decreaseProductAmount, clearOrder, buyProducts, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};