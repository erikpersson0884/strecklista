import { describe, it, expect } from 'vitest';
import transactionAdapter from '@/adapters/transactionAdapter';
import { ApiPurchase, ApiDeposit, ApiStockUpdate, ApiTransaction } from '@/schemas/api';

const purchase: ApiPurchase = {
    id: 1,
    type: 'purchase',
    createdBy: { userId: 42 },
    createdFor: 100,
    items: [
        {
            item: { id: 5, displayName: 'Kaffe', icon: 'coffee.png' },
            quantity: 2,
            purchasePrice: { price: '10', displayName: 'Internt' },
        },
        {
            item: { id: null, displayName: 'Te', icon: null },
            quantity: 1,
            purchasePrice: { price: '5', displayName: 'Internt' },
        },
    ],
    createdTime: new Date('2024-01-01T00:00:00.000Z'),
    removed: false,
    comment: 'Test purchase',
};

const deposit: ApiDeposit = {
    id: 2,
    type: 'deposit',
    createdBy: { clientId: 'client-1' },
    createdFor: 200,
    total: '50',
    createdTime: new Date('2024-01-02T00:00:00.000Z'),
    removed: false,
    comment: null,
};

const stockUpdate: ApiStockUpdate = {
    id: 3,
    type: 'stockUpdate',
    createdBy: { userId: 7 },
    items: [{ id: 9, before: 10, after: 15 }],
    createdTime: new Date('2024-01-03T00:00:00.000Z'),
    removed: false,
};

describe('transactionAdapter', () => {
    describe('adaptTime', () => {
        it('parses an ISO string into a Date', () => {
            const date = transactionAdapter.adaptTime('2024-05-01T12:00:00.000Z');
            expect(date).toBeInstanceOf(Date);
            expect(date.toISOString()).toBe('2024-05-01T12:00:00.000Z');
        });
    });

    describe('adaptCretedBy', () => {
        it('maps a userId to a user creator', () => {
            expect(transactionAdapter.adaptCretedBy({ userId: 42 })).toEqual({ type: 'user', id: '42' });
        });

        it('maps a clientId to a client creator', () => {
            expect(transactionAdapter.adaptCretedBy({ clientId: 'abc' })).toEqual({ type: 'client', id: 'abc' });
        });

        it('throws when neither userId nor clientId is present', () => {
            expect(() => transactionAdapter.adaptCretedBy({})).toThrow(/Unknown createdBy format/);
        });
    });

    describe('adaptPurchase', () => {
        it('adapts a purchase and computes the total from its items', () => {
            const result = transactionAdapter.adaptPurchase(purchase);

            expect(result).toMatchObject({
                id: '1',
                type: 'purchase',
                createdBy: { type: 'user', id: '42' },
                createdFor: '100',
                total: 25, // 10 * 2 + 5 * 1
                removed: false,
                comment: 'Test purchase',
            });
            expect(result.items).toHaveLength(2);
        });

        it('falls back to an empty comment when none is provided', () => {
            const result = transactionAdapter.adaptPurchase({ ...purchase, comment: undefined });
            expect(result.comment).toBe('');
        });
    });

    describe('adaptDeposit', () => {
        it('adapts a deposit and coerces the total to a number', () => {
            const result = transactionAdapter.adaptDeposit(deposit);
            expect(result).toEqual({
                id: '2',
                type: 'deposit',
                createdBy: { type: 'client', id: 'client-1' },
                createdFor: '200',
                total: 50,
                createdTime: deposit.createdTime,
                removed: false,
                comment: '',
            });
        });
    });

    describe('adaptStockUpdate', () => {
        it('adapts a stock update, defaulting item names to an empty string', () => {
            const result = transactionAdapter.adaptStockUpdate(stockUpdate);
            expect(result).toEqual({
                id: '3',
                type: 'stockUpdate',
                createdBy: { type: 'user', id: '7' },
                items: [{ before: 10, after: 15, name: '', id: '9' }],
                createdTime: stockUpdate.createdTime,
                removed: false,
            });
        });
    });

    describe('adaptTransaction', () => {
        it.each([
            ['purchase', purchase],
            ['deposit', deposit],
            ['stockUpdate', stockUpdate],
        ])('dispatches %s transactions to the right adapter', (type, tx) => {
            const result = transactionAdapter.adaptTransaction(tx as ApiTransaction);
            expect(result.type).toBe(type);
        });

        it('throws for an unknown transaction type', () => {
            expect(() =>
                transactionAdapter.adaptTransaction({ type: 'unknown' } as unknown as ApiTransaction)
            ).toThrow(/Unknown transaction type/);
        });
    });

    describe('apiPurchasedItemToPurchasedItem', () => {
        it('converts numeric price and item id to strings', () => {
            const result = transactionAdapter.apiPurchasedItemToPurchasedItem(purchase.items[0]);
            expect(result).toEqual({
                item: { id: '5', displayName: 'Kaffe', icon: 'coffee.png' },
                quantity: 2,
                purchasePrice: { price: 10, displayName: 'Internt' },
            });
        });

        it('falls back to a placeholder id when the item id is missing', () => {
            const result = transactionAdapter.apiPurchasedItemToPurchasedItem(purchase.items[1]);
            expect(result.item.id).toBe('no-id-was-provided...');
            expect(result.item.icon).toBe('');
        });
    });

    describe('ItemInCartToApiItems', () => {
        it('maps an ItemInCart to the shape expected by the purchase endpoint', () => {
            const item: ItemInCart = {
                id: '5',
                name: 'Kaffe',
                icon: 'coffee.png',
                internalPrice: 10,
                amountInStock: 3,
                available: true,
                favorite: false,
                addedTime: new Date(),
                timesPurchased: 1,
                quantity: 4,
            };

            expect(transactionAdapter.ItemInCartToApiItems(item)).toEqual({
                id: 5,
                purchasePrice: { price: 10, displayName: 'Kaffe' },
                quantity: 4,
            });
        });
    });
});
