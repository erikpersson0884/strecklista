// src/tests/pages/LoginPage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import LoginPage from '@/pages/loginPage/LoginPage'; // adjust path
import ClientLoginPopup from '@/components/clientLoginPopup/ClientLoginPopup';
import useAuthContext from '@/contexts/AuthContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/AuthContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));
vi.mock('@/pages/loadingPage/LoadingPage', () => ({
  default: ({ message }: { message: string }) => <p>{message}</p>,
}));
vi.mock('@/components/clientLoginPopup/ClientLoginPopup', () => ({
  default: () => <div data-testid="client-login-popup" />,
}));
// Stand-in for Switch: a checkbox that reports changes like the real one must (adjust path)
vi.mock('@/components/switch/Switch', () => ({
  default: ({ id, checked, onChange }: any) => (
    <input type="checkbox" id={id} checked={checked} onChange={onChange} />
  ),
}));

// ---------- setup ----------
type Setup = {
  isAuthenticated?: boolean;
  isLoggingIn?: boolean;
  rememberMe?: boolean;
};

function setup(o: Setup = {}) {
  const auth = {
    userAuthenticate: vi.fn(),
    setToken: vi.fn(),
    isAuthenticated: o.isAuthenticated ?? false,
    isLoggingIn: o.isLoggingIn ?? false,
    rememberMe: o.rememberMe ?? false,
    setRememberMe: vi.fn(),
  };
  const openModal = vi.fn();

  vi.mocked(useAuthContext).mockReturnValue(auth as any);
  vi.mocked(useModalContext).mockReturnValue({ openModal } as any);

  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<p>Hemsida</p>} />
      </Routes>
    </MemoryRouter>
  );
  return { auth, openModal };
}

// ---------- helpers ----------
const title = () => screen.getByRole('heading', { name: 'Strecklista' });
const gammaButton = () => screen.getByRole('button', { name: 'Logga in med Gamma' });
const clientButton = () => screen.getByRole('button', { name: 'Logga in med klient' });
const rememberSwitch = () => screen.getByLabelText('Kom ihåg mig:') as HTMLInputElement;

const clickTitle = async (times: number) => {
  for (let i = 0; i < times; i++) await userEvent.click(title());
};

let promptSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom does not implement prompt; default to "user pressed Cancel"
  promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
});

afterEach(() => {
  promptSpy.mockRestore();
});

describe('LoginPage', () => {
  describe('rendering', () => {
    it('shows the title and both login buttons', () => {
      setup();
      expect(title()).toBeInTheDocument();
      expect(gammaButton()).toBeInTheDocument();
      expect(clientButton()).toBeInTheDocument();
    });

    it('does not redirect or show the loading page by default', () => {
      setup();
      expect(screen.queryByText('Hemsida')).not.toBeInTheDocument();
      expect(screen.queryByText('Loggar in...')).not.toBeInTheDocument();
    });
  });

  describe('logging in', () => {
    it('starts the Gamma login', async () => {
      const { auth } = setup();
      await userEvent.click(gammaButton());
      expect(auth.userAuthenticate).toHaveBeenCalledTimes(1);
    });

    it('does not start anything until a button is clicked', () => {
      const { auth, openModal } = setup();
      expect(auth.userAuthenticate).not.toHaveBeenCalled();
      expect(openModal).not.toHaveBeenCalled();
    });

    it('opens the client login popup in a modal', async () => {
      const { openModal, auth } = setup();
      await userEvent.click(clientButton());

      expect(openModal).toHaveBeenCalledTimes(1);
      expect(openModal.mock.calls[0][0].type).toBe(ClientLoginPopup);
      expect(auth.userAuthenticate).not.toHaveBeenCalled();
    });
  });

  describe('remember me', () => {
    it('is unchecked when rememberMe is false', () => {
      setup({ rememberMe: false });
      expect(rememberSwitch()).not.toBeChecked();
    });

    it('is checked when rememberMe is true', () => {
      setup({ rememberMe: true });
      expect(rememberSwitch()).toBeChecked();
    });

    it('turns remember me on when checked', async () => {
      const { auth } = setup({ rememberMe: false });
      await userEvent.click(rememberSwitch());
      expect(auth.setRememberMe).toHaveBeenCalledTimes(1);
      expect(auth.setRememberMe).toHaveBeenCalledWith(true);
    });

    it('turns remember me off when unchecked', async () => {
      const { auth } = setup({ rememberMe: true });
      await userEvent.click(rememberSwitch());
      expect(auth.setRememberMe).toHaveBeenCalledWith(false);
    });
  });

  describe('loading and redirect', () => {
    it('shows only the loading page while logging in', () => {
      setup({ isLoggingIn: true });
      expect(screen.getByText('Loggar in...')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Strecklista' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('redirects an authenticated user to the start page', () => {
      setup({ isAuthenticated: true });
      expect(screen.getByText('Hemsida')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Strecklista' })).not.toBeInTheDocument();
    });

    it('prefers the loading page over the redirect while logging in', () => {
      setup({ isAuthenticated: true, isLoggingIn: true });
      expect(screen.getByText('Loggar in...')).toBeInTheDocument();
      expect(screen.queryByText('Hemsida')).not.toBeInTheDocument();
    });
  });

  describe('hidden token bypass', () => {
    it('does not ask for a token on mount', () => {
      setup();
      expect(promptSpy).not.toHaveBeenCalled();
    });

    it('does not ask for a token before the third click', async () => {
      setup();
      await clickTitle(2);
      expect(promptSpy).not.toHaveBeenCalled();
    });

    it('asks for a token on the third click and uses it', async () => {
      promptSpy.mockReturnValue('my-token');
      const { auth } = setup();
      await clickTitle(3);

      expect(promptSpy).toHaveBeenCalledTimes(1);
      expect(promptSpy).toHaveBeenCalledWith('Enter a token to bypass login:');
      expect(auth.setToken).toHaveBeenCalledTimes(1);
      expect(auth.setToken).toHaveBeenCalledWith('my-token');
    });

    it.each([null, ''])('does not set a token when the prompt returns %j', async (answer) => {
      promptSpy.mockReturnValue(answer);
      const { auth } = setup();
      await clickTitle(3);

      expect(promptSpy).toHaveBeenCalledTimes(1);
      expect(auth.setToken).not.toHaveBeenCalled();
    });

    it('does not set a token for clicks elsewhere', async () => {
      const { auth } = setup();
      await userEvent.click(gammaButton());
      await userEvent.click(gammaButton());
      await userEvent.click(gammaButton());
      expect(promptSpy).not.toHaveBeenCalled();
      expect(auth.setToken).not.toHaveBeenCalled();
    });

    // Documents the current behavior: it asks again on every click after the third.
    it('asks again on each further click', async () => {
      setup();
      await clickTitle(5);
      expect(promptSpy).toHaveBeenCalledTimes(3); // clicks 3, 4 and 5
    });
  });

  describe('title easter egg', () => {
    it('has no custom color at first', () => {
      setup();
      expect(title()).not.toHaveAttribute('style');
    });

    it('has no custom color after ten clicks', async () => {
      setup();
      await clickTitle(10);
      expect(title()).not.toHaveAttribute('style');
    });

    it('turns cyan after more than ten clicks', async () => {
      setup();
      await clickTitle(11);
      expect(title()).toHaveStyle({ color: '#09cdda' });
    });
  });
});
