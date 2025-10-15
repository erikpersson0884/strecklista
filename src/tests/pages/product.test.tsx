import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Item from '../../pages/shopPage/item/Item';
import { useCart } from '../../contexts/CartContext';
import { useInventory } from '../../contexts/InventoryContext';

// Mock the useCart and useInventory contexts
jest.mock('../../contexts/CartContext', () => ({
    useCart: jest.fn(),
}));

jest.mock('../../contexts/InventoryContext', () => ({
    useInventory: jest.fn(),
}));

describe('Item Component', () => {
    const mockAddIProductoCart  = jest.fn();
    const mockToggleFavourite = jest.fn();

    const mockProduct = {
        id: 1,
        name: 'Test Item',
        internalPrice: 99.99,
        amountInStock: 10,
        favorite: false,
        available: true,
        addedTime: new Date().getTime(),
        timesPurchased: 54,
        icon: 'test-image-url.svg',
    };

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        (useCart as jest.Mock).mockReturnValue({
            addIProductoCart: mockAddIProductoCart,
            items: [],
        });
        (useInventory as jest.Mock).mockReturnValue({
            toggleFavourite: mockToggleFavourite,
        });
    });

    test('renders item details correctly', () => {
        render(<Item item={mockProduct} />);

        expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
        expect(screen.getByText(`${mockProduct.amountInStock} i lager`)).toBeInTheDocument();
        expect(screen.getByText(`${mockProduct.internalPrice}:-`)).toBeInTheDocument();
        expect(screen.getByAltText(mockProduct.name)).toHaveAttribute('src', mockProduct.icon);
    });

    test('calls addIProductoCart when item is clicked', () => {
        render(<Item item={mockProduct} />);
        const productElement = screen.getByText(mockProduct.name);

        fireEvent.click(productElement);

        expect(mockAddIProductoCart).toHaveBeenCalledWith(mockProduct);
    });
});
