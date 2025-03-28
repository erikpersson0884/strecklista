import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { makePurchase } from '../api/usersApi';


interface CartContextType {
    items: ProductInCart[];
    total: number;
    addProductToCart: (item: ProductT) => void;
    setProductQuantity: (productId: number, quantity: number) => void;
    decreaseProductQuantity: (ProductT: ProductInCart) => void;
    increaseProductQuantity: (ProductT: ProductInCart) => void;
    removeProductFromCart: (product: ProductT) => void;
    clearOrder: () => void;
    buyProducts: (payingUserId: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ items, setItems ] = useState<ProductInCart[]>([]);
    const [ total, setTotal ] = useState<number>(0);

    const addProductToCart = (item: ProductT) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                return prevItems.map(i => 
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                return [...prevItems, { ...item, quantity: 1 }];
            }
        });
    };

    const setProductQuantity = (productId: number, quantity: number) => {
        setItems((prevItems) => {
            return prevItems.map(i => 
                i.id === productId ? { ...i, quantity } : i
            );
        });
    }

    const decreaseProductQuantity = (ProductT: ProductInCart) => {
        setProductQuantity(ProductT.id, ProductT.quantity - 1);
    }

    const increaseProductQuantity = (ProductT: ProductInCart) => {
        setProductQuantity(ProductT.id, ProductT.quantity + 1);
    }


    const removeProductFromCart = (product: ProductT) => {
        setItems((prevItems) => prevItems.filter(item => item.id !== product.id));
    };

    const clearOrder = () => {
        setItems([]);
    };

    useEffect(() => {
        const newTotal = items.reduce((sum, item) => sum + item.internalPrice * item.quantity, 0);
        setTotal(newTotal);
    }, [items]);

    const buyProducts = async (payingUserid: string): Promise<boolean> => { //TODO implement comment
        const success = await makePurchase(payingUserid, items);
        if (success) {
            clearOrder();
            return true; 
        }
        else return false;
    }



    return (
        <CartContext.Provider value={{ items, addProductToCart, removeProductFromCart, setProductQuantity, decreaseProductQuantity, increaseProductQuantity, clearOrder, buyProducts, total }}>
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