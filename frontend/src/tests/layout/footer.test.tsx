import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Ensure jest-dom matchers are available
import Footer from '../layouts/footer/Footer'; // Adjust path as needed

describe('Footer Component', () => {
    test('renders footer text', () => {
        render(<Footer />);
        expect(screen.getByText(/built by/i)).toBeInTheDocument();
        expect(screen.getByText(/erik persson/i)).toBeInTheDocument();
        expect(screen.getByText(/in 2025/i)).toBeInTheDocument();
    });

    test('contains a link to Erik Persson\'s GitHub', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /erik persson/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://github.com/erikpersson0884/');
    });
});
