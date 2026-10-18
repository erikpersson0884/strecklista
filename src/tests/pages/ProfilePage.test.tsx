// src/tests/pages/ProfilePage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ProfilePage from '@/pages/profilePage/ProfilePage'; // adjust path
import useAuthContext from '@/contexts/AuthContext';
import backUpIcon from '@/assets/images/profile.svg';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/contexts/AuthContext', () => ({ default: vi.fn() }));
// Expose the props the page passes (adjust path)
vi.mock('@/components/icon/Icon', () => ({
  default: ({ src, alt, className }: { src: string; alt?: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

// ---------- test data ----------
const user = { nick: 'Göken', name: 'Erik Persson', balance: 120, icon: 'user.png' };
const client = {
  displayName: 'P.R.I.T. Scanner',
  group: { avatarUrl: 'group.png' },
};

// ---------- setup ----------
type Setup = { currentUser?: unknown; currentClient?: unknown };

function setup(o: Setup = {}) {
  const logout = vi.fn();
  vi.mocked(useAuthContext).mockReturnValue({
    currentUser: o.currentUser ?? null,
    currentClient: o.currentClient ?? null,
    logout,
  } as any);

  render(<ProfilePage />);
  return { logout };
}

// ---------- helpers ----------
const heading = () => screen.getByRole('heading', { level: 1 });
const image = () => screen.getByAltText('Profilbild');
const clientsButton = () => screen.getByRole('button', { name: 'Mina Klienter' });
const styleButton = () => screen.getByRole('button', { name: 'Styling' });
const logoutButton = () => screen.getByRole('button', { name: 'Logga ut' });
const subtitle = () => document.querySelector('.profile-name p') as HTMLElement;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProfilePage', () => {
  describe('logged in as a user', () => {
    it('shows the nick, full name and profile image', () => {
      setup({ currentUser: user });
      expect(heading()).toHaveTextContent('Göken');
      expect(subtitle()).toHaveTextContent('Erik Persson');
      expect(image()).toHaveAttribute('src', 'user.png');
      expect(image()).toHaveClass('profile-image');
    });

    it('shows the balance', () => {
      setup({ currentUser: user });
      expect(screen.getByText('Saldo: 120 kr')).toBeInTheDocument();
    });

    it('shows a negative balance', () => {
      setup({ currentUser: { ...user, balance: -35 } });
      expect(screen.getByText('Saldo: -35 kr')).toBeInTheDocument();
    });

    it('shows the clients button', () => {
      setup({ currentUser: user });
      expect(clientsButton()).toBeInTheDocument();
    });

    it('goes to the clients page', async () => {
      setup({ currentUser: user });
      await userEvent.click(clientsButton());
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/clients');
    });

    it.each([null, undefined])('falls back to the default image when the icon is %s', (icon) => {
      setup({ currentUser: { ...user, icon } });
      expect(image()).toHaveAttribute('src', backUpIcon);
    });

    it('prefers the user over a client when both exist', () => {
      setup({ currentUser: user, currentClient: client });
      expect(heading()).toHaveTextContent('Göken');
      expect(image()).toHaveAttribute('src', 'user.png');
    });
  });

  describe('logged in as a client', () => {
    it('shows the display name, "Klient" and the group avatar', () => {
      setup({ currentClient: client });
      expect(heading()).toHaveTextContent('P.R.I.T. Scanner');
      expect(subtitle()).toHaveTextContent('Klient');
      expect(image()).toHaveAttribute('src', 'group.png');
    });

    it('shows no balance and no clients button', () => {
      setup({ currentClient: client });
      expect(screen.queryByText(/Saldo/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Mina Klienter' })).not.toBeInTheDocument();
    });

    it.each([
      ['has no group', { displayName: 'Scanner' }],
      ['has no avatar', { displayName: 'Scanner', group: {} }],
    ])('falls back to the default image when the client %s', (_name, c) => {
      setup({ currentClient: c });
      expect(image()).toHaveAttribute('src', backUpIcon);
    });
  });

  describe('logged in as neither', () => {
    it('shows an empty title and subtitle with the default image', () => {
      setup();
      expect(heading()).toBeEmptyDOMElement();
      expect(subtitle()).toBeEmptyDOMElement();
      expect(image()).toHaveAttribute('src', backUpIcon);
    });

    it('shows no balance and no clients button', () => {
      setup();
      expect(screen.queryByText(/Saldo/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Mina Klienter' })).not.toBeInTheDocument();
    });

    it('still offers styling and logout', () => {
      setup();
      expect(styleButton()).toBeInTheDocument();
      expect(logoutButton()).toBeInTheDocument();
    });
  });

  describe('buttons for everyone', () => {
    it.each([
      ['a user', { currentUser: user }],
      ['a client', { currentClient: client }],
    ])('goes to the styling page as %s', async (_name, o) => {
      setup(o);
      await userEvent.click(styleButton());
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/style');
    });

    it('logs out', async () => {
      const { logout } = setup({ currentUser: user });
      await userEvent.click(logoutButton());
      expect(logout).toHaveBeenCalledTimes(1);
    });

    it('does not navigate or log out until a button is clicked', () => {
      const { logout } = setup({ currentUser: user });
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(logout).not.toHaveBeenCalled();
    });

    it('does not navigate when logging out', async () => {
      setup({ currentUser: user });
      await userEvent.click(logoutButton());
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
