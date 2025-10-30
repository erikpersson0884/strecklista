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

    it('should not have open-nav class by default', () => {
        const {container} = renderWithBrowserRouter(<Header />);
        const nav = container.getElementsByClassName('header-nav2')[0];
        expect(nav).not.toHaveClass('open-nav');
    });

    it('should open nav when menu button is clicked', async () => {
        const {container} = renderWithBrowserRouter(<Header />);
        const button = screen.getByRole('button', { name: /toggle navigation/i });
        const nav = container.getElementsByClassName('header-nav2')[0];

        expect(nav).not.toHaveClass('open-nav');

        await userEvent.click(button);
        expect(nav).toHaveClass('open-nav');
    });

    it('should close nav when menu button is clicked and nav is open', async () => {
        const {container} = renderWithBrowserRouter(<Header />);
        const button = screen.getByRole('button', { name: /toggle navigation/i });
        const nav = container.getElementsByClassName('header-nav2')[0];
        expect(nav).not.toHaveClass('open-nav');

        await userEvent.click(button);
        expect(nav).toHaveClass('open-nav');
        await userEvent.click(button);
        expect(nav).not.toHaveClass('open-nav');
    });

    it('should close nav when a link is clicked', async () => {
        const {container} = renderWithBrowserRouter(<Header />);
        const button = screen.getByRole('button', { name: /toggle navigation/i });
        const nav = container.getElementsByClassName('header-nav2')[0];
        expect(nav).not.toHaveClass('open-nav');
        await userEvent.click(button);
        expect(nav).toHaveClass('open-nav');
        const link: HTMLElement = nav.querySelector('a');
        await userEvent.click(link);
        expect(nav).not.toHaveClass('open-nav');
    });
});