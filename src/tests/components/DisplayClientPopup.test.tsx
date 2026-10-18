// src/tests/components/DisplayClientPopup.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import DisplayClientPopup from '@/components/displayClientPopup/DisplayClientPopup'; // adjust path
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));

const client = {
  id: '01KP4C3XYVZNCQRAQ8D9MX21QK',
  displayName: 'P.R.I.T. Scanner',
  description: 'Beep beep!!',
  scope: 'items.read transactions.write',
} as any; // adjust to your Client shape

const writeText = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  vi.mocked(useModalContext).mockReturnValue({ closeModal: vi.fn() } as any);
});

const idButton = () => screen.getByRole('button', { name: new RegExp(client.id) });
const secretButton = (secret: string) => screen.getByRole('button', { name: new RegExp(secret) });

// Clicks and lets the async copy handler finish
const click = async (el: HTMLElement) => {
  await act(async () => { fireEvent.click(el); });
};
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

describe('DisplayClientPopup', () => {
  describe('rendering', () => {
    it('uses the default title', () => {
      render(<DisplayClientPopup client={client} />);
      expect(screen.getByRole('heading', { name: 'Klientinformation' })).toBeInTheDocument();
    });

    it('uses a custom title', () => {
      render(<DisplayClientPopup client={client} title="Ny klient" />);
      expect(screen.getByRole('heading', { name: 'Ny klient' })).toBeInTheDocument();
    });

    it('adds the display-client-popup class and a custom className', () => {
      const { container } = render(<DisplayClientPopup client={client} className="custom" />);
      expect(container.firstChild).toHaveClass('display-client-popup', 'custom');
    });

    // Fails on the current code: no className produces the class "undefined".
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('does not add an "undefined" class when no className is given', () => {
      const { container } = render(<DisplayClientPopup client={client} />);
      expect(container.firstChild).not.toHaveClass('undefined');
    });

    it('shows the name, description and id', () => {
      render(<DisplayClientPopup client={client} />);
      expect(screen.getByText('P.R.I.T. Scanner')).toBeInTheDocument();
      expect(screen.getByText('Beep beep!!')).toBeInTheDocument();
      expect(idButton()).toBeInTheDocument();
    });

    it('hides the description when there is none', () => {
      render(<DisplayClientPopup client={{ ...client, description: undefined }} />);
      expect(screen.queryByText('Beskrivning')).not.toBeInTheDocument();
    });

    it('hides the secret section when no secret is given', () => {
      render(<DisplayClientPopup client={client} />);
      expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    });

    it('shows the secret when given', () => {
      render(<DisplayClientPopup client={client} secret="s3cr3t" />);
      expect(screen.getByText('Secret')).toBeInTheDocument();
      expect(secretButton('s3cr3t')).toBeInTheDocument();
    });

    it('shows each scope as a readable pill', () => {
      render(<DisplayClientPopup client={client} />);
      expect(screen.getByText('read items')).toBeInTheDocument();
      expect(screen.getByText('write transactions')).toBeInTheDocument();
    });
  });

  describe('copying', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('copies the id and shows feedback instead of the icon', async () => {
      render(<DisplayClientPopup client={client} />);
      await click(idButton());

      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith(client.id);
      expect(screen.getByText('Kopierat!')).toBeInTheDocument();
      expect(screen.queryByAltText('Kopiera')).not.toBeInTheDocument();
    });

    it('copies the secret', async () => {
      render(<DisplayClientPopup client={client} secret="s3cr3t" />);
      await click(secretButton('s3cr3t'));
      expect(writeText).toHaveBeenCalledWith('s3cr3t');
    });

    it('shows feedback only on the field that was copied', async () => {
      render(<DisplayClientPopup client={client} secret="s3cr3t" />);
      await click(secretButton('s3cr3t'));

      expect(screen.getAllByText('Kopierat!')).toHaveLength(1);
      expect(screen.getAllByAltText('Kopiera')).toHaveLength(1); // the id button keeps its icon
    });

    it('brings the icon back after 1.5 seconds', async () => {
      render(<DisplayClientPopup client={client} />);
      await click(idButton());

      advance(1499);
      expect(screen.getByText('Kopierat!')).toBeInTheDocument();
      advance(1);
      expect(screen.queryByText('Kopierat!')).not.toBeInTheDocument();
      expect(screen.getByAltText('Kopiera')).toBeInTheDocument();
    });

    it('logs the error and shows no feedback when copying fails', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      writeText.mockRejectedValue(new Error('denied'));
      render(<DisplayClientPopup client={client} />);
      await click(idButton());

      expect(error).toHaveBeenCalledWith('Failed to copy', expect.any(Error));
      expect(screen.queryByText('Kopierat!')).not.toBeInTheDocument();
      error.mockRestore();
    });

    // Fails on the current code (see "overlapping timers" below).
    it.fails('keeps feedback for the full time when two fields are copied in a row', async () => {
      render(<DisplayClientPopup client={client} secret="s3cr3t" />);
      await click(idButton());
      advance(1000);
      await click(secretButton('s3cr3t'));
      advance(600); // 1.6 s after the first copy, 0.6 s after the second

      expect(screen.getByText('Kopierat!')).toBeInTheDocument();
    });
  });
});
