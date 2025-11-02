import { render, screen } from '@testing-library/react';
import Header from '../../layouts/header/Header';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';


function renderWithBrowserRouter(children: React.ReactNode) {
    return render(<BrowserRouter>{children}</BrowserRouter>)
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
        const mobileNav = screen.queryByRole('navigation', { name: /mobile/i });
        expect(mobileNav).not.toBeInTheDocument();
    });

    it('should open nav when menu button is clicked', async () => {
        renderWithBrowserRouter(<Header />);
        const button = screen.getByRole('button', { name: /toggle navigation/i });

        // 1️⃣ Initially, nav should NOT be in the DOM
        expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument();

        // 2️⃣ Click button to open
        await userEvent.click(button);

        // 3️⃣ Wait for nav to appear
        const mobileNav = await screen.findByRole('navigation', { name: /mobile/i });
        expect(mobileNav).toBeInTheDocument();
    });

    it('should close nav when menu button is clicked again', async () => {
        renderWithBrowserRouter(<Header />);
        const button = screen.getByRole('button', { name: /toggle navigation/i });

        await userEvent.click(button);
        expect(screen.getByRole('navigation', { name: /mobile/i })).toBeInTheDocument();

        await userEvent.click(button);
        expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument();
    });

    it('should close nav when a link is clicked', async () => {
        renderWithBrowserRouter(<Header />);
        const button = screen.getByRole('button', { name: /toggle navigation/i });

        await userEvent.click(button);
        const mobileNav = screen.getByRole('navigation', { name: /mobile/i });
        const firstLink = mobileNav.querySelector('a');
        expect(firstLink).toBeInTheDocument();

        await userEvent.click(firstLink!);
        expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument();
    });
});