import React, { createContext, useState, useContext, ReactNode } from 'react';
import { fetchTransactions } from '../api/transactionsApi';
import { useUsersContext } from './UsersContext';

interface TransactionsContextProps {
    transactions: Transaction[];
    filteredTransactions: Transaction[];
    setFilteredTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    getNextTransactions: () => void;
    getPrevTransactions: () => void
    deleteTransaction: (id: number) => void;
}

const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = React.useState<Transaction[]>([]);
    const { getUserFromUserId, users } = useUsersContext();
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
            const response = await fetchTransactions(url);
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
        getTransactions();
    }, [users]);


    const deleteTransaction = (id: number) => {
        setTransactions((prevTransactions) => prevTransactions.filter(transaction => transaction.id !== id));
    };

    return (
        <TransactionsContext.Provider value={{ transactions, filteredTransactions, setFilteredTransactions, getNextTransactions, getPrevTransactions, deleteTransaction }}>
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
