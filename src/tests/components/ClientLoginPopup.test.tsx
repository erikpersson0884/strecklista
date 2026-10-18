// src/tests/components/ClientLoginPopup.test.tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ClientLoginPopup from '@/components/clientLoginPopup/ClientLoginPopup'; // adjust path
import useAuthContext from '@/contexts/AuthContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/AuthContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));

const clientLogin = vi.fn();
const closeModal = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  clientLogin.mockResolvedValue(undefined);
  vi.mocked(useAuthContext).mockReturnValue({ clientLogin } as any);
  vi.mocked(useModalContext).mockReturnValue({ closeModal } as any);
});

const idInput = () => screen.getByPlaceholderText('Client ID');
const secretInput = () => screen.getByPlaceholderText('Client Secret');
const submit = (name = 'Logga in') => userEvent.click(screen.getByRole('button', { name }));

describe('ClientLoginPopup', () => {
  describe('rendering', () => {
    it('uses the default title and button text', () => {
      render(<ClientLoginPopup />);
      expect(screen.getByRole('heading', { name: 'Logga in med klient' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Logga in' })).toBeInTheDocument();
    });

    it('uses a custom title and button text', () => {
      render(<ClientLoginPopup title="Anslut scanner" acceptButtonText="Anslut" />);
      expect(screen.getByRole('heading', { name: 'Anslut scanner' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Anslut' })).toBeInTheDocument();
    });

    it('applies a custom className', () => {
      const { container } = render(<ClientLoginPopup className="custom" />);
      expect(container.firstChild).toHaveClass('popup-window', 'custom');
    });

    it('starts empty when nothing is stored', () => {
      render(<ClientLoginPopup />);
      expect(idInput()).toHaveValue('');
      expect(secretInput()).toHaveValue('');
    });

    it('prefills from localStorage', () => {
      localStorage.setItem('clientId', 'stored-id');
      localStorage.setItem('clientSecret', 'stored-secret');
      render(<ClientLoginPopup />);
      expect(idInput()).toHaveValue('stored-id');
      expect(secretInput()).toHaveValue('stored-secret');
    });
  });

  describe('logging in', () => {
    it('logs in with what the user typed', async () => {
      render(<ClientLoginPopup />);
      await userEvent.type(idInput(), 'my-id');
      await userEvent.type(secretInput(), 'my-secret');
      await submit();

      expect(clientLogin).toHaveBeenCalledTimes(1);
      expect(clientLogin).toHaveBeenCalledWith('my-id', 'my-secret');
    });

    it('logs in with the stored values if the user changes nothing', async () => {
      localStorage.setItem('clientId', 'stored-id');
      localStorage.setItem('clientSecret', 'stored-secret');
      render(<ClientLoginPopup />);
      await submit();

      expect(clientLogin).toHaveBeenCalledWith('stored-id', 'stored-secret');
    });

    it('uses the edited value when a stored one is changed', async () => {
      localStorage.setItem('clientId', 'old-id');
      localStorage.setItem('clientSecret', 'stored-secret');
      render(<ClientLoginPopup />);
      await userEvent.clear(idInput());
      await userEvent.type(idInput(), 'new-id');
      await submit();

      expect(clientLogin).toHaveBeenCalledWith('new-id', 'stored-secret');
    });

    it('closes the modal only after the login has finished', async () => {
      let finish!: () => void;
      clientLogin.mockReturnValue(new Promise<void>((r) => { finish = r; }));
      render(<ClientLoginPopup />);

      await submit();
      expect(clientLogin).toHaveBeenCalled();
      expect(closeModal).not.toHaveBeenCalled();

      await act(async () => { finish(); });
      expect(closeModal).toHaveBeenCalledTimes(1);
    });
  });
});
