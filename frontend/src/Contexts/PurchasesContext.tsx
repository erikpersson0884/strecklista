import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Purchase } from '../Types';
import purchasesTestData from './purchasesTestData.json';


interface PurchasesContextProps {
    purchases: Purchase[];
    addPurchase: (purchase: Purchase) => void;
    getPurchasesForUser: (userId: string) => Purchase[];
    deletePurchase: (id: string) => void;
}

const PurchasesContext = createContext<PurchasesContextProps | undefined>(undefined);

export const PurchasesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    React.useEffect(() => {
        setPurchases(purchasesTestData.map(purchase => ({ ...purchase, date: new Date(purchase.date) })) as Purchase[]);

    }, []); //Todo: remove this line when you have a backend

    const addPurchase = (purchase: Purchase) => {
        setPurchases((prevPurchases) => [...prevPurchases, purchase]);
    };

    const getPurchasesForUser = (userId: string): Purchase[] => {
        return purchases.filter(purchase => purchase.paygingUser.id === userId);
    };

    const deletePurchase = (id: string) => {
        setPurchases((prevPurchases) => prevPurchases.filter(purchase => purchase.id !== id));
    };

    return (
        <PurchasesContext.Provider value={{ purchases, addPurchase, getPurchasesForUser, deletePurchase }}>
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
