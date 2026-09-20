import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import inventoryApi from '@/api/inventoryApi';

import { NotificationProvider } from '@/contexts/NotificationContext';
import { TransactionRefreshProvider } from '@/contexts/TransactionRefreshContext';
import { UsersProvider, useUsersContext } from '@/contexts/UsersContext';
import { InventoryProvider, useInventoryContext } from '@/contexts/InventoryContext';
import { TransactionsProvider, useTransactionsContext } from '@/contexts/TransactionsContext';

// Only the true edges of the system are mocked: auth state and the network APIs.
// UsersContext, InventoryContext, TransactionsContext and TransactionRefreshContext
// are all real, wired together exactly as they are in Providers.tsx.
vi.mock('@/contexts/AuthContext', () => ({
    default: () => ({ isAuthenticated: true }),
}));

vi.mock('@/api/userApi', () => ({
    default: { getUsers: vi.fn().mockResolvedValue([{ id: '99', firstName: 'Ada', lastName: 'Lovelace', name: 'Ada Lovelace', nick: 'ada', icon: '', balance: 100 }]) },
}));

vi.mock('@/api/inventoryApi', () => ({
    default: { getInventory: vi.fn().mockResolvedValue([]), refillItem: vi.fn() },
}));

const mockMakeDeposit = vi.fn();
const mockFetchTransactions = vi.fn();
vi.mock('@/api/transactionApi', () => ({
    default: {
        makeDeposit: (...args: unknown[]) => mockMakeDeposit(...args),
        fetchTransactions: (...args: unknown[]) => mockFetchTransactions(...args),
    },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider>
        <TransactionRefreshProvider>
            <UsersProvider>
                <InventoryProvider>
                    <TransactionsProvider>{children}</TransactionsProvider>
                </InventoryProvider>
            </UsersProvider>
        </TransactionRefreshProvider>
    </NotificationProvider>
);

function useAllContexts() {
    return {
        users: useUsersContext(),
        inventory: useInventoryContext(),
        transactions: useTransactionsContext(),
    };
}

describe('TransactionRefreshContext (integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetchTransactions.mockResolvedValue({ transactions: [], nextUrl: null, prevUrl: null });
    });

    it('re-fetches transactions once on mount', async () => {
        const { result } = renderHook(() => useAllContexts(), { wrapper });

        await waitFor(() => expect(result.current.users.isLoadingUsers).toBe(false));
        await waitFor(() => expect(mockFetchTransactions).toHaveBeenCalledTimes(1));
    });

    it('re-fetches transactions after UsersContext.addUserBalance succeeds', async () => {
        mockMakeDeposit.mockResolvedValueOnce(150);
        const { result } = renderHook(() => useAllContexts(), { wrapper });

        await waitFor(() => expect(result.current.users.isLoadingUsers).toBe(false));
        await waitFor(() => expect(mockFetchTransactions).toHaveBeenCalledTimes(1));

        await act(async () => {
            await result.current.users.addUserBalance('99', 50, 'Top up');
        });

        // The deposit itself doesn't call fetchTransactions directly - it goes through
        // the refresh signal, which TransactionsContext is watching.
        expect(mockMakeDeposit).toHaveBeenCalledWith('99', 50, 'Top up');
        await waitFor(() => expect(mockFetchTransactions).toHaveBeenCalledTimes(2));
    });

    it('re-fetches transactions after InventoryContext.refillItem succeeds', async () => {
        // Give the inventory one item so refillItem can find it.
        (inventoryApi.getInventory as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
            { id: '1', name: 'Kaffe', icon: '', internalPrice: 10, amountInStock: 5, available: true, favorite: false, addedTime: new Date(), timesPurchased: 0 },
        ]);
        (inventoryApi.refillItem as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useAllContexts(), { wrapper });

        await waitFor(() => expect(result.current.inventory.isLoadingInventory).toBe(false));
        await waitFor(() => expect(mockFetchTransactions).toHaveBeenCalledTimes(1));

        await act(async () => {
            await result.current.inventory.refillItem('1', 10);
        });

        await waitFor(() => expect(mockFetchTransactions).toHaveBeenCalledTimes(2));
    });
});
