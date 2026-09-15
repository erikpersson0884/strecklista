import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import transactionsApi from '@/api/transactionApi';
import useUsersContext from './UsersContext';
import useInventoryContext from './InventoryContext';
import useAuthContext from './AuthContext';
import useNotificationContext from './NotificationContext';
import { isAxiosError } from "axios";
import { useTransactionRefreshContext } from './TransactionRefreshContext';


interface TransactionsContextProps {
    isLoadingTransactions: boolean;
    transactions: ITransaction[];
    filteredTransactions: ITransaction[];
    filters: TransactionFilters;
    setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
    resetFilters: () => void;
    getNextTransactions: () => void;
    getPrevTransactions: () => void;
    removeTransaction: (id: Id) => Promise<boolean>;
    refreshTransactions: () => void;
    transactionsPageNumber: number;
}

interface TransactionFilters {
    userId: string;
    startDate: string | null;
    endDate: string | null;
    showRemoved: boolean;
    searchQuery: string;
    transactionType: TransactionType | 'all';
}

const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isLoadingUsers, getUserFromUserId } = useUsersContext();
    const { isLoadingInventory } = useInventoryContext();
    const { isAuthenticated, currentClient } = useAuthContext();
    const { notify } = useNotificationContext();
    const { refreshSignal } = useTransactionRefreshContext();

    const [filteredTransactions, setFilteredTransactions] = useState<ITransaction[]>([]);
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);
    const [transactionsPageNumber, settransactionsPageNumber] = useState<number>(1);
    const [filters, setFilters] = useState<TransactionFilters>({
        userId: 'all',
        startDate: null,
        endDate: null,
        showRemoved: false,
        searchQuery: '',
        transactionType: 'all',
    });
    const resetFilters = () => {
        setFilters({
            userId: 'all',
            startDate: null,
            endDate: null,
            showRemoved: false,
            searchQuery: '',
            transactionType: 'all',
        });
    };

    useEffect(() => {
        let filtered: ITransaction[] = transactions;

        if (filters.startDate) {
            filtered = filtered.filter(
                (t) => t.createdTime >= new Date(filters.startDate!)
            );
        }

        if (filters.endDate) {
            filtered = filtered.filter(
                (t) => t.createdTime <= new Date(filters.endDate!)
            );
        }

        if (!filters.showRemoved) {
            filtered = filtered.filter((t) => !t.removed);
        }

        if (filters.transactionType !== 'all') {
            filtered = filtered.filter((t) => t.type === filters.transactionType);
        }

        if (filters.searchQuery.trim()) { // If any searchterm is provided, filter the transactions based on it
            const searchString = filters.searchQuery.toLowerCase();
            filtered = filtered.filter((t: ITransaction) => {
                // makes it so if i search 6 all 2026 transaction remain, it is unsure if this is preferable so the function is disabled for now
                // If the createdTime string matches the search, include it
                // if (t.createdTime.toISOString().slice(0, 16).toLowerCase().includes(searchString)) {
                //     return true; 
                // }

                if (t.createdBy.type === 'user') {
                    const createdByUser: User = getUserFromUserId(t.createdBy.id);
                    if (createdByUser.nick.toLowerCase().includes(searchString) || createdByUser.name.toLowerCase().includes(searchString)) return true;
                }

                // If it's a financial transaction, check createdFor's nick/name
                if (t.type === 'purchase' || t.type === 'deposit') {
                    const financialTransaction = t as Purchase | Deposit;
                    if (financialTransaction.total.toString().includes(searchString)) return true;

                    const createdForUser: User = getUserFromUserId(financialTransaction.createdFor);
                    if (createdForUser.nick.toLowerCase().includes(searchString) || createdForUser.name.toLowerCase().includes(searchString)) return true;
                }

                // If it's a purchase, check the purchased item names
                if (t.type === 'purchase') {
                    const purchase: Purchase = t as Purchase;
                    const purchasedItemNames: string[] = purchase.items.map(item => item.item.displayName.toLowerCase());
                    if (purchasedItemNames.some(name => name.includes(searchString))) return true;
                }

                // If it's a stockUpdate, check the inventory item names
                if (t.type === 'stockUpdate') {
                    const stockUpdate: StockUpdate = t as StockUpdate;
                    if (stockUpdate.items.some(item => String(item.after - item.before).includes(searchString))) return true;

                    const updatedItemNames: string[] = stockUpdate.items.map(item => item.name.toLowerCase());
                    if (updatedItemNames.some(name => name.includes(searchString))) return true;
                }

                if (t.comment && t.comment.toLowerCase().includes(searchString)) return true;

                return false;
            });
        }

        setFilteredTransactions(filtered);
    }, [transactions, filters]);


    useEffect(() => {
        if (filters.userId !== 'all') {
            fetchTransactions();
        }
    }, [filters]);

    const fetchTransactions = async (url?: string | null) => {
        setIsLoadingTransactions(true);
        try {
            const createdBy = filters.userId !== 'all' ? filters.userId : undefined;
            const createdFor = filters.userId !== 'all' ? filters.userId : undefined;
            const response = await transactionsApi.fetchTransactions(url, 30, 0, createdBy, createdFor);

            setTransactions(response.transactions);
            setNextUrl(response.nextUrl);
            setPrevUrl(response.prevUrl);
        } catch (error) {
            if (isAxiosError(error)) {
                const backendMessage = error.response?.data?.error?.message;
                notify("Fetching transactions failed: " + (backendMessage ?? error.message), 'error');
            }
            console.error(error);
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    const getNextTransactions = async () => {
        if (!nextUrl) throw new Error('No next URL available');
        fetchTransactions(nextUrl);
        settransactionsPageNumber(prevPage => prevPage + 1);
    }

    const getPrevTransactions = async () => {
        if (!prevUrl) throw new Error('No previous URL available');
        fetchTransactions(prevUrl);
        settransactionsPageNumber(prevPage => Math.max(prevPage - 1, 1));
    }


    React.useEffect(() => {
        const notInScope = !currentClient?.scope?.includes('transactions.read');
        if(isLoadingUsers || isLoadingInventory) return;
        if (isAuthenticated && !(currentClient && notInScope)) fetchTransactions();        
        // refreshSignal is bumped by UsersContext/InventoryContext after a deposit or stock
        // refill, since they can't call this context's own refreshTransactions() directly
        // (see TransactionRefreshContext.tsx for why).
    }, [isLoadingUsers, isAuthenticated, isLoadingInventory, currentClient, refreshSignal]);


    const removeTransaction = async (id: Id): Promise<boolean> => {
        try {
            await transactionsApi.removeTransaction(id);
            setTransactions((prevTransactions) => prevTransactions.filter((ITransaction) => ITransaction.id !== id));
            return true;
        } catch (error) {
            notify('Något gick fel, försök igen senare.');
            return false;
        }
    };

    const refreshTransactions = async () => {
        await fetchTransactions();
    }

    return (
        <TransactionsContext.Provider value={{ 
            isLoadingTransactions, 
            transactions, 
            filteredTransactions, 
            getNextTransactions, 
            getPrevTransactions, 
            removeTransaction,
            transactionsPageNumber,
            filters,
            setFilters,
            resetFilters,
            refreshTransactions
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

export default useTransactionsContext;
