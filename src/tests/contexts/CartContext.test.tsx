import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartProvider, useCartContext } from '@/contexts/CartContext';

const mockRefreshTransactions = vi.fn();
vi.mock('@/contexts/TransactionsContext', () => ({
    useTransactionsContext: () => ({ refreshTransactions: mockRefreshTransactions }),
}));

const mockNotify = vi.fn();
vi.mock('@/contexts/NotificationContext', () => ({
    default: () => ({ notify: mockNotify }),
    useNotificationContext: () => ({ notify: mockNotify }),
}));

const mockMakePurchase = vi.fn();
vi.mock('@/api/transactionApi', () => ({
    default: { makePurchase: (...args: unknown[]) => mockMakePurchase(...args) },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;

const item: Item = {
    id: '1',
    name: 'Kaffe',
    icon: 'coffee.png',
    internalPrice: 10,
    amountInStock: 5,
    available: true,
    favorite: false,
    addedTime: new Date(),
    timesPurchased: 0,
};

const otherItem: Item = { ...item, id: '2', name: 'Te', internalPrice: 5 };

const user: User = {
    id: '99',
    firstName: 'Ada',
    lastName: 'Lovelace',
    name: 'Ada Lovelace',
    nick: 'ada',
    icon: 'ada.png',
    balance: 100,
};

describe('CartContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('starts empty', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });
        expect(result.current.itemsInCart).toEqual([]);
        expect(result.current.numberOfItemsInCart).toBe(0);
        expect(result.current.total).toBe(0);
    });

    it('adds a new item to the cart with quantity 1', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });

        act(() => result.current.addItemToCart(item));

        expect(result.current.itemsInCart).toEqual([{ ...item, quantity: 1 }]);
        expect(result.current.numberOfItemsInCart).toBe(1);
        expect(result.current.total).toBe(10);
    });

    it('increments the quantity when the same item is added again', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });

        act(() => result.current.addItemToCart(item));
        act(() => result.current.addItemToCart(item));

        expect(result.current.itemsInCart).toEqual([{ ...item, quantity: 2 }]);
        expect(result.current.numberOfItemsInCart).toBe(2);
        expect(result.current.total).toBe(20);
    });

    it('tracks totals across multiple different items', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });

        act(() => result.current.addItemToCart(item));
        act(() => result.current.addItemToCart(otherItem));

        expect(result.current.numberOfItemsInCart).toBe(2);
        expect(result.current.total).toBe(15);
    });

    it('sets a specific quantity for a product', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });

        act(() => result.current.addItemToCart(item));
        act(() => result.current.setProductQuantity('1', 5));

        expect(result.current.getProductQuantity('1')).toBe(5);
    });

    it('throws when setting a negative quantity', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });
        act(() => result.current.addItemToCart(item));

        expect(() => act(() => result.current.setProductQuantity('1', -1))).toThrow(
            'Quantity cannot be negative'
        );
    });

    it('increases and decreases the quantity of an item in the cart', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });
        act(() => result.current.addItemToCart(item));

        act(() => result.current.increaseProductQuantity(result.current.itemsInCart[0]));
        expect(result.current.getProductQuantity('1')).toBe(2);

        act(() => result.current.decreaseProductQuantity(result.current.itemsInCart[0]));
        expect(result.current.getProductQuantity('1')).toBe(1);
    });

    it('removes an item once its quantity is decreased to zero', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });
        act(() => result.current.addItemToCart(item));

        act(() => result.current.decreaseProductQuantity(result.current.itemsInCart[0]));

        expect(result.current.itemsInCart).toEqual([]);
    });

    it('removes a product from the cart directly', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });
        act(() => result.current.addItemToCart(item));
        act(() => result.current.addItemToCart(otherItem));

        act(() => result.current.removeProductFromCart(item));

        expect(result.current.itemsInCart).toEqual([{ ...otherItem, quantity: 1 }]);
    });

    it('returns 0 for a product that is not in the cart', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });
        expect(result.current.getProductQuantity('does-not-exist')).toBe(0);
    });

    it('empties the cart and notifies the user', () => {
        const { result } = renderHook(() => useCartContext(), { wrapper });
        act(() => result.current.addItemToCart(item));

        act(() => result.current.emptyCart());

        expect(result.current.itemsInCart).toEqual([]);
        expect(mockNotify).toHaveBeenCalledWith('Korgen tömdes', 'info');
    });

    describe('purchaseCart', () => {
        it('fails when there is no paying user', async () => {
            const { result } = renderHook(() => useCartContext(), { wrapper });
            act(() => result.current.addItemToCart(item));

            let success: boolean = true;
            await act(async () => {
                success = await result.current.purchaseCart();
            });

            expect(success).toBe(false);
            expect(mockNotify).toHaveBeenCalledWith('No paying user set', 'error');
            expect(mockMakePurchase).not.toHaveBeenCalled();
        });

        it('fails when the cart is empty', async () => {
            const { result } = renderHook(() => useCartContext(), { wrapper });
            act(() => result.current.setPayingUser(user));

            let success: boolean = true;
            await act(async () => {
                success = await result.current.purchaseCart();
            });

            expect(success).toBe(false);
            expect(mockNotify).toHaveBeenCalledWith('Cart is empty', 'error');
        });

        it('fails when the comment is too long', async () => {
            const { result } = renderHook(() => useCartContext(), { wrapper });
            act(() => result.current.addItemToCart(item));
            act(() => result.current.setPayingUser(user));

            let success: boolean = true;
            await act(async () => {
                success = await result.current.purchaseCart('a'.repeat(1001));
            });

            expect(success).toBe(false);
            expect(mockMakePurchase).not.toHaveBeenCalled();
        });

        it('purchases the cart, clears it, and refreshes transactions on success', async () => {
            mockMakePurchase.mockResolvedValueOnce(90);
            const { result } = renderHook(() => useCartContext(), { wrapper });
            act(() => result.current.addItemToCart(item));
            act(() => result.current.setPayingUser(user));

            let success: boolean = false;
            await act(async () => {
                success = await result.current.purchaseCart('Fika');
            });

            expect(success).toBe(true);
            expect(mockMakePurchase).toHaveBeenCalledWith('99', [{ ...item, quantity: 1 }], 'Fika');
            expect(result.current.itemsInCart).toEqual([]);
            expect(result.current.payingUser).toBeNull();
            expect(mockRefreshTransactions).toHaveBeenCalled();
            expect(mockNotify).toHaveBeenCalledWith('Köp Genomfört', 'success');
        });
    });
});
