import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, ProductInCart } from '../Types';
import { makePurchase } from '../api/usersApi';


interface CartContextType {
    items: ProductInCart[];
    total: number;
    addProductToCart: (item: Product) => void;
    setProductQuantity: (productId: number, quantity: number) => void;
    decreaseProductQuantity: (Product: ProductInCart) => void;
    increaseProductQuantity: (Product: ProductInCart) => void;
    removeProductFromCart: (product: Product) => void;
    clearOrder: () => void;
    buyProducts: (arg0: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ items, setItems ] = useState<ProductInCart[]>([]);
    const [ total, setTotal ] = useState<number>(0);

    const addProductToCart = (item: Product) => {
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

    const decreaseProductQuantity = (Product: ProductInCart) => {
        setProductQuantity(Product.id, Product.quantity - 1);
    }

    const increaseProductQuantity = (Product: ProductInCart) => {
        setProductQuantity(Product.id, Product.quantity + 1);
    }


    const removeProductFromCart = (product: Product) => {
        setItems((prevItems) => prevItems.filter(item => item.id !== product.id));
    };

    const clearOrder = () => {
        setItems([]);
    };

    useEffect(() => {
        const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(newTotal);
    }, [items]);

    const buyProducts = async (userid: number): Promise<boolean> => { //TODO implement comment
        const success = await makePurchase(userid, items);
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