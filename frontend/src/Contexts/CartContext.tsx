import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../Types';

interface OrderItemWithAmount extends Product {
    amount: number;
}

interface CartContextType {
    items: OrderItemWithAmount[];
    addProduct: (item: Product) => void;
    removeItem: (product: Product) => void;
    clearOrder: () => void;
    buyProducts: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<OrderItemWithAmount[]>([]);

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

        console.log(items);
    };

    const removeItem = (product: Product) => {
        setItems((prevItems) => prevItems.filter(item => item.id !== product.id));
    };

    const clearOrder = () => {
        setItems([]);
    };

    const buyProducts = (): boolean => {
        // Implement buying products
        return false;
    }

    return (
        <CartContext.Provider value={{ items, addProduct, removeItem, clearOrder, buyProducts }}>
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