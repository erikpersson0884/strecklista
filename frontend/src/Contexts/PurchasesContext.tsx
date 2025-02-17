import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Purchase } from '../Types';


interface PurchasesContextProps {
    purchases: Purchase[];
    addPurchase: (purchase: Purchase) => void;
    getPurchasesForUser: (userId: string) => Purchase[];
}

const PurchasesContext = createContext<PurchasesContextProps | undefined>(undefined);

export const PurchasesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [purchases, setPurchases] = useState<Purchase[]>([
        {
            id: '1',
            items: [
                { name: 'beer', amount: 6, price: 10 },
                { name: 'cider', amount: 6, price: 10 }
            ],
            amount: 12,
            buyingUser:  {id:"231", name:"Erik", nick:"Göken", balance:193, imageUrl:"99832" },
            paygingUser: {id:"31", name:"Emma", nick:"Dino", balance:-591, imageUrl:"asdf983" },

            date: new Date('2023-01-01')
        },
        {
            id: '2',
            items: [
                { name: 'pizza', amount: 2, price: 40 },
                { name: 'beer', amount: 4, price: 10 }
            ],
            amount: 80,
            buyingUser: {id:"31", name:"Emma", nick:"Dino", balance:-591, imageUrl:"asdf983" },
            paygingUser: {id:"231", name:"Erik", nick:"Göken", balance:193, imageUrl:"99832" },
            date: new Date('2023-02-01')
        },
        {
            id: '24',
            items: [
                { name: 'pizza', amount: 8, price: 40 },
                { name: 'beer', amount: 4, price: 4 }
            ],
            amount: 80,
            buyingUser: {id:"31", name:"Emma", nick:"Dino", balance:-591, imageUrl:"asdf983" },
            paygingUser: {id:"231", name:"Erik", nick:"Göken", balance:193, imageUrl:"99832" },
            date: new Date('2023-02-01')
        },
        {
            id: '21',
            items: [
                { name: 'pizza', amount: 2, price: 14 },
                { name: 'beer', amount: 4, price: 10 }
            ],
            amount: 80,
            buyingUser: {id:"31", name:"Emma", nick:"Dino", balance:-591, imageUrl:"asdf983" },
            paygingUser: {id:"231", name:"Erik", nick:"Göken", balance:193, imageUrl:"99832" },
            date: new Date('2023-02-01')
        }
    ]);

    const addPurchase = (purchase: Purchase) => {
        setPurchases((prevPurchases) => [...prevPurchases, purchase]);
    };

    const getPurchasesForUser = (userId: string): Purchase[] => {
        return purchases.filter(purchase => purchase.paygingUser.id === userId);
    };

    return (
        <PurchasesContext.Provider value={{ purchases, addPurchase, getPurchasesForUser }}>
            {children}
        </PurchasesContext.Provider>
    );
};

export const usePurchasesContext = (): PurchasesContextProps => {
    const context = useContext(PurchasesContext);
    if (!context) {
        throw new Error('usePurchases must be used within a PurchasesProvider');
    }
    return context;
};
