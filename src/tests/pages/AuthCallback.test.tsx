// src/tests/pages/AuthCallback.test.tsx
import { StrictMode } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AuthCallback from '@/pages/loginPage/AuthCallback';
import useAuthContext from '@/contexts/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/contexts/AuthContext', () => ({ default: vi.fn() }));

// Render the message so we can check what is passed to the loading page (adjust path)
vi.mock('@/pages/loadingPage/LoadingPage', () => ({
  default: ({ message }: { message: string }) => <p>{message}</p>,
}));

const exchangeCodeForToken = vi.fn();

function renderAt(url: string, { strict = false } = {}) {
  const tree = (
    <MemoryRouter initialEntries={[url]}>
      <AuthCallback />
    </MemoryRouter>
  );
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}

beforeEach(() => {
  vi.clearAllMocks();
  exchangeCodeForToken.mockResolvedValue(undefined);
  vi.mocked(useAuthContext).mockReturnValue({ exchangeCodeForToken } as any);
});

describe('AuthCallback', () => {
  it('shows the loading page with a login message', async () => {
    renderAt('/callback?code=abc');
    expect(screen.getByText('Loggar in...')).toBeInTheDocument();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled()); // let the effect settle
  });

  describe('with a code', () => {
    it('exchanges the code for a token and then goes home', async () => {
      renderAt('/callback?code=abc123');

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
      expect(exchangeCodeForToken).toHaveBeenCalledTimes(1);
      expect(exchangeCodeForToken).toHaveBeenCalledWith('abc123');
    });

    it('decodes the code from the URL', async () => {
      renderAt('/callback?code=abc%20def');
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(exchangeCodeForToken).toHaveBeenCalledWith('abc def');
    });

    it('ignores other query parameters', async () => {
      renderAt('/callback?state=xyz&code=abc&foo=bar');
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(exchangeCodeForToken).toHaveBeenCalledWith('abc');
    });

    it('waits for the exchange to finish before navigating', async () => {
      let finish!: () => void;
      exchangeCodeForToken.mockReturnValue(new Promise<void>((r) => { finish = r; }));
      renderAt('/callback?code=abc');

      await waitFor(() => expect(exchangeCodeForToken).toHaveBeenCalled());
      expect(mockNavigate).not.toHaveBeenCalled();

      await act(async () => { finish(); });
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('without a code', () => {
    it.each(['/callback', '/callback?state=xyz', '/callback?code='])(
      'goes home without exchanging anything for "%s"',
      async (url) => {
        renderAt(url);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
        expect(exchangeCodeForToken).not.toHaveBeenCalled();
      }
    );
  });

  describe('duplicate requests', () => {
    it('only exchanges the code once under StrictMode, which runs effects twice', async () => {
      renderAt('/callback?code=abc', { strict: true });

      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(exchangeCodeForToken).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not exchange again when the component rerenders', async () => {
      const { rerender } = renderAt('/callback?code=abc');
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());

      rerender(
        <MemoryRouter initialEntries={['/callback?code=abc']}>
          <AuthCallback />
        </MemoryRouter>
      );
      expect(exchangeCodeForToken).toHaveBeenCalledTimes(1);
    });
  });
});
