import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import transactionsApi from '../api/transactionsApi';

interface CartContextType {
    items: ProductInCart[];
    numberOfProductsInCart: number;
    total: number;
    addProductToCart: (item: ProductT) => void;
    setProductQuantity: (productid: Id, quantity: number) => void;
    decreaseProductQuantity: (ProductT: ProductInCart) => void;
    increaseProductQuantity: (ProductT: ProductInCart) => void;
    removeProductFromCart: (product: ProductT) => void;
    getProductQuantity: (productid: Id) => number;
    clearOrder: () => void;
    buyProducts: (payinguserId: UserId, comment?: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ items, setItems ] = useState<ProductInCart[]>([]);
    const [ numberOfProductsInCart, setNumberOfProductsInCart ] = useState<number>(0);
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

    React.useEffect(() => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        setNumberOfProductsInCart(totalItems);
    }
    , [items]);

    const setProductQuantity = (productId: Id, quantity: number) => {
        if (quantity < 0) throw new Error("Quantity cannot be negative");
        setItems((prevItems) => {
            return prevItems.map(i => 
                i.id === productId ? { ...i, quantity } : i
            );
        });
    }

    const decreaseProductQuantity = (ProductT: ProductInCart) => {
        if (ProductT.quantity <= 1) {
            removeProductFromCart(ProductT);
            return;
        }
        setProductQuantity(ProductT.id, ProductT.quantity - 1);
    }

    const increaseProductQuantity = (ProductT: ProductInCart) => {
        setProductQuantity(ProductT.id, ProductT.quantity + 1);
    }

    const getProductQuantity = (productId: Id) => {
        const product = items.find(item => item.id === productId);
        return product ? product.quantity : 0;
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

    const buyProducts = async (payingUserid: UserId, comment?: string): Promise<boolean> => { //TODO implement comment
        const success = await transactionsApi.makePurchase(payingUserid, items, comment);
        if (success) {
            clearOrder();
            return true; 
        }
        else return false;
    }



    return (
        <CartContext.Provider value={{ 
            numberOfProductsInCart, 
            items, 
            addProductToCart, 
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