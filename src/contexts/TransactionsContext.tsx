import React, { createContext, useState, useContext, ReactNode } from 'react';
import transactionsApi from '../api/transactionsApi';
import { useUsersContext } from './UsersContext';
import { useInventory } from './InventoryContext';
import { adaptTransaction } from '../adapters/transactionAdapter';

interface TransactionsContextProps {
    isLoading: boolean;
    transactions: Transaction[];
    filteredTransactions: Transaction[];
    setFilteredTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    getNextTransactions: () => void;
    getPrevTransactions: () => void
    deleteTransaction: (id: Id) => Promise<boolean>;
    transactionsPageNumber: number;
}

const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isLoading: loadingusers, getUserFromUserId } = useUsersContext();
    const { getProductById } = useInventory();

    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [transactionsPageNumber, settransactionsPageNumber] = useState<number>(1);

    const getTransactions = async (url?: string | null) => {
        try {
            const response = await transactionsApi.fetchTransactions(url, 30);
            setNextUrl(response.nextUrl);
            setPrevUrl(response.prevUrl);
            const adaptedTransactions = response.apiTransactions.map(
                apiTransaction => adaptTransaction(apiTransaction, getUserFromUserId, getProductById)
            );

            setTransactions(adaptedTransactions);
        } catch (error) {
            console.error(error);
        }
    };

    const getNextTransactions = async () => {
        if (!nextUrl) throw new Error('No next URL available');
        getTransactions(nextUrl);
        settransactionsPageNumber(prevPage => prevPage + 1);
    }

    const getPrevTransactions = async () => {
        if (!prevUrl) throw new Error('No previous URL available');
        getTransactions(prevUrl);
        settransactionsPageNumber(prevPage => Math.max(prevPage - 1, 1));
    }


    React.useEffect(() => {
        if (loadingusers) return;
        const fetchTransactions = async () => {
            await getTransactions();
            setIsLoading(false);
        };
        fetchTransactions();
    }, [loadingusers]);


    const deleteTransaction = async (id: Id): Promise<boolean> => {
        const success = await transactionsApi.deleteTransaction(id);
        if (success) {
            setTransactions((prevTransactions) => prevTransactions.filter((transaction) => transaction.id !== id));
            setFilteredTransactions((prevFilteredTransactions) => prevFilteredTransactions.filter((transaction) => transaction.id !== id));
        }
        return success;
    };

    return (
        <TransactionsContext.Provider value={{ 
            isLoading, 
            transactions, 
            filteredTransactions, 
            setFilteredTransactions, 
            getNextTransactions, 
            getPrevTransactions, 
            deleteTransaction,
            transactionsPageNumber,
        }}>
            {children}
        </TransactionsContext.Provider>
    );
};

export const useTransactionsContext = (): TransactionsContextProps => {
    const context = useContext(TransactionsContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionsProvider');
    }
    return context;
};
