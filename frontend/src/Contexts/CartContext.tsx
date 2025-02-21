import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../Types';
import { axiosInstance } from '../api/axiosInstance';

interface OrderItemWithAmount extends Product {
    amount: number;
}

interface CartContextType {
    items: OrderItemWithAmount[];
    addProduct: (item: Product) => void;
    decreaseProductAmount: (product: Product) => void;
    removeItem: (product: Product) => void;
    clearOrder: () => void;
    buyProducts: (arg0: string) => boolean;
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

    const buyProducts = (userId: string): boolean => {
        // Implement buying products

        try {
            axiosInstance.post('/api/purchases', { userId, products: items })
            .then(response => {
                console.log('Purchase successful:', response.data);
            })
            .catch(error => {
                console.error('Error purchasing products:', error);
                return false;
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            return false;
        }

        console.log('Buying products for user with id:', userId);
        
        clearOrder();
        return true; //TODO: implement buying products
    }

    return (
        <CartContext.Provider value={{ items, addProduct, removeItem, decreaseProductAmount, clearOrder, buyProducts }}>
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