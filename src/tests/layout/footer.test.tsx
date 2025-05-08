import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../../layouts/footer/Footer';

describe('Footer Component', () => {
    test('renders footer text', () => {
        render(<Footer />);
        expect(screen.getByText(/built by/i)).toBeInTheDocument();
        expect(screen.getByText(/göken/i)).toBeInTheDocument();
        expect(screen.getByText(/in 2025/i)).toBeInTheDocument();
    });

    test('contains a link to Erik Persson\'s GitHub', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /göken/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://github.com/erikpersson0884/');
    });
});
