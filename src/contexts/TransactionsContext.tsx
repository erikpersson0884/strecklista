import React, { createContext, useState, useContext, ReactNode } from 'react';
import transactionsApi from '../api/transactionsApi';
import { useUsersContext } from './UsersContext';

interface TransactionsContextProps {
    isLoading: boolean;
    transactions: Transaction[];
    filteredTransactions: Transaction[];
    setFilteredTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    getNextTransactions: () => void;
    getPrevTransactions: () => void
    deleteTransaction: (id: number) => void;
}

const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = React.useState<Transaction[]>([]);
    const { getUserFromUserId, users, isLoading: loadingusers } = useUsersContext();
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);

    const apiTransactionToTransaction = (apiTransaction: any): Transaction => {
        const newTransaction: Transaction = apiTransaction;
        apiTransaction.createdBy = getUserFromUserId(apiTransaction.createdBy);
        apiTransaction.createdFor = getUserFromUserId(apiTransaction.createdFor);
        return newTransaction;
    };

    const getTransactions = async (url?: string | null) => {
        try {
            const response = await transactionsApi.fetchTransactions(url);
            setNextUrl(response.nextUrl);
            setPrevUrl(response.prevUrl);
            const allTransactions = response.transactions
            allTransactions.forEach(apiTransactionToTransaction);
            setTransactions(allTransactions);
        } catch (error) {
            console.error(error);
        }
    };

    const getNextTransactions = async () => {
        getTransactions(nextUrl);
    }

    const getPrevTransactions = async () => {
        getTransactions(prevUrl);
    }


    React.useEffect(() => {
        if (loadingusers) return;
        getTransactions();
        setIsLoading(false);
    }, [users]);


    const deleteTransaction = async (id: number) => {
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
            deleteTransaction 
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
