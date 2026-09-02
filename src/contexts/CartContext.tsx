import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import transactionsApi from '../api/transactionsApi';
import { useTransactionsContext } from './TransactionsContext';
import { useUsersContext } from './UsersContext';


interface CartContextType {
    itemsInCart: ItemInCart[];
    numberOfProductsInCart: number;
    total: number;
    addIProductoCart: (item: Item) => void;
    setProductQuantity: (productid: Id, quantity: number) => void;
    decreaseProductQuantity: (Item: ItemInCart) => void;
    increaseProductQuantity: (Item: ItemInCart) => void;
    removeProductFromCart: (item: Item) => void;
    getProductQuantity: (productid: Id) => number;
    clearOrder: () => void;
    buyProducts: (payinguserId: UserId, comment?: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { refreshTransactions } = useTransactionsContext();
    const { setUserBalance } = useUsersContext();

    const [ itemsInCart, setItemsInCart ] = useState<ItemInCart[]>([]);
    const [ numberOfProductsInCart, setNumberOfProductsInCart ] = useState<number>(0);
    const [ total, setTotal ] = useState<number>(0);

    const addIProductoCart = (item: Item) => {
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

    const decreaseProductQuantity = (Item: ItemInCart) => {
        if (Item.quantity <= 1) {
            removeProductFromCart(Item);
            return;
        }
        setProductQuantity(Item.id, Item.quantity - 1);
    }

    const increaseProductQuantity = (Item: ItemInCart) => {
        setProductQuantity(Item.id, Item.quantity + 1);
    }

    const getProductQuantity = (productId: Id) => {
        const item = itemsInCart.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }


    const removeProductFromCart = (itemToRemove: Item) => {
        setItemsInCart((prevItems) => prevItems.filter(item => item.id !== itemToRemove.id));
    };

    const clearOrder = () => {
        setItemsInCart([]);
    };

    useEffect(() => {
        const newTotal = itemsInCart.reduce((sum, item) => sum + item.internalPrice * item.quantity, 0);
        setTotal(newTotal);
    }, [itemsInCart]);

    const buyProducts = async (payingUserid: UserId, comment?: string): Promise<boolean> => {
        try {
            const newBalance: number = await transactionsApi.makePurchase(payingUserid, itemsInCart, comment);
            clearOrder();
            refreshTransactions();
            setUserBalance(payingUserid, newBalance)
            return true;
        }
        catch (error: any) {
            console.error("Failed to buy items:", error);
            return false
        }
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