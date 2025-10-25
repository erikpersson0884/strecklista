import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import transactionsApi from '../api/transactionsApi';
import { useUsersContext } from './UsersContext';
import { useInventory } from './InventoryContext';
import { adaptTransaction } from '../adapters/transactionAdapter';

interface TransactionsContextProps {
    isLoading: boolean;
    transactions: ITransaction[];
    filteredTransactions: ITransaction[];
    filters: TransactionFilters;
    setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
    getNextTransactions: () => void;
    getPrevTransactions: () => void;
    deleteTransaction: (id: Id) => Promise<boolean>;
    transactionsPageNumber: number;
}

interface TransactionFilters {
    userId: string;
    startDate: string | null;
    endDate: string | null;
    showRemoved: boolean;
}


const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isLoading: loadingusers, getUserFromUserId } = useUsersContext();
    const { getProductById } = useInventory();

    const [filteredTransactions, setFilteredTransactions] = useState<ITransaction[]>([]);
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [transactionsPageNumber, settransactionsPageNumber] = useState<number>(1);
    const [filters, setFilters] = useState<TransactionFilters>({
        userId: 'all',
        startDate: null,
        endDate: null,
        showRemoved: false,
    });

    useEffect(() => {
        let filtered: ITransaction[] = transactions;

        if (filters.userId !== 'all') {
            const id = Number(filters.userId);
            filtered = filtered.filter((t) => {
                if (t.type === 'purchase' || t.type === 'deposit')
                    return (t as FinancialTransaction).createdFor.id === id;
                else
                    return t.createdBy.id === id;
            });
        }

        if (filters.startDate) {
            filtered = filtered.filter(
                (t) => t.createdTime >= new Date(filters.startDate!).getTime()
            );
        }

        if (filters.endDate) {
            filtered = filtered.filter(
                (t) => t.createdTime <= new Date(filters.endDate!).getTime()
            );
        }

        if (!filters.showRemoved) {
            filtered = filtered.filter((t) => !t.removed);
        }

        setFilteredTransactions(filtered);
    }, [transactions, filters]);



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
            setTransactions((prevTransactions) => prevTransactions.filter((ITransaction) => ITransaction.id !== id));
            setFilteredTransactions((prevFilteredTransactions) => prevFilteredTransactions.filter((ITransaction) => ITransaction.id !== id));
        }
        return success;
    };

    return (
        <TransactionsContext.Provider value={{ 
            isLoading, 
            transactions, 
            filteredTransactions, 
            getNextTransactions, 
            getPrevTransactions, 
            deleteTransaction,
            transactionsPageNumber,
            filters,
            setFilters
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
