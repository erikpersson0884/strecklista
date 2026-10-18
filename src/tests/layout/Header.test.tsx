import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Header from '@/layouts/header/Header';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import usersApi from '@/api/userApi';
import fallbackLogo from '@/assets/images/bird.png';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockUseAuthContext = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
    default: () => mockUseAuthContext(),
}));

vi.mock('@/api/userApi', () => ({
    default: {
        getGroupInfo: vi.fn().mockResolvedValue({ id: '1', name: 'Göken', avatarUrl: '', gammaId: 'g1' }),
    },
}));

function renderHeader() {
    return render(
        <BrowserRouter>
            <Header />
        </BrowserRouter>
    );
}

describe('Header tests', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('when the user is not authenticated', () => {
        beforeEach(() => {
            mockUseAuthContext.mockReturnValue({ isAuthenticated: false });
        });

        it('renders the logo linking home', () => {
            renderHeader();
            const logo = screen.getByAltText('logo');
            expect(logo).toBeInTheDocument();
            expect(logo.closest('a')).toHaveAttribute('href', '/');
        });

        it('does not render the navigation links', () => {
            renderHeader();
            expect(screen.queryByText('Strecka')).not.toBeInTheDocument();
            expect(screen.queryByText('Utbud')).not.toBeInTheDocument();
            expect(screen.queryByText('Tillgodo')).not.toBeInTheDocument();
            expect(screen.queryByText('Transaktioner')).not.toBeInTheDocument();
        });

        it('does not render the menu or profile buttons', () => {
            renderHeader();
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });

        it('does not render the nav as open', () => {
            renderHeader();
            const nav = screen.getByRole('navigation');
            expect(nav).not.toHaveClass('nav-open');
        });

        it('falls back to the default logo when the image fails to load', () => {
            renderHeader();
            const logo = screen.getByAltText('logo');
            fireEvent.change(logo, { target: { src: 'https://example.com/broken.png' } });
            fireEvent.error(logo);
            expect(logo).toHaveAttribute('src', fallbackLogo);
        });
    });

    describe('when the user is authenticated', () => {
        beforeEach(() => {
            mockUseAuthContext.mockReturnValue({ isAuthenticated: true });
        });

        it('renders the navigation links', () => {
            renderHeader();
            expect(screen.getByText('Strecka')).toBeInTheDocument();
            expect(screen.getByText('Utbud')).toBeInTheDocument();
            expect(screen.getByText('Tillgodo')).toBeInTheDocument();
            expect(screen.getByText('Transaktioner')).toBeInTheDocument();
        });

        it('renders the menu and profile buttons', () => {
            renderHeader();
            expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
        });

        it('opens the nav when the menu button is clicked', async () => {
            renderHeader();
            const nav = screen.getByRole('navigation');
            const menuButton = screen.getByRole('button', { name: /toggle navigation/i });

            expect(nav).not.toHaveClass('nav-open');
            await userEvent.click(menuButton);
            expect(nav).toHaveClass('nav-open');
        });

        it('closes the nav when the menu button is clicked again', async () => {
            renderHeader();
            const nav = screen.getByRole('navigation');
            const menuButton = screen.getByRole('button', { name: /toggle navigation/i });

            await userEvent.click(menuButton);
            expect(nav).toHaveClass('nav-open');

            await userEvent.click(menuButton);
            expect(nav).not.toHaveClass('nav-open');
        });

        it('closes the nav when a nav link is clicked', async () => {
            renderHeader();
            const nav = screen.getByRole('navigation');
            const menuButton = screen.getByRole('button', { name: /toggle navigation/i });

            await userEvent.click(menuButton);
            expect(nav).toHaveClass('nav-open');

            const firstLink = nav.querySelector('a');
            expect(firstLink).toBeInTheDocument();
            await userEvent.click(firstLink!);

            expect(nav).not.toHaveClass('nav-open');
        });

        it('navigates to the profile page when the profile button is clicked', async () => {
            renderHeader();
            const profileButton = screen.getByRole('button', { name: /profile/i });

            await userEvent.click(profileButton);

            expect(mockNavigate).toHaveBeenCalledWith('/profile');
        });

        describe('group logo', () => {
            it('uses the group avatar when one exists', async () => {
                vi.mocked(usersApi.getGroupInfo).mockResolvedValueOnce({
                    id: '1', name: 'Göken', avatarUrl: 'https://example.com/group.png', gammaId: 'g1',
                } as any);
                renderHeader();
                await waitFor(() =>
                    expect(screen.getByAltText('logo')).toHaveAttribute('src', 'https://example.com/group.png')
                );
            });

            it('keeps the default logo when the group has no avatar', async () => {
                renderHeader(); // the default mock returns avatarUrl: ''
                await waitFor(() => expect(usersApi.getGroupInfo).toHaveBeenCalledTimes(1));
                expect(screen.getByAltText('logo')).toHaveAttribute('src', fallbackLogo);
            });

            it('falls back to the default logo if the avatar image fails to load', async () => {
                vi.mocked(usersApi.getGroupInfo).mockResolvedValueOnce({
                    id: '1', name: 'Göken', avatarUrl: 'https://example.com/group.png', gammaId: 'g1',
                } as any);
                renderHeader();
                const logo = screen.getByAltText('logo');
                await waitFor(() => expect(logo).toHaveAttribute('src', 'https://example.com/group.png'));

                fireEvent.error(logo);
                expect(logo).toHaveAttribute('src', fallbackLogo);
            });

            it('resets to the default logo when the user logs out', async () => {
                vi.mocked(usersApi.getGroupInfo).mockResolvedValueOnce({
                    id: '1', name: 'Göken', avatarUrl: 'https://example.com/group.png', gammaId: 'g1',
                } as any);
                const { rerender } = renderHeader();
                await waitFor(() =>
                    expect(screen.getByAltText('logo')).toHaveAttribute('src', 'https://example.com/group.png')
                );

                mockUseAuthContext.mockReturnValue({ isAuthenticated: false });
                rerender(<BrowserRouter><Header /></BrowserRouter>);

                expect(screen.getByAltText('logo')).toHaveAttribute('src', fallbackLogo);
            });
        });

        describe('closing the nav', () => {
            it('closes the nav when the logo is clicked', async () => {
                renderHeader();
                const nav = screen.getByRole('navigation');
                await userEvent.click(screen.getByRole('button', { name: /toggle navigation/i }));
                expect(nav).toHaveClass('nav-open');

                await userEvent.click(screen.getByAltText('logo'));
                expect(nav).not.toHaveClass('nav-open');
            });

            it('closes the nav when the profile button is clicked', async () => {
                renderHeader();
                const nav = screen.getByRole('navigation');
                await userEvent.click(screen.getByRole('button', { name: /toggle navigation/i }));
                expect(nav).toHaveClass('nav-open');

                await userEvent.click(screen.getByRole('button', { name: /profile/i }));
                expect(nav).not.toHaveClass('nav-open');
            });

            it('reports the nav state through aria-expanded', async () => {
                renderHeader();
                const menuButton = screen.getByRole('button', { name: /toggle navigation/i });
                expect(menuButton).toHaveAttribute('aria-expanded', 'false');
                await userEvent.click(menuButton);
                expect(menuButton).toHaveAttribute('aria-expanded', 'true');
            });
        });

        describe('links for a logged-in client', () => {
            const asClient = (scope?: string) =>
                mockUseAuthContext.mockReturnValue({ isAuthenticated: true, currentClient: { scope } });

            const visible = () =>
                ['Strecka', 'Utbud', 'Tillgodo', 'Transaktioner', 'Streckkods-handel'].filter(
                    (name) => screen.queryByText(name) !== null
                );

            it('shows the always-visible links to a user without a client', () => {
                renderHeader();
                expect(visible()).toEqual(['Strecka', 'Utbud', 'Tillgodo', 'Transaktioner', 'Streckkods-handel']);
            });

            it('shows Utbud only with the items.read scope', () => {
                asClient('items.read');
                renderHeader();
                expect(visible()).toEqual(['Strecka', 'Utbud', 'Streckkods-handel']);
            });

            it('shows Tillgodo only with the group.read scope', () => {
                asClient('group.read');
                renderHeader();
                expect(visible()).toEqual(['Strecka', 'Tillgodo', 'Streckkods-handel']);
            });

            it('shows Transaktioner only with the transactions.read scope', () => {
                asClient('transactions.read');
                renderHeader();
                expect(visible()).toEqual(['Strecka', 'Transaktioner', 'Streckkods-handel']);
            });

            it('shows every link when the client has all read scopes', () => {
                asClient('items.read group.read transactions.read');
                renderHeader();
                expect(visible()).toEqual(['Strecka', 'Utbud', 'Tillgodo', 'Transaktioner', 'Streckkods-handel']);
            });

            it('hides the scoped links when the client has an unrelated scope', () => {
                asClient('items.create');
                renderHeader();
                expect(visible()).toEqual(['Strecka', 'Streckkods-handel']);
            });

            it('hides the scoped links when the client has no scope at all', () => {
                asClient(undefined);
                renderHeader();
                expect(visible()).toEqual(['Strecka', 'Streckkods-handel']);
            });

            it('gives the barcode shop link its own class and the others none', () => {
                renderHeader();
                expect(screen.getByText('Streckkods-handel')).toHaveClass('barcode-shop-link');
                expect(screen.getByText('Strecka')).not.toHaveClass('barcode-shop-link');
            });
        });
    });
});
