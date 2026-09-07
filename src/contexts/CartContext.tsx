import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import transactionsApi from '@/api/transactionApi';
import { useTransactionsContext } from './TransactionsContext';
import useNotificationContext from './NotificationContext';

const MAX_COMMENT_LENGTH = 1000;

interface CartContextType {
    itemsInCart: ItemInCart[];
    numberOfItemsInCart: number;
    total: number;
    payingUser: User | null;
    setPayingUser: React.Dispatch<React.SetStateAction<User | null>>;

    addItemToCart: (item: Item) => void;
    setProductQuantity: (productid: Id, quantity: number) => void;
    decreaseProductQuantity: (Item: ItemInCart) => void;
    increaseProductQuantity: (Item: ItemInCart) => void;
    removeProductFromCart: (item: Item) => void;
    getProductQuantity: (productid: Id) => number;
    emptyCart: () => void;
    purchaseCart: (comment?: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { refreshTransactions } = useTransactionsContext();
    const { notify } = useNotificationContext();

    const [ itemsInCart, setItemsInCart ] = useState<ItemInCart[]>([]);
    const [ numberOfItemsInCart, setNumberOfItemsInCart ] = useState<number>(0);
    const [ total, setTotal ] = useState<number>(0);
    const [ payingUser, setPayingUser ] = useState<User | null>(null);

    const addItemToCart = (item: Item) => {
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
        setNumberOfItemsInCart(totalItems);
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

    const emptyCart = () => {
        setItemsInCart([]);
        notify('Korgen tömdes', 'info');
    };

    const purchaseCart = async (comment?: string): Promise<boolean> => {
        try {
        if (!payingUser) throw new Error("No paying user set");
        if (itemsInCart.length === 0) throw new Error("Cart is empty");
        if (comment && comment.length > MAX_COMMENT_LENGTH) throw new Error(`Kommentaren får inte vara längre än ${MAX_COMMENT_LENGTH} tecken`);
            transactionsApi.makePurchase(payingUser.id, itemsInCart, comment);
            emptyCart();
            refreshTransactions();
            setPayingUser(null);
            notify('Köp Genomfört', 'success');
            return true;
        }
        catch (error: any) {
            notify(error.message, 'error');
            return false
        }
    }

    useEffect(() => {
        const newTotal = itemsInCart.reduce((sum, item) => sum + item.internalPrice * item.quantity, 0);
        setTotal(newTotal);
    }, [itemsInCart]);

    return (
        <CartContext.Provider value={{ 
            numberOfItemsInCart, 
            itemsInCart, 
            payingUser,
            total,
            setPayingUser,
            addItemToCart, 
            removeProductFromCart, 
            setProductQuantity, 
            decreaseProductQuantity, 
            increaseProductQuantity, 
            emptyCart, 
            purchaseCart, 
            getProductQuantity,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default useCartContext;
