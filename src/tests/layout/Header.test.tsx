import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Header from '@/layouts/header/Header';

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

        it('renders the navigation links', () => {
            renderHeader();
            expect(screen.getByText('Strecka')).toBeInTheDocument();
            expect(screen.getByText('Utbud')).toBeInTheDocument();
            expect(screen.getByText('Tillgodo')).toBeInTheDocument();
            expect(screen.getByText('Transaktioner')).toBeInTheDocument();
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
    });

    describe('when the user is authenticated', () => {
        beforeEach(() => {
            mockUseAuthContext.mockReturnValue({ isAuthenticated: true });
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
    });
});
