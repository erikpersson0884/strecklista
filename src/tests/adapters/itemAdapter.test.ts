import { describe, it, expect } from 'vitest';
import itemAdapter from '@/adapters/itemAdapter';
import { ApiItem } from '@/schemas/api';

const apiItem: ApiItem = {
    id: 1,
    createdTime: new Date('2024-01-01T00:00:00.000Z'),
    icon: 'coffee.png',
    displayName: 'Kaffe',
    prices: [
        { price: '10', displayName: 'Internt' },
        { price: '15', displayName: 'Externt', externalId: 'ext-1' },
    ],
    stock: 20,
    timesPurchased: 5,
    visible: true,
    favorite: true,
};

const item: Item = {
    id: '1',
    name: 'Kaffe',
    icon: 'coffee.png',
    internalPrice: 10,
    amountInStock: 20,
    available: true,
    favorite: true,
    addedTime: new Date('2024-01-01T00:00:00.000Z'),
    timesPurchased: 5,
    externalId: 'ext-1',
};

describe('itemAdapter', () => {
    describe('apiItemToItem', () => {
        it('adapts an api item, taking the internal price', () => {
            const result = itemAdapter.apiItemToItem(apiItem);
            expect(result).toEqual({
                id: '1',
                name: 'Kaffe',
                icon: 'coffee.png',
                available: true,
                favorite: true,
                internalPrice: 10,
                externalId: undefined,
                addedTime: apiItem.createdTime,
                timesPurchased: 5,
                amountInStock: 20,
            });
        });

        it('throws when no internal price is present', () => {
            const noInternalPrice: ApiItem = {
                ...apiItem,
                prices: [{ price: '15', displayName: 'Externt' }],
            };
            expect(() => itemAdapter.apiItemToItem(noInternalPrice)).toThrow(
                /Internal price for item "Kaffe" \(id: 1\) not found/
            );
        });

        it('defaults a missing icon to an empty string', () => {
            const result = itemAdapter.apiItemToItem({ ...apiItem, icon: null });
            expect(result.icon).toBe('');
        });
    });

    describe('itemToApiItem', () => {
        it('adapts a frontend item back to the api shape', () => {
            const result = itemAdapter.itemToApiItem(item);
            expect(result).toEqual({
                id: 1,
                displayName: 'Kaffe',
                icon: 'coffee.png',
                visible: true,
                favorite: true,
                prices: [{ displayName: 'Internt', price: '10', externalId: 'ext-1' }],
                createdTime: item.addedTime,
                timesPurchased: 5,
                stock: 20,
            });
        });
    });

    describe('partialItemToPartialApiItem', () => {
        it('only includes fields that were provided', () => {
            const result = itemAdapter.partialItemToPartialApiItem({ name: 'Ny kaffe' });
            expect(result).toEqual({ displayName: 'Ny kaffe' });
        });

        it('builds a price object when the internal price changes', () => {
            const result = itemAdapter.partialItemToPartialApiItem({ internalPrice: 12 });
            expect(result.prices).toEqual([{ displayName: 'Internt', price: '12' }]);
        });

        it('builds a price object when only the externalId changes', () => {
            const result = itemAdapter.partialItemToPartialApiItem({ externalId: 'ext-2' });
            expect(result.prices).toEqual([{ displayName: 'Internt', externalId: 'ext-2' }]);
        });

        it('combines price and externalId when both change', () => {
            const result = itemAdapter.partialItemToPartialApiItem({ internalPrice: 12, externalId: 'ext-2' });
            expect(result.prices).toEqual([{ displayName: 'Internt', price: '12', externalId: 'ext-2' }]);
        });

        it('returns an empty object when nothing is provided', () => {
            expect(itemAdapter.partialItemToPartialApiItem({})).toEqual({});
        });
    });
});
