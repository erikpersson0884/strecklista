import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Header from '../layouts/header/Header';

describe('Header Component', () => {
    const renderWithBrowser = (ui: React.ReactNode) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>);
    };
    
    test('renders logo and title', () => {
        renderWithBrowser(<Header />);

        expect(screen.getByAltText('logo')).toBeInTheDocument();
        expect(screen.getByText('Strecklista')).toBeInTheDocument();
    });

    test('renders navigation links', () => {
        renderWithBrowser(<Header />);


        expect(screen.getByText('Strecka')).toBeInTheDocument();
        expect(screen.getByText('Inventory')).toBeInTheDocument();
        expect(screen.getByText('Tillgodo')).toBeInTheDocument();
        expect(screen.getByText('Purchases')).toBeInTheDocument();
    });

    test('toggles navigation menu when button is clicked', () => {
        renderWithBrowser(<Header />);


        const menuButton = screen.getByRole('button', { name: /toggle navigation/i });
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(menuButton);
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(menuButton);
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('closes navigation when a link is clicked', () => {
        renderWithBrowser(<Header />);


        const menuButton = screen.getByRole('button', { name: /toggle navigation/i });
        fireEvent.click(menuButton);
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(screen.getByText('Inventory'));
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
});
