import { render, screen } from '@testing-library/react';
import Header from '../../layouts/header/Header';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import userEvent from '@testing-library/user-event';


function renderWithBrowserRouter(children: React.ReactNode) {
    return render(<BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>)
}

describe('Header tests', () => {
    it('should render header title', () => {
        renderWithBrowserRouter(<Header />);
        expect(screen.getByText(/Strecklista/)).toBeInTheDocument();
    });

    it('Should render menu button', () => {
        renderWithBrowserRouter(<Header />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not render the mobile nav by default', () => {
        renderWithBrowserRouter(<Header />);
        const mobileNav = screen.queryByRole('navigation');
        expect(mobileNav).not.toHaveClass('nav-open');
    });

    it('should open nav when menu button is clicked', async () => {
        renderWithBrowserRouter(<Header />);
        const button = screen.getByRole('button', { name: /toggle navigation/i });
        let mobileNav = screen.queryByRole('navigation');

        // 1️⃣ Initially, nav should NOT be in the DOM
        expect(mobileNav).not.toHaveClass('nav-open');

        // 2️⃣ Click button to open
        await userEvent.click(button);

        // 3️⃣ Wait for nav to appear
        expect(mobileNav).toHaveClass('nav-open');

    });

    it('should close nav when menu button is clicked again', async () => {
        renderWithBrowserRouter(<Header />);
        const mobileNav = screen.getByRole('navigation');
        const button = screen.getByRole('button', { name: /toggle navigation/i });
        expect(mobileNav).not.toHaveClass('nav-open');

        await userEvent.click(button);
        expect(mobileNav).toHaveClass('nav-open');

        await userEvent.click(button);
        expect(mobileNav).not.toHaveClass('nav-open');
    });

    it('should close nav when a link is clicked', async () => {
        renderWithBrowserRouter(<Header />);
        const mobileNav = screen.getByRole('navigation');
        const button = screen.getByRole('button', { name: /toggle navigation/i });

        await userEvent.click(button);
        expect(mobileNav).toHaveClass('nav-open');
        const firstLink = mobileNav.querySelector('a');
        expect(firstLink).toBeInTheDocument();

        await userEvent.click(firstLink!);
        expect(mobileNav).not.toHaveClass('nav-open');
    });
});