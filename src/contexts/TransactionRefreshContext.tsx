import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

interface TransactionRefreshContextProps {
    /** Bumps every time something wants transactions re-fetched. Watch it in a useEffect dependency array. */
    refreshSignal: number;
    /** Call this after any mutation (deposit, stock refill, ...) that should be reflected in the transaction list. */
    triggerTransactionsRefresh: () => void;
}

const TransactionRefreshContext = createContext<TransactionRefreshContextProps | undefined>(undefined);

/**
 * Sits ABOVE UsersProvider, InventoryProvider and TransactionsProvider in the tree.
 *
 * Why this exists: TransactionsContext needs to read from UsersContext/InventoryContext
 * (their loading flags), so it must be nested inside them. But UsersContext/InventoryContext
 * also need to trigger a transactions refresh after a deposit/stock update — and a parent can
 * never consume a context provided by one of its own children. Rather than trying to reorder
 * the providers (which just flips which side breaks), both "directions" talk through this
 * shared ancestor instead: mutators call `triggerTransactionsRefresh`, and TransactionsContext
 * watches `refreshSignal` and re-fetches when it changes. No provider needs to know about the
 * others' internals.
 */
export const TransactionRefreshProvider = ({ children }: { children: ReactNode }) => {
    const [refreshSignal, setRefreshSignal] = useState(0);

    const triggerTransactionsRefresh = useCallback(() => {
        setRefreshSignal((prev) => prev + 1);
    }, []);

    return (
        <TransactionRefreshContext.Provider value={{ refreshSignal, triggerTransactionsRefresh }}>
            {children}
        </TransactionRefreshContext.Provider>
    );
};

export const useTransactionRefreshContext = (): TransactionRefreshContextProps => {
    const context = useContext(TransactionRefreshContext);
    if (!context) {
        throw new Error('useTransactionRefreshContext must be used within a TransactionRefreshProvider');
    }
    return context;
};

export default useTransactionRefreshContext;
