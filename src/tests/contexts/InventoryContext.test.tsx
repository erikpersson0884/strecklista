import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryProvider, useInventoryContext } from '@/contexts/InventoryContext';

const {
    mockGetInventory, mockAddItem, mockUpdateItem, mockDeleteItem, mockRefillItem,
    mockNotify, mockTriggerRefresh, mockIsAuthenticated,
} = vi.hoisted(() => ({
    mockGetInventory: vi.fn(),
    mockAddItem: vi.fn(),
    mockUpdateItem: vi.fn(),
    mockDeleteItem: vi.fn(),
    mockRefillItem: vi.fn(),
    mockNotify: vi.fn(),
    mockTriggerRefresh: vi.fn(),
    mockIsAuthenticated: vi.fn(() => true),
}));

vi.mock('@/api/inventoryApi', () => ({
    default: {
        getInventory: (...a: unknown[]) => mockGetInventory(...a),
        addItem: (...a: unknown[]) => mockAddItem(...a),
        updateItem: (...a: unknown[]) => mockUpdateItem(...a),
        deleteItem: (...a: unknown[]) => mockDeleteItem(...a),
        refillItem: (...a: unknown[]) => mockRefillItem(...a),
    },
}));

vi.mock('@/contexts/AuthContext', () => ({
    default: () => ({ isAuthenticated: mockIsAuthenticated() }),
    useAuthContext: () => ({ isAuthenticated: mockIsAuthenticated() }),
}));

vi.mock('@/contexts/NotificationContext', () => ({
    default: () => ({ notify: mockNotify }),
    useNotificationContext: () => ({ notify: mockNotify }),
}));

vi.mock('@/contexts/TransactionRefreshContext', () => ({
    default: () => ({ triggerTransactionsRefresh: mockTriggerRefresh }),
    useTransactionRefreshContext: () => ({ triggerTransactionsRefresh: mockTriggerRefresh }),
}));

const kaffe = {
    id: '1',
    name: 'Kaffe',
    icon: 'coffee.png',
    internalPrice: 10,
    amountInStock: 5,
    available: true,
    favorite: false,
    addedTime: new Date('2024-01-01'),
    timesPurchased: 0,
    externalId: 'EXT-1',
} as unknown as Item;

const te = { ...kaffe, id: '2', name: 'Te', internalPrice: 5, externalId: 'EXT-2' } as unknown as Item;

const setup = async () => {
    const hook = renderHook(() => useInventoryContext(), { wrapper: InventoryProvider });
    await waitFor(() => {
        expect(hook.result.current.isLoadingInventory).toBe(false);
        expect(hook.result.current.items).toHaveLength(2);
    });
    return hook;
};

describe('InventoryContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockIsAuthenticated.mockReturnValue(true);
        mockGetInventory.mockResolvedValue([kaffe, te]);
    });

    describe('loading', () => {
        it('loads the inventory when authenticated', async () => {
            const { result } = await setup();
            expect(result.current.items).toEqual([kaffe, te]);
            expect(mockGetInventory).toHaveBeenCalledTimes(1);
        });

        it("doesn't fetch when not authenticated", async () => {
            mockIsAuthenticated.mockReturnValue(false);
            renderHook(() => useInventoryContext(), { wrapper: InventoryProvider });
            await act(async () => {});
            expect(mockGetInventory).not.toHaveBeenCalled();
        });

        it('notifies and stops loading when the fetch fails', async () => {
            mockGetInventory.mockRejectedValueOnce(new Error('boom'));
            const { result } = renderHook(() => useInventoryContext(), { wrapper: InventoryProvider });

            await waitFor(() => expect(result.current.isLoadingInventory).toBe(false));
            expect(result.current.items).toEqual([]);
            expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'error');
        });

        it('getItemById returns the item or throws for an unknown id', async () => {
            const { result } = await setup();
            expect(result.current.getItemById('2')).toEqual(te);
            expect(() => result.current.getItemById('nope')).toThrow('not found');
        });

        it('does not flip the loading flag during later refreshes', async () => {
            const seen: boolean[] = [];
            const { result } = renderHook(
                () => {
                    const ctx = useInventoryContext();
                    seen.push(ctx.isLoadingInventory);
                    return ctx;
                },
                { wrapper: InventoryProvider }
            );
            await waitFor(() => expect(result.current.items).toHaveLength(2));
            seen.length = 0;

            mockUpdateItem.mockResolvedValueOnce({ ...kaffe, favorite: true });
            await act(async () => { await result.current.toggleFavourite(kaffe); });
            await waitFor(() => expect(mockGetInventory).toHaveBeenCalledTimes(2));

            // Otherwise TransactionsContext would refetch and jump back to page 1.
            expect(seen).not.toContain(true);
        });
    });

    describe('addItem', () => {
        it('sends the internal price, refreshes and returns the new item', async () => {
            const { result } = await setup();
            mockAddItem.mockResolvedValueOnce(kaffe);

            let added: Item | null = null;
            await act(async () => { added = await result.current.addItem('Kaffe', 10, 'coffee.png'); });

            expect(mockAddItem).toHaveBeenCalledWith('Kaffe', [{ displayName: 'Internt', price: 10 }], 'coffee.png');
            expect(added).toEqual(kaffe);
            await waitFor(() => expect(mockGetInventory).toHaveBeenCalledTimes(2));
        });

        it('notifies and returns null when the API fails', async () => {
            const { result } = await setup();
            mockAddItem.mockRejectedValueOnce(new Error('boom'));

            let added: Item | null = kaffe;
            await act(async () => { added = await result.current.addItem('Kaffe', 10); });

            expect(added).toBeNull();
            expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'error');
        });
    });

    describe('updateItem', () => {
        it('notifies exactly once and returns null for an unknown id', async () => {
            const { result } = await setup();

            let updated: Item | null = kaffe;
            await act(async () => { updated = await result.current.updateItem('999', { name: 'X' }); });

            expect(updated).toBeNull();
            expect(mockUpdateItem).not.toHaveBeenCalled();
            expect(mockNotify).toHaveBeenCalledTimes(1);
            // Should mention the id that was asked for (the old bug printed "undefined").
            expect(mockNotify).toHaveBeenCalledWith(expect.stringContaining('999'), 'error');
        });

        it('rejects an external id already used by another item, with one notification', async () => {
            const { result } = await setup();

            let updated: Item | null = kaffe;
            await act(async () => { updated = await result.current.updateItem('1', { externalId: 'EXT-2' }); });

            expect(updated).toBeNull();
            expect(mockUpdateItem).not.toHaveBeenCalled();
            expect(mockNotify).toHaveBeenCalledTimes(1);
            expect(mockNotify).toHaveBeenCalledWith(expect.stringContaining('EXT-2'), 'error');
        });

        it("doesn't call the API when nothing changed", async () => {
            const { result } = await setup();

            let updated: Item | null = null;
            await act(async () => { updated = await result.current.updateItem('1', { name: 'Kaffe' }); });

            expect(updated).toEqual(kaffe);
            expect(mockUpdateItem).not.toHaveBeenCalled();
            expect(mockNotify).toHaveBeenCalledTimes(1);
            expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'info');
        });

        it('updates, refreshes and notifies success', async () => {
            const { result } = await setup();
            const changed = { ...kaffe, internalPrice: 12 } as Item;
            mockUpdateItem.mockResolvedValueOnce(changed);

            let updated: Item | null = null;
            await act(async () => { updated = await result.current.updateItem('1', { internalPrice: 12 }); });

            expect(mockUpdateItem).toHaveBeenCalledWith('1', { internalPrice: 12 });
            expect(updated).toEqual(changed);
            expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'success');
            await waitFor(() => expect(mockGetInventory).toHaveBeenCalledTimes(2));
        });

        it('shows a single error when the API call fails', async () => {
            const { result } = await setup();
            mockUpdateItem.mockRejectedValueOnce(new Error('boom'));

            let updated: Item | null = kaffe;
            await act(async () => { updated = await result.current.updateItem('1', { internalPrice: 12 }); });

            expect(updated).toBeNull();
            expect(mockNotify).toHaveBeenCalledTimes(1);
            expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'error');
        });
    });

    describe('toggleFavourite', () => {
        it('flips the favourite flag', async () => {
            const { result } = await setup();
            mockUpdateItem.mockResolvedValueOnce({ ...kaffe, favorite: true });

            await act(async () => { await result.current.toggleFavourite(kaffe); });

            expect(mockUpdateItem).toHaveBeenCalledWith('1', { favorite: true });
            expect(mockNotify).toHaveBeenCalledWith(expect.stringContaining('Kaffe'), 'success');
        });

        it('notifies and returns null on failure', async () => {
            const { result } = await setup();
            mockUpdateItem.mockRejectedValueOnce(new Error('boom'));

            let updated: Item | null = kaffe;
            await act(async () => { updated = await result.current.toggleFavourite(kaffe); });

            expect(updated).toBeNull();
            expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'error');
        });
    });

    describe('refillItem', () => {
        it('refills, refreshes inventory and transactions', async () => {
            const { result } = await setup();
            mockRefillItem.mockResolvedValueOnce({});

            let ok = false;
            await act(async () => { ok = await result.current.refillItem('1', 10); });

            expect(ok).toBe(true);
            expect(mockRefillItem).toHaveBeenCalledWith('1', 10);
            expect(mockGetInventory).toHaveBeenCalledTimes(2);
            expect(mockTriggerRefresh).toHaveBeenCalledTimes(1);
        });

        it("returns false and doesn't call the API for an unknown item", async () => {
            const { result } = await setup();

            let ok = true;
            await act(async () => { ok = await result.current.refillItem('999', 10); });

            expect(ok).toBe(false);
            expect(mockRefillItem).not.toHaveBeenCalled();
            expect(mockNotify).toHaveBeenCalledWith(expect.any(String), 'error');
        });

        it("doesn't refresh transactions when the API fails", async () => {
            const { result } = await setup();
            mockRefillItem.mockRejectedValueOnce(new Error('boom'));

            let ok = true;
            await act(async () => { ok = await result.current.refillItem('1', 10); });

            expect(ok).toBe(false);
            expect(mockTriggerRefresh).not.toHaveBeenCalled();
        });
    });

    describe('deleteItem', () => {
        it('deletes and refreshes', async () => {
            const { result } = await setup();
            mockDeleteItem.mockResolvedValueOnce(undefined);

            let ok = false;
            await act(async () => { ok = await result.current.deleteItem('1'); });

            expect(ok).toBe(true);
            expect(mockDeleteItem).toHaveBeenCalledWith('1');
            await waitFor(() => expect(mockGetInventory).toHaveBeenCalledTimes(2));
        });

        it("returns false and doesn't call the API for an unknown item", async () => {
            const { result } = await setup();

            let ok = true;
            await act(async () => { ok = await result.current.deleteItem('999'); });

            expect(ok).toBe(false);
            expect(mockDeleteItem).not.toHaveBeenCalled();
        });
    });
});