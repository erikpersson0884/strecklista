import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";

import Header from "../layouts/header/Header";
import { BrowserRouter } from "react-router-dom";

const links = [
    { to: '/', text: 'Strecka' },
    { to: '/inventory', text: 'Inventory' },
    { to: '/balance', text: 'Tillgodo' },
    { to: '/purchases', text: 'Purchases' },
]

describe('Header component', () => {
    // Wrapper for Router since your component uses react-router
    const renderWithRouter = (ui: React.ReactNode) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>);
    };

    test('renders logo and header text', () => {
        renderWithRouter(<Header />);
        
        const logo = screen.getByAltText('logo');
        const headerText = screen.getByText('Strecklista');
        
        expect(logo).toBeInTheDocument();
        expect(headerText).toBeInTheDocument();
    });

    test('renders navigation links', () => {
        renderWithRouter(<Header />);
        
        links.forEach(link => {
            const linkElement = screen.getByText(link.text);
            expect(linkElement).toBeInTheDocument();
        });
    });

    test('opens and closes the mobile menu when button is clicked', () => {
        renderWithRouter(<Header />);
        
        const button = screen.getByAltText('menu');
        fireEvent.click(button);
        
        // Check if the mobile nav becomes visible
        const mobileNav = document.querySelector('.mobile-header-nav');
        expect(mobileNav).toBeInTheDocument();
        
        // Clicking again should close the mobile nav
        fireEvent.click(button);
        expect(mobileNav).not.toBeInTheDocument();
    });

    test('mobile nav closes when a link is clicked', () => {
        renderWithRouter(<Header />);
        
        // Open mobile menu
        const button = screen.getByAltText('menu');
        fireEvent.click(button);
        
        // Click a link inside mobile menu
        const inventoryLink = screen.getByText('Inventory');
        fireEvent.click(inventoryLink);
        
        // Check if mobile nav is closed
        const mobileNav = document.querySelector('.mobile-header-nav');
        expect(mobileNav).not.toBeInTheDocument();
    });


    test('renders correct number of links in mobile and desktop nav', () => {
        renderWithRouter(<Header />);
        
        // Check desktop nav
        const desktopNav = screen.getByRole('navigation', { name: 'inline-header-nav' });
        const desktopLinks = within(desktopNav).getAllByRole('link');
        expect(desktopLinks.length).toBe(links.length);
    
        // Open mobile menu
        const button = screen.getByAltText('menu');
        fireEvent.click(button);
        
        // Check mobile nav
        const mobileNav = screen.getByRole('navigation', { name: 'mobile-header-nav' });
        const mobileLinks = within(mobileNav).getAllByRole('link');
        expect(mobileLinks.length).toBe(links.length);
    });
});

// Removed the custom within function as it is imported from @testing-library/react
// 