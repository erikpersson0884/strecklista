// src/tests/components/ActionPopupWindow.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ActionPopupWindow from '@/components/actionPopupWindow/ActionPopupWindow'; // adjust path
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));

const closeModal = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useModalContext).mockReturnValue({ closeModal } as any);
});

describe('ActionPopupWindow', () => {
  it('renders its children and title', () => {
    render(
      <ActionPopupWindow title="Ny vara">
        <p>Formulär</p>
      </ActionPopupWindow>
    );
    expect(screen.getByText('Formulär')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ny vara' })).toBeInTheDocument();
  });

  it('applies a custom className to the popup', () => {
    const { container } = render(
      <ActionPopupWindow className="custom"><p>x</p></ActionPopupWindow>
    );
    expect(container.firstChild).toHaveClass('popup-window', 'custom');
  });

  it('uses "Skapa" as the default accept button text', () => {
    render(<ActionPopupWindow><p>x</p></ActionPopupWindow>);
    expect(screen.getByRole('button', { name: 'Skapa' })).toBeInTheDocument();
  });

  it('uses custom accept button text', () => {
    render(<ActionPopupWindow acceptButtonText="Spara"><p>x</p></ActionPopupWindow>);
    expect(screen.getByRole('button', { name: 'Spara' })).toBeInTheDocument();
  });

  it('calls onAccept when the accept button is clicked', async () => {
    const onAccept = vi.fn();
    render(<ActionPopupWindow onAccept={onAccept}><p>x</p></ActionPopupWindow>);
    await userEvent.click(screen.getByRole('button', { name: 'Skapa' }));

    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onAccept).toHaveBeenCalledWith(); // the click event is not leaked through
  });

  it('falls back to onClose when onAccept is not provided', async () => {
    const onClose = vi.fn();
    render(<ActionPopupWindow onClose={onClose}><p>x</p></ActionPopupWindow>);
    await userEvent.click(screen.getByRole('button', { name: 'Skapa' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('prefers onAccept over onClose when both are provided', async () => {
    const onAccept = vi.fn();
    const onClose = vi.fn();
    render(
      <ActionPopupWindow onAccept={onAccept} onClose={onClose}><p>x</p></ActionPopupWindow>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Skapa' }));

    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not throw when neither callback is provided', async () => {
    render(<ActionPopupWindow><p>x</p></ActionPopupWindow>);
    await expect(
      userEvent.click(screen.getByRole('button', { name: 'Skapa' }))
    ).resolves.not.toThrow();
  });

  it('awaits an async onAccept', async () => {
    let resolve!: () => void;
    const onAccept = vi.fn(() => new Promise<void>((r) => { resolve = r; }));
    render(<ActionPopupWindow onAccept={onAccept}><p>x</p></ActionPopupWindow>);

    await userEvent.click(screen.getByRole('button', { name: 'Skapa' }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    resolve(); // let the promise settle so the test doesn't leave work hanging
  });

  it('disables the accept button and does not call onAccept when disabled', async () => {
    const onAccept = vi.fn();
    render(
      <ActionPopupWindow onAccept={onAccept} acceptButtonDisabled><p>x</p></ActionPopupWindow>
    );
    const button = screen.getByRole('button', { name: 'Skapa' });
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onAccept).not.toHaveBeenCalled();
  });
});