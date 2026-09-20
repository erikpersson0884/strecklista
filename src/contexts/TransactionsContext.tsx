import React, { createContext, useState, useContext, ReactNode } from 'react';
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
    hasNextPage: boolean;
    hasPrevPage: boolean;
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

    // Only `filters.userId` maps to a server-side query param (createdBy/createdFor).
    // Everything else here (search text, date range, type, showRemoved) is applied
    // client-side, below, against whatever page is already in memory. That's a real
    // limitation - searching only searches the currently loaded page, it doesn't
    // reach across pages - but it at least means typing in the search box no longer
    // triggers a network request on every keystroke.
    React.useEffect(() => {
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

        if (filters.searchQuery.trim()) {
            const searchString = filters.searchQuery.toLowerCase();
            filtered = filtered.filter((t: ITransaction) => {
                if (t.createdBy.type === 'user') {
                    const createdByUser: User = getUserFromUserId(t.createdBy.id);
                    if (createdByUser.nick.toLowerCase().includes(searchString) || createdByUser.name.toLowerCase().includes(searchString)) return true;
                }

                if (t.type === 'purchase' || t.type === 'deposit') {
                    const financialTransaction = t as Purchase | Deposit;
                    if (financialTransaction.total.toString().includes(searchString)) return true;

                    const createdForUser: User = getUserFromUserId(financialTransaction.createdFor);
                    if (createdForUser.nick.toLowerCase().includes(searchString) || createdForUser.name.toLowerCase().includes(searchString)) return true;
                }

                if (t.type === 'purchase') {
                    const purchase: Purchase = t as Purchase;
                    const purchasedItemNames: string[] = purchase.items.map(item => item.item.displayName.toLowerCase());
                    if (purchasedItemNames.some(name => name.includes(searchString))) return true;
                }

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

    const fetchTransactions = async (url?: string | null): Promise<boolean> => {
        setIsLoadingTransactions(true);
        try {
            const createdBy = filters.userId !== 'all' ? filters.userId : undefined;
            const createdFor = filters.userId !== 'all' ? filters.userId : undefined;
            const response = await transactionsApi.fetchTransactions(url, 20, 0, createdBy, createdFor);

            setTransactions(response.transactions);
            setNextUrl(response.nextUrl);
            setPrevUrl(response.prevUrl);

            // A call with no explicit url is always a "fresh" load - initial mount,
            // the userId filter changing, or a refresh signal firing - so the page
            // counter and prev/next buttons should reset back to page 1. Calls with
            // an explicit url are pagination itself (see getNext/PrevTransactions),
            // which manage the counter themselves.
            if (!url) settransactionsPageNumber(1);

            return true;
        } catch (error) {
            if (isAxiosError(error)) {
                const backendMessage = error.response?.data?.error?.message;
                notify("Fetching transactions failed: " + (backendMessage ?? error.message), 'error');
            }
            console.error(error);
            return false;
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    const getNextTransactions = async () => {
        if (!nextUrl) return;
        const success = await fetchTransactions(nextUrl);
        if (success) settransactionsPageNumber(prevPage => prevPage + 1);
    }

    const getPrevTransactions = async () => {
        if (!prevUrl) return;
        const success = await fetchTransactions(prevUrl);
        if (success) settransactionsPageNumber(prevPage => Math.max(prevPage - 1, 1));
    }

    // Handles the initial load, auth/loading becoming ready, a userId filter change,
    // and refreshSignal bumps (from UsersContext/InventoryContext after a deposit or
    // stock refill - see TransactionRefreshContext.tsx) all through one path, so
    // there's exactly one fetch per meaningful change instead of duplicated ones.
    React.useEffect(() => {
        const notInScope = !currentClient?.scope?.includes('transactions.read');
        if (isLoadingUsers || isLoadingInventory) return;
        if (isAuthenticated && !(currentClient && notInScope)) fetchTransactions();
    }, [isLoadingUsers, isAuthenticated, isLoadingInventory, currentClient, refreshSignal, filters.userId]);


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
            hasNextPage: !!nextUrl,
            hasPrevPage: !!prevUrl,
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