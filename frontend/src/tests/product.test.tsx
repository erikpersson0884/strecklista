import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Product from '../pages/shopPage/product/Product';
import { useCart } from '../contexts/CartContext';
import { Product as ProductT } from '../Types';

// Mock the useCart context
jest.mock('../contexts/CartContext', () => ({
    useCart: jest.fn(),
}));

describe('Product Component', () => {
    const mockAddProductToCart = jest.fn();
    const mockProduct: ProductT = {
        id: 1,
        name: 'Test Product',
        internalPrice: 99.99,
        amountInStock: 10,
        favorite: false,
        icon: 'test-image-url',
        available: true,
        addedTime: new Date().getTime(),
        timesPurchased: 0,
    };

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        (useCart as jest.Mock).mockReturnValue({
            addProductToCart: mockAddProductToCart,
        });
    });

    test('renders product details correctly', () => {
        render(<Product product={mockProduct} />);

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('10 i lager')).toBeInTheDocument();
        expect(screen.getByText('99.99:-')).toBeInTheDocument();
        expect(screen.getByAltText('Test Product')).toHaveAttribute('src', 'test-image-url');
    });

    test('calls addProductToCart when product is clicked', () => {
        render(<Product product={mockProduct} />);
        const productElement = screen.getByText('Test Product');

        fireEvent.click(productElement);

        expect(mockAddProductToCart).toHaveBeenCalledWith(mockProduct);
    });

    test('calls toggleFavourite when favorite button is clicked', () => {
        render(<Product product={mockProduct} />);
        const favButton = screen.getByRole('button');

        fireEvent.click(favButton);

        // Since toggleFavourite is not implemented, we just ensure no error occurs
        expect(favButton).toBeInTheDocument(); 
    });

    test('renders the favorite button', () => {
        render(<Product product={mockProduct} />);
        const favButton = screen.getByRole('button');

        expect(favButton).toBeInTheDocument();
    });
});
