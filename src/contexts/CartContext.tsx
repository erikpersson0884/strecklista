import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import transactionsApi from '../api/transactionsApi';

interface CartContextType {
    itemsInCart: ProductInCart[];
    numberOfProductsInCart: number;
    total: number;
    addIProductoCart: (item: IItem) => void;
    setProductQuantity: (productid: Id, quantity: number) => void;
    decreaseProductQuantity: (IItem: ProductInCart) => void;
    increaseProductQuantity: (IItem: ProductInCart) => void;
    removeProductFromCart: (item: IItem) => void;
    getProductQuantity: (productid: Id) => number;
    clearOrder: () => void;
    buyProducts: (payinguserId: UserId, comment?: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ itemsInCart, setItemsInCart ] = useState<ProductInCart[]>([]);
    const [ numberOfProductsInCart, setNumberOfProductsInCart ] = useState<number>(0);
    const [ total, setTotal ] = useState<number>(0);

    const addIProductoCart = (item: IItem) => {
        setItemsInCart((prevItems) => {
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

    React.useEffect(() => {
        const totalItems = itemsInCart.reduce((sum, item) => sum + item.quantity, 0);
        setNumberOfProductsInCart(totalItems);
    }
    , [itemsInCart]);

    const setProductQuantity = (productId: Id, quantity: number) => {
        if (quantity < 0) throw new Error("Quantity cannot be negative");
        setItemsInCart((prevItems) => {
            return prevItems.map(i => 
                i.id === productId ? { ...i, quantity } : i
            );
        });
    }

    const decreaseProductQuantity = (IItem: ProductInCart) => {
        if (IItem.quantity <= 1) {
            removeProductFromCart(IItem);
            return;
        }
        setProductQuantity(IItem.id, IItem.quantity - 1);
    }

    const increaseProductQuantity = (IItem: ProductInCart) => {
        setProductQuantity(IItem.id, IItem.quantity + 1);
    }

    const getProductQuantity = (productId: Id) => {
        const item = itemsInCart.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }


    const removeProductFromCart = (itemToRemove: IItem) => {
        setItemsInCart((prevItems) => prevItems.filter(item => item.id !== itemToRemove.id));
    };

    const clearOrder = () => {
        setItemsInCart([]);
    };

    useEffect(() => {
        const newTotal = itemsInCart.reduce((sum, item) => sum + item.internalPrice * item.quantity, 0);
        setTotal(newTotal);
    }, [itemsInCart]);

    const buyProducts = async (payingUserid: UserId, comment?: string): Promise<boolean> => { //TODO implement comment
        const success = await transactionsApi.makePurchase(payingUserid, itemsInCart, comment);
        if (success) {
            clearOrder();
            return true; 
        }
        else return false;
    }



    return (
        <CartContext.Provider value={{ 
            numberOfProductsInCart, 
            itemsInCart, 
            addIProductoCart, 
            removeProductFromCart, 
            setProductQuantity, 
            decreaseProductQuantity, 
            increaseProductQuantity, 
            clearOrder, 
            buyProducts, 
            getProductQuantity,
            total 
        }}>
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