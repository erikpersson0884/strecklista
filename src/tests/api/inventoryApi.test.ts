import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axiosInstance';
import inventoryApi from '@/api/inventoryApi';

vi.mock('@/api/axiosInstance');

const mockedApi = api as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

const apiItemFixture = {
    id: 5,
    createdTime: '2024-01-01T00:00:00.000Z',
    icon: 'coffee.png',
    displayName: 'Kaffe',
    prices: [{ displayName: 'Internt', price: 10, externalId: 'EXT-1' }],
    stock: 5,
    timesPurchased: 3,
    visible: true,
};

const adaptedItem = {
    id: '5',
    name: 'Kaffe',
    icon: 'coffee.png',
    available: true,
    favorite: false, // the schema defaults it when the backend omits it
    internalPrice: 10,
    externalId: 'EXT-1',
    addedTime: new Date('2024-01-01T00:00:00.000Z'),
    timesPurchased: 3,
    amountInStock: 5,
};

const apiStockUpdateFixture = {
    id: 9,
    type: 'stockUpdate',
    createdBy: { userId: 1 },
    createdTime: '2024-01-02T00:00:00.000Z',
    removed: false,
    comment: null,
    items: [{ id: 1, itemId: 5, before: 5, after: 15, displayName: 'Kaffe' }],
};

describe('inventoryApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('getInventory', () => {
        it('fetches /group/item and adapts every item', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { items: [apiItemFixture] } } });

            const items = await inventoryApi.getInventory();

            expect(mockedApi.get).toHaveBeenCalledWith('/group/item');
            expect(items).toEqual([adaptedItem]);
        });

        it('returns an empty list when there are no items', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { items: [] } } });
            await expect(inventoryApi.getInventory()).resolves.toEqual([]);
        });

        it('accepts a string price and a missing icon', async () => {
            const item = { ...apiItemFixture, icon: undefined, prices: [{ displayName: 'Internt', price: '12.5' }] };
            mockedApi.get.mockResolvedValueOnce({ data: { data: { items: [item] } } });

            const [result] = await inventoryApi.getInventory();

            expect(result.internalPrice).toBe(12.5);
            expect(result.icon).toBe('');
            expect(result.externalId).toBeUndefined();
        });

        it('throws when an item has an unexpected shape', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { items: [{ id: 'x' }] } } });
            await expect(inventoryApi.getInventory()).rejects.toThrow('Unexpected /group/item response shape');
        });

        it('throws when an item has no internal price', async () => {
            const item = { ...apiItemFixture, prices: [{ displayName: 'Externt', price: 10 }] };
            mockedApi.get.mockResolvedValueOnce({ data: { data: { items: [item] } } });
            await expect(inventoryApi.getInventory()).rejects.toThrow('Internal price');
        });

        it('lets network errors propagate', async () => {
            const error = new Error('Network Error');
            mockedApi.get.mockRejectedValueOnce(error);
            await expect(inventoryApi.getInventory()).rejects.toBe(error);
        });
    });

    describe('addItem', () => {
        const prices = [{ displayName: 'Internt', price: 10 }] as unknown as Price[];

        it('posts the item and returns the adapted result', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { item: apiItemFixture } } });

            const item = await inventoryApi.addItem('Kaffe', prices, 'coffee.png');

            expect(mockedApi.post).toHaveBeenCalledWith('/group/item', {
                displayName: 'Kaffe',
                prices,
                icon: 'coffee.png',
            });
            expect(item).toEqual(adaptedItem);
        });

        it('leaves out the icon when none is given', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { item: apiItemFixture } } });

            await inventoryApi.addItem('Kaffe', prices);

            expect(mockedApi.post.mock.calls[0][1]).not.toHaveProperty('icon');
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { item: { nope: true } } } });
            await expect(inventoryApi.addItem('Kaffe', prices)).rejects.toThrow('Failed to parse added item data');
        });
    });

    describe('updateItem', () => {
        it('sends only the changed fields, translated to the API format', async () => {
            mockedApi.patch.mockResolvedValueOnce({ data: { data: { item: apiItemFixture } } });

            await inventoryApi.updateItem('5', { name: 'Te', available: false, internalPrice: 12 });

            expect(mockedApi.patch).toHaveBeenCalledWith('/group/item/5', {
                displayName: 'Te',
                visible: false,
                prices: [{ displayName: 'Internt', price: '12' }],
            });
        });

        it('returns the adapted updated item', async () => {
            mockedApi.patch.mockResolvedValueOnce({ data: { data: { item: apiItemFixture } } });
            await expect(inventoryApi.updateItem('5', { favorite: true })).resolves.toEqual(adaptedItem);
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.patch.mockResolvedValueOnce({ data: { data: { item: {} } } });
            await expect(inventoryApi.updateItem('5', { name: 'X' })).rejects.toThrow('Unexpected /group/item response shape');
        });
    });

    describe('deleteItem', () => {
        it('deletes the item', async () => {
            mockedApi.delete.mockResolvedValueOnce({ data: { data: { item: apiItemFixture } } });

            await expect(inventoryApi.deleteItem('5')).resolves.toBeUndefined();
            expect(mockedApi.delete).toHaveBeenCalledWith('/group/item/5');
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.delete.mockResolvedValueOnce({ data: { data: { item: {} } } });
            await expect(inventoryApi.deleteItem('5')).rejects.toThrow('Failed to parse deleted item data');
        });

        it('lets request errors propagate', async () => {
            mockedApi.delete.mockRejectedValueOnce(new Error('Forbidden'));
            await expect(inventoryApi.deleteItem('5')).rejects.toThrow('Forbidden');
        });
    });

    describe('refillItem', () => {
        it('posts a relative stock change with a numeric id', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { transaction: apiStockUpdateFixture } } });

            const result = await inventoryApi.refillItem('5', 10);

            expect(mockedApi.post).toHaveBeenCalledWith('/group/stock', { items: [{ id: 5, quantity: 10 }] });
            expect(result).toMatchObject({
                id: '9',
                type: 'stockUpdate',
                createdBy: { type: 'user', id: '1' },
                items: [{ id: '1', name: 'Kaffe', before: 5, after: 15 }],
            });
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { transaction: {} } } });
            await expect(inventoryApi.refillItem('5', 10)).rejects.toThrow('Failed to parse stock refill response data');
        });
    });

    describe('setItemQuantity', () => {
        it('posts an absolute stock value with a numeric id', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { transaction: apiStockUpdateFixture } } });

            await inventoryApi.setItemQuantity('5', 20);

            expect(mockedApi.post).toHaveBeenCalledWith('/group/stock', {
                items: [{ id: 5, quantity: 20, absolute: true }],
            });
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { transaction: {} } } });
            await expect(inventoryApi.setItemQuantity('5', 20)).rejects.toThrow('Failed to parse stock update response data');
        });
    });
});
