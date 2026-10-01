import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionsProvider, useTransactionsContext } from '@/contexts/TransactionsContext';

const { mockFetch, mockRemove, mockNotify, mockGetUser } = vi.hoisted(() => ({
    mockFetch: vi.fn(),
    mockRemove: vi.fn(),
    mockNotify: vi.fn(),
    mockGetUser: vi.fn(),
}));

vi.mock('@/api/transactionApi', () => ({
    default: {
        fetchTransactions: (...args: unknown[]) => mockFetch(...args),
        removeTransaction: (...args: unknown[]) => mockRemove(...args),
    },
}));

vi.mock('@/contexts/UsersContext', () => ({
    default: () => ({ isLoadingUsers: false, getUserFromUserId: mockGetUser }),
    useUsersContext: () => ({ isLoadingUsers: false, getUserFromUserId: mockGetUser }),
}));

vi.mock('@/contexts/InventoryContext', () => ({
    default: () => ({ isLoadingInventory: false }),
    useInventoryContext: () => ({ isLoadingInventory: false }),
}));

vi.mock('@/contexts/AuthContext', () => ({
    default: () => ({ isAuthenticated: true, currentClient: null }),
    useAuthContext: () => ({ isAuthenticated: true, currentClient: null }),
}));

vi.mock('@/contexts/NotificationContext', () => ({
    default: () => ({ notify: mockNotify }),
    useNotificationContext: () => ({ notify: mockNotify }),
}));

vi.mock('@/contexts/TransactionRefreshContext', () => ({
    default: () => ({ refreshSignal: 0 }),
    useTransactionRefreshContext: () => ({ refreshSignal: 0 }),
}));

// Adjust the fields if your ITransaction needs more for the filters to work.
const makeTransaction = (overrides: Record<string, unknown> = {}) =>
    ({
        id: '1',
        type: 'purchase',
        createdTime: new Date('2024-01-01T12:00:00Z'),
        removed: false,
        comment: '',
        createdBy: { type: 'user', id: '1' },
        createdFor: '1',
        total: 10,
        items: [],
        ...overrides,
    }) as unknown as ITransaction;

const page = (transactions: ITransaction[]) => ({ transactions, nextUrl: null, prevUrl: null });

const ids = (list: ITransaction[]) => list.map(t => t.id);

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(r => { resolve = r; });
    return { promise, resolve };
};

describe('TransactionsContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGetUser.mockReturnValue({ id: '1', nick: 'ada', name: 'Ada Lovelace' });
    });

    describe('removeTransaction', () => {
        const setup = async () => {
            mockFetch.mockResolvedValue(page([makeTransaction({ id: '1' }), makeTransaction({ id: '2' })]));
            const hook = renderHook(() => useTransactionsContext(), { wrapper: TransactionsProvider });
            await waitFor(() => expect(hook.result.current.transactions).toHaveLength(2));
            return hook;
        };

        it('hides the transaction after a confirmed removal', async () => {
            const { result } = await setup();
            mockRemove.mockResolvedValueOnce(makeTransaction({ id: '1', removed: true }));

            let ok: boolean | undefined;
            await act(async () => { ok = await result.current.removeTransaction('1'); });

            expect(ok).toBe(true);
            expect(ids(result.current.filteredTransactions)).toEqual(['2']);
        });

        it('keeps the transaction when the request fails', async () => {
            const { result } = await setup();
            mockRemove.mockRejectedValueOnce(new Error('Network down'));

            let ok: boolean | undefined;
            await act(async () => { ok = await result.current.removeTransaction('1'); });

            expect(ok).toBe(false);
            expect(ids(result.current.filteredTransactions)).toEqual(['1', '2']);
            expect(mockNotify).toHaveBeenCalled();
        });
    });

    describe('fetching', () => {
        it('ignores a stale response that arrives after a newer one', async () => {
            const slow = deferred<ReturnType<typeof page>>();
            const fast = deferred<ReturnType<typeof page>>();
            mockFetch.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);

            const { result } = renderHook(() => useTransactionsContext(), { wrapper: TransactionsProvider });

            // Switching the user filter starts a second fetch while the first is pending.
            act(() => { result.current.setFilters(f => ({ ...f, userId: 'B' })); });

            await act(async () => { fast.resolve(page([makeTransaction({ id: 'B' })])); });
            await waitFor(() => expect(ids(result.current.transactions)).toEqual(['B']));

            // The older request finishes last. It must not overwrite the newer result.
            await act(async () => { slow.resolve(page([makeTransaction({ id: 'A' })])); });

            expect(ids(result.current.transactions)).toEqual(['B']);
            expect(result.current.isLoadingTransactions).toBe(false);
        });
    });

    describe('client-side filters', () => {
        const setup = async () => {
            mockFetch.mockResolvedValue(page([
                makeTransaction({ id: '1', comment: 'Kaffe' }),
                makeTransaction({ id: '2', comment: 'Te' }),
                makeTransaction({ id: '3', comment: 'Kaffe igen', removed: true }),
            ]));
            const hook = renderHook(() => useTransactionsContext(), { wrapper: TransactionsProvider });
            await waitFor(() => expect(hook.result.current.transactions).toHaveLength(3));
            return hook;
        };

        it('hides removed transactions by default and shows them on request', async () => {
            const { result } = await setup();
            expect(ids(result.current.filteredTransactions)).toEqual(['1', '2']);

            act(() => { result.current.setFilters(f => ({ ...f, showRemoved: true })); });
            expect(ids(result.current.filteredTransactions)).toEqual(['1', '2', '3']);
        });

        it('filters by search text without refetching', async () => {
            const { result } = await setup();
            const callsBefore = mockFetch.mock.calls.length;

            act(() => { result.current.setFilters(f => ({ ...f, searchQuery: 'kaffe' })); });

            expect(ids(result.current.filteredTransactions)).toEqual(['1']);
            expect(mockFetch.mock.calls.length).toBe(callsBefore);
        });

        it('filters by transaction type', async () => {
            const { result } = await setup();

            act(() => { result.current.setFilters(f => ({ ...f, transactionType: 'deposit' })); });

            expect(result.current.filteredTransactions).toEqual([]);
        });
    });
});